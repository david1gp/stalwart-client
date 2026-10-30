// Standalone bootstrap for the throwaway local Stalwart test instance.
//
// Usage (normally via start.sh, which sets these env vars):
//   STALWART_RT=podman STALWART_CONTAINER_NAME=stalwart-client-test \
//   STALWART_IMAGE=docker.io/stalwartlabs/stalwart:latest \
//   STALWART_HTTP_PORT=18080 STALWART_SMTP_PORT=10025 STALWART_IMAP_PORT=10143 \
//   STALWART_OPS_DIR=<abs path to ops/local-stalwart> \
//   STALWART_BASE_URL=http://127.0.0.1:18080 \
//   STALWART_RECOVERY_PASSWORD=... bun ops/local-stalwart/bootstrap.ts [--keep]
//
// Raw fetch() only — no imports from src/ (Bun globals only). Flow:
//   1. Wait for /healthz/ready on the recovery-mode container.
//   2. As the recovery admin: create domain `example.test`, set SystemSettings
//      (hostname + default domain), create the real admin account with a
//      generated password + Admin role, create test users alice + bob (and a
//      throwaway carol that is immediately destroyed to exercise x:Account
//      destroy).
//   3. Recreate the container WITHOUT the recovery env (normal mode) so all
//      listeners/queue managers come up and the recovery backdoor is gone.
//   4. Verify normal JMAP works as the new admin, write .env.local.
//
// With --keep the data volume is reused: objects are NOT created, only
// verified, then the container is restarted into normal mode and the admin
// login from the existing .env.local is re-verified.
//
// The server intentionally never enters "bootstrap mode" here: config.json is
// mounted from the start, so a fresh DB boots in normal mode (empty, with no
// accounts) and recovery mode is the documented path for initial setup
// (see docs/local-instance.md).

const BASE_URL = must("STALWART_BASE_URL")
const RT = must("STALWART_RT")
const CONTAINER = must("STALWART_CONTAINER_NAME")
const IMAGE = must("STALWART_IMAGE")
const HTTP_PORT = must("STALWART_HTTP_PORT")
const SMTP_PORT = process.env.STALWART_SMTP_PORT ?? "10025"
const IMAP_PORT = process.env.STALWART_IMAP_PORT ?? "10143"
const OPS_DIR = process.env.STALWART_OPS_DIR ?? "ops/local-stalwart"

export {}
const RECOVERY_PASSWORD = must("STALWART_RECOVERY_PASSWORD")
const KEEP_MODE = process.argv.includes("--keep")

const DOMAIN = "example.test"
const HOSTNAME = "mail.example.test"
const ADMIN_USER = "admin"
const ADMIN_PASSWORD = randomPassword(24)
const USER_A = "alice"
const USER_A_PASSWORD = randomPassword(16)
const USER_B = "bob"
const USER_B_PASSWORD = randomPassword(16)

function must(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`missing env ${name} (run via start.sh)`)
  return v
}

function randomPassword(n: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  const buf = new Uint8Array(n)
  crypto.getRandomValues(buf)
  return Array.from(buf, (b) => chars[b % chars.length]).join("")
}

function basic(user: string, pass: string): string {
  return "Basic " + Buffer.from(`${user}:${pass}`).toString("base64")
}

async function sleep(ms: number): Promise<void> {
  await new Promise((r) => setTimeout(r, ms))
}

async function waitForHealth(timeoutMs = 120_000): Promise<void> {
  const deadline = Date.now() + timeoutMs
  for (;;) {
    try {
      const res = await fetch(`${BASE_URL}/healthz/ready`)
      if (res.ok) return
    } catch {
      // not up yet
    }
    if (Date.now() > deadline) {
      throw new Error(`timed out waiting for ${BASE_URL}/healthz/ready`)
    }
    await sleep(1000)
  }
}

type JmapResponse = {
  methodResponses: Array<[string, Record<string, unknown>, string]>
  sessionState: string
}

async function jmap(auth: string, calls: Array<[string, Record<string, unknown>, string]>): Promise<JmapResponse> {
  const body = {
    using: ["urn:ietf:params:jmap:core", "urn:stalwart:jmap"],
    methodCalls: calls.map(([name, args, id]) => [name, args, id]),
  }
  const res = await fetch(`${BASE_URL}/jmap/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: auth },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error(`JMAP HTTP ${res.status}: ${await res.text()}`)
  }
  const json = (await res.json()) as JmapResponse
  for (const [name, data, id] of json.methodResponses) {
    const d = data as Record<string, Record<string, unknown>>
    if (name === "error") {
      throw new Error(`JMAP error on ${id}: ${JSON.stringify(data)}`)
    }
    for (const key of ["notCreated", "notUpdated", "notDestroyed"] as const) {
      if (d[key] && Object.keys(d[key]).length > 0) {
        throw new Error(`JMAP ${key} on ${id}: ${JSON.stringify(d[key])}`)
      }
    }
  }
  return json
}

function createdId(resp: JmapResponse, callId: string): string {
  const [, data] = resp.methodResponses.find(([, , id]) => id === callId) ?? []
  const created = (data as Record<string, Record<string, unknown>>)?.created
  if (!created) throw new Error(`no created in ${callId}: ${JSON.stringify(data)}`)
  return (Object.values(created)[0].id as string) ?? ""
}

function idsOf(resp: JmapResponse, callId: string): string[] {
  const [, data] = resp.methodResponses.find(([, , id]) => id === callId) ?? []
  return ((data as { ids?: string[] }).ids ?? []) as string[]
}

async function sh(...args: string[]): Promise<void> {
  const proc = Bun.spawn(args, { stdout: "inherit", stderr: "inherit" })
  const code = await proc.exited
  if (code !== 0) throw new Error(`command failed (${code}): ${args.join(" ")}`)
}

async function recreateNormal(): Promise<void> {
  console.log("==> recreating container in normal mode (dropping recovery env)")
  const usernsArgs = RT === "podman" ? ["--userns=keep-id:uid=2000,gid=2000"] : []
  await sh(RT, "rm", "-f", CONTAINER)
  await sh(
    RT,
    "run",
    "-d",
    "--name",
    CONTAINER,
    ...usernsArgs,
    "-p",
    `127.0.0.1:${HTTP_PORT}:8080`,
    "-p",
    `127.0.0.1:${SMTP_PORT}:25`,
    "-p",
    `127.0.0.1:${IMAP_PORT}:143`,
    "-v",
    `${OPS_DIR}/config.json:/etc/stalwart/config.json:ro`,
    "-v",
    `${OPS_DIR}/data:/var/lib/stalwart`,
    IMAGE,
  )
  console.log(`==> waiting for ${BASE_URL}/healthz/ready (normal mode)`)
  await waitForHealth()
}

// Verify normal JMAP as admin. Returns the ids found, for .env.local.
// In --keep mode credentials/expected ids come from the existing .env.local.
async function verifyNormalAsAdmin(opts: {
  auth: string
  expectDomainId?: string
}): Promise<{ accountId: string; username: string; domainIds: string[] }> {
  const sessionRes = await fetch(`${BASE_URL}/jmap/session`, {
    headers: { Authorization: opts.auth },
  })
  if (!sessionRes.ok) throw new Error(`admin session HTTP ${sessionRes.status}`)
  const session = (await sessionRes.json()) as {
    username: string
    accounts: Record<string, { name: string }>
  }
  console.log(`    admin session ok: ${session.username}`)
  const accountId = Object.keys(session.accounts)[0]
  const verify = await jmap(opts.auth, [["x:Domain/query", { accountId, limit: 10 }, "c0"]])
  const domainIds = idsOf(verify, "c0")
  if (opts.expectDomainId && !domainIds.includes(opts.expectDomainId)) {
    throw new Error(`domain ${opts.expectDomainId} missing: ${domainIds}`)
  }
  console.log(`    domain query ok: ${domainIds}`)
  return { accountId, username: session.username, domainIds }
}

async function readEnvLocal(): Promise<Record<string, string>> {
  const text = await Bun.file(`${OPS_DIR}/.env.local`).text()
  const out: Record<string, string> = {}
  for (const line of text.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (m) out[m[1]] = m[2].trim()
  }
  return out
}

const recoveryAuth = basic("admin", RECOVERY_PASSWORD)

async function recoveryAccount(): Promise<string> {
  const res = await fetch(`${BASE_URL}/jmap/session`, {
    headers: { Authorization: recoveryAuth },
  })
  if (!res.ok) throw new Error(`recovery session HTTP ${res.status}`)
  const session = (await res.json()) as { accounts: Record<string, unknown> }
  const accountIds = Object.keys(session.accounts)
  if (accountIds.length !== 1) {
    throw new Error(`expected 1 recovery account, got ${accountIds.length}`)
  }
  return accountIds[0]
}

// --- main ------------------------------------------------------------------

console.log(`==> waiting for ${BASE_URL}/healthz/ready (recovery mode)`)
await waitForHealth()
const recAccount = await recoveryAccount()
console.log(`    recovery session ok (account ${recAccount})`)

if (KEEP_MODE) {
  // Data volume already bootstrapped: verify objects exist, restart normal.
  console.log("==> --keep: verifying existing data, skipping object creation")
  const existing = await jmap(recoveryAuth, [
    ["x:Domain/query", { accountId: recAccount, limit: 10 }, "c0"],
    ["x:Account/query", { accountId: recAccount, limit: 10 }, "c1"],
  ])
  const domainIds = idsOf(existing, "c0")
  const accountIds = idsOf(existing, "c1")
  if (domainIds.length === 0 || accountIds.length === 0) {
    throw new Error(
      "--keep found no domains/accounts in the data volume; " + "run start.sh without --keep for a clean bootstrap",
    )
  }
  console.log(`    found domains=${domainIds} accounts=${accountIds}`)
  await recreateNormal()
  const prev = await readEnvLocal()
  if (prev.STALWART_BASE_URL !== BASE_URL) {
    throw new Error(`--keep: base URL changed (${prev.STALWART_BASE_URL} != ${BASE_URL})`)
  }
  await verifyNormalAsAdmin({
    auth: basic(prev.STALWART_USERNAME, prev.STALWART_PASSWORD),
    expectDomainId: prev.STALWART_DOMAIN_ID,
  })
  console.log("--keep restart complete: normal JMAP verified as admin.")
  process.exit(0)
}

// 1. Domain
console.log(`==> creating domain ${DOMAIN}`)
const domainResp = await jmap(recoveryAuth, [
  ["x:Domain/set", { accountId: recAccount, create: { d1: { name: DOMAIN } } }, "c0"],
])
const domainId = createdId(domainResp, "c0")
console.log(`    domain id: ${domainId}`)

// 2. SystemSettings: hostname + default domain (bare-username login, routing).
console.log(`==> setting SystemSettings (hostname=${HOSTNAME})`)
await jmap(recoveryAuth, [
  [
    "x:SystemSettings/set",
    {
      accountId: recAccount,
      update: {
        singleton: { defaultHostname: HOSTNAME, defaultDomainId: domainId },
      },
    },
    "c0",
  ],
  // Test-only: raise HTTP rate limits and JMAP concurrency so parallel e2e
  // suites (many suites at once from one IP) are not throttled. Defaults are
  // 1000/min authenticated, 100/min anonymous, 4 concurrent requests.
  [
    "x:Http/set",
    {
      accountId: recAccount,
      update: {
        singleton: {
          rateLimitAuthenticated: { count: 100000, period: 60000 },
          rateLimitAnonymous: { count: 10000, period: 60000 },
        },
      },
    },
    "c1",
  ],
  [
    "x:Jmap/set",
    {
      accountId: recAccount,
      update: { singleton: { maxConcurrentRequests: 64, maxConcurrentUploads: 32 } },
    },
    "c2",
  ],
  // Test-only: let non-admin users run Principal/query. Since Stalwart v1 the
  // non-admin path needs Sharing.allowDirectoryQueries (the old
  // JmapPrincipalQuery bypass became SysAccountQuery).
  [
    "x:Sharing/set",
    {
      accountId: recAccount,
      update: { singleton: { allowDirectoryQueries: true } },
    },
    "c3",
  ],
])

// 3. Real admin account + password credential + Admin role.
console.log(`==> creating admin ${ADMIN_USER}@${DOMAIN}`)
const adminResp = await jmap(recoveryAuth, [
  [
    "x:Account/set",
    {
      accountId: recAccount,
      create: {
        a1: {
          "@type": "User",
          name: ADMIN_USER,
          domainId,
          description: "System administrator",
        },
      },
    },
    "c0",
  ],
])
const createdAdminId = createdId(adminResp, "c0")
await jmap(recoveryAuth, [
  [
    "x:Account/set",
    {
      accountId: recAccount,
      update: {
        [createdAdminId]: {
          credentials: { 0: { "@type": "Password", secret: ADMIN_PASSWORD } },
          roles: { "@type": "Admin" },
        },
      },
    },
    "c1",
  ],
])
console.log(`    admin account id: ${createdAdminId}`)

// 4. Test users alice + bob (+ throwaway carol, destroyed immediately).
console.log(`==> creating test users ${USER_A}, ${USER_B} (+ throwaway carol)`)
const usersResp = await jmap(recoveryAuth, [
  [
    "x:Account/set",
    {
      accountId: recAccount,
      create: {
        u1: {
          "@type": "User",
          name: USER_A,
          domainId,
          credentials: { 0: { "@type": "Password", secret: USER_A_PASSWORD } },
        },
        u2: {
          "@type": "User",
          name: USER_B,
          domainId,
          credentials: { 0: { "@type": "Password", secret: USER_B_PASSWORD } },
        },
        u3: { "@type": "User", name: "carol", domainId },
      },
    },
    "c0",
  ],
])
const created = (
  usersResp.methodResponses.find(([, , id]) => id === "c0")?.[1] as unknown as {
    created: Record<string, { id: string }>
  }
).created
const aliceId = created.u1.id
const bobId = created.u2.id
const carolId = created.u3.id
console.log(`    alice=${aliceId} bob=${bobId} carol=${carolId} (destroying carol)`)
await jmap(recoveryAuth, [["x:Account/set", { accountId: recAccount, destroy: [carolId] }, "c0"]])
const afterDestroy = await jmap(recoveryAuth, [["x:Account/query", { accountId: recAccount, limit: 10 }, "c0"]])
console.log(`    accounts after destroy: ${idsOf(afterDestroy, "c0")}`)

// 5. Normal mode + verify + .env.local.
const adminLogin = `${ADMIN_USER}@${DOMAIN}`
const adminAuth = basic(adminLogin, ADMIN_PASSWORD)
await recreateNormal()
const { accountId: adminAccountId } = await verifyNormalAsAdmin({
  auth: adminAuth,
  expectDomainId: domainId,
})

const envLocal =
  [
    "# Generated by ops/local-stalwart/bootstrap.ts — do not commit.",
    `STALWART_BASE_URL=${BASE_URL}`,
    `STALWART_USERNAME=${adminLogin}`,
    `STALWART_PASSWORD=${ADMIN_PASSWORD}`,
    `STALWART_DOMAIN_ID=${domainId}`,
    `STALWART_ADMIN_ACCOUNT_ID=${adminAccountId}`,
    `STALWART_DOMAIN=${DOMAIN}`,
    `STALWART_USER_A=${USER_A}@${DOMAIN}`,
    `STALWART_USER_A_PASSWORD=${USER_A_PASSWORD}`,
    `STALWART_USER_A_ACCOUNT_ID=${aliceId}`,
    `STALWART_USER_B=${USER_B}@${DOMAIN}`,
    `STALWART_USER_B_PASSWORD=${USER_B_PASSWORD}`,
    `STALWART_USER_B_ACCOUNT_ID=${bobId}`,
  ].join("\n") + "\n"
await Bun.write(`${OPS_DIR}/.env.local`, envLocal)
console.log(`==> wrote ${OPS_DIR}/.env.local`)
console.log("bootstrap complete: normal JMAP verified as admin.")
