#!/usr/bin/env bun
/**
 * Verify the generated registry types against the LOCAL Stalwart instance.
 *
 * - Reads credentials from ops/local-stalwart/.env.local (never touches any
 *   non-loopback host; refuses to run otherwise).
 * - For each listed object: `x:<T>/query` first (non-singletons), then
 *   `x:<T>/get`, and checks every returned property key against the property
 *   list parsed from the generated `src/registry/generated/*.ts` sources.
 * - Does one create -> destroy round trip of a throwaway Domain shaped like
 *   `RegistryDomainCreate` to validate the create-type rules.
 * - Raw `fetch` only; no `src/` imports (generated files are read as text).
 */

import { readdir, readFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { randomBytes } from "node:crypto"

const thisDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = dirname(thisDir)
const generatedDir = join(repoRoot, "src", "registry", "generated")

const CHECK_OBJECTS = [
  "Domain",
  "Account",
  "Role",
  "NetworkListener",
  "DkimSignature",
  "MtaRoute",
  "MtaConnectionStrategy",
  "SystemSettings",
  "Imap",
  "Jmap",
  "Security",
  "SpamSettings",
  "Authentication",
  "DnsResolver",
]

async function envLocal(): Promise<Record<string, string>> {
  const text = await readFile(join(repoRoot, "ops", "local-stalwart", ".env.local"), "utf8")
  const env: Record<string, string> = {}
  for (const line of text.split("\n")) {
    const trimmed = line.trim()
    if (trimmed === "" || trimmed.startsWith("#")) {
      continue
    }
    const equals = trimmed.indexOf("=")
    if (equals > 0) {
      env[trimmed.slice(0, equals)] = trimmed.slice(equals + 1)
    }
  }
  return env
}

function jmapCall(
  baseUrl: string,
  auth: string,
  methodCalls: unknown[],
): Promise<{ methodResponses: [string, Record<string, unknown>, string][] }> {
  return fetch(`${baseUrl}/jmap/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({
      using: ["urn:ietf:params:jmap:core", "urn:stalwart:jmap"],
      methodCalls,
    }),
  }).then(async (response) => {
    if (!response.ok) {
      throw new Error(`verify: JMAP HTTP ${response.status}`)
    }
    return (await response.json()) as {
      methodResponses: [string, Record<string, unknown>, string][]
    }
  })
}

function generatedPropKeys(files: Map<string, string>, file: string, seen: Set<string>): Set<string> {
  if (seen.has(file)) {
    return new Set<string>()
  }
  seen.add(file)
  const content = files.get(file)
  if (content === undefined) {
    throw new Error(`verify: generated file missing: ${file}`)
  }
  const keys = new Set<string>()
  // Union file: `({ "@type": "X" } & RegistryMember)` or `{ "@type": "X" }`.
  if (content.includes(`"@type"`)) {
    keys.add("@type")
  }
  // NOTE: literal spaces only (` {2}` miscompiles on this runtime) and
  // character classes instead of `\{`/`\}` punctuation escapes.
  for (const match of content.matchAll(/[{] "@type": "[^"]+" [}] & ([A-Za-z_][A-Za-z0-9_]*)[)]/g)) {
    for (const key of generatedPropKeys(files, `${match[1]}.ts`, seen)) {
      keys.add(key)
    }
  }
  // Interface file: two literal spaces then `propName:` / `propName?:`
  // (note: `/^ {2} /` miscompiles on this runtime, so spell spaces out).
  for (const match of content.matchAll(/^  ([A-Za-z_][A-Za-z0-9_]*)(\?)?: /gm)) {
    keys.add(match[1] ?? "")
  }
  return keys
}

const env = await envLocal()
const baseUrl = env["STALWART_BASE_URL"] ?? ""
const username = env["STALWART_USERNAME"] ?? ""
const password = env["STALWART_PASSWORD"] ?? ""
const accountId = env["STALWART_ADMIN_ACCOUNT_ID"] ?? ""
if (baseUrl === "" || username === "" || password === "" || accountId === "") {
  throw new Error("verify: .env.local misses STALWART_* entries")
}
const host = new URL(baseUrl).hostname
if (host !== "127.0.0.1" && host !== "localhost" && host !== "::1") {
  throw new Error(`verify: refusing non-local host ${host}`)
}
const auth = Buffer.from(`${username}:${password}`).toString("base64")

const files = new Map<string, string>()
for (const file of (await readdir(generatedDir)).filter((f) => f.endsWith(".ts"))) {
  files.set(file, await readFile(join(generatedDir, file), "utf8"))
}
const objectTypesSource = files.get("registryObjectTypes.ts") ?? ""

let failures = 0
let checked = 0

for (const name of CHECK_OBJECTS) {
  const kindMatch = objectTypesSource.match(
    new RegExp(`^  ${name}: \\{\\n(?:.*\\n)*?    kind: "(object|singleton)"`, "m"),
  )
  const kind = kindMatch?.[1] ?? "object"
  let ids: string[] = []
  if (kind === "object") {
    const query = await jmapCall(baseUrl, auth, [[`x:${name}/query`, { accountId, limit: 25 }, "q"]])
    const response = query.methodResponses[0]?.[1] ?? {}
    if ("ids" in response) {
      ids = (response["ids"] as string[]).slice(0, 10)
    } else {
      console.log(`- ${name}: query not applicable (${JSON.stringify(response).slice(0, 120)}), skipped`)
      continue
    }
  } else {
    ids = ["singleton"]
  }
  const get = await jmapCall(baseUrl, auth, [[`x:${name}/get`, { accountId, ids }, "g"]])
  const body = get.methodResponses[0]?.[1] ?? {}
  const list = (body["list"] as Record<string, unknown>[]) ?? []
  if (list.length === 0) {
    console.log(`- ${name} (${kind}): 0 objects, key check skipped`)
    continue
  }
  const generated = generatedPropKeys(files, `Registry${name}.ts`, new Set())
  generated.add("id")
  const live = new Set<string>()
  for (const item of list) {
    for (const key of Object.keys(item)) {
      live.add(key)
    }
  }
  const unknown = [...live].filter((key) => !generated.has(key)).sort()
  const missing = [...generated].filter((key) => !live.has(key)).sort()
  checked += 1
  if (unknown.length > 0) {
    failures += 1
    console.log(`- ${name} (${kind}, ${list.length} objects): UNKNOWN keys: ${unknown.join(", ")}`)
  } else {
    console.log(`- ${name} (${kind}, ${list.length} objects): all ${live.size} keys known`)
  }
  if (missing.length > 0) {
    console.log(`  missing from responses (in types, not on wire): ${missing.join(", ")}`)
  }
}

// Create -> destroy round trip of a throwaway Domain.
const suffix = randomBytes(3).toString("hex")
const probeName = `typegen-min-${suffix}.test`
const fullName = `typegen-${suffix}.test`

// Probe: minimal input (spec rule says more is required; the server is known
// to fill absent create props with defaults, so this documents behavior).
const probeCreate = await jmapCall(baseUrl, auth, [
  [`x:Domain/set`, { accountId, create: { d1: { name: probeName } } }, "c"],
])
const probeCreated = (probeCreate.methodResponses[0]?.[1] as { created?: Record<string, { id: string }> }).created?.[
  "d1"
]?.id
console.log(
  `- Domain minimal create {name}: ${probeCreated !== undefined ? `accepted (id ${probeCreated})` : "rejected"}`,
)

// Conformance: RegistryDomainCreate-shaped input (all required props set).
const fullInput = {
  name: fullName,
  aliases: {},
  allowRelaying: false,
  allowScimProvisioning: false,
  certificateManagement: { "@type": "Manual" },
  dkimManagement: { "@type": "Manual" },
  dnsManagement: { "@type": "Manual" },
  subAddressing: { "@type": "Enabled" },
}
const fullCreate = await jmapCall(baseUrl, auth, [[`x:Domain/set`, { accountId, create: { d2: fullInput } }, "c"]])
const fullCreated = (fullCreate.methodResponses[0]?.[1] as { created?: Record<string, { id: string }> }).created?.["d2"]
  ?.id
if (fullCreated === undefined) {
  failures += 1
  console.log(`- Domain full create: REJECTED ${JSON.stringify(fullCreate.methodResponses[0]?.[1]).slice(0, 300)}`)
} else {
  console.log(`- Domain RegistryDomainCreate-shaped create: accepted (id ${fullCreated})`)
  const get = await jmapCall(baseUrl, auth, [[`x:Domain/get`, { accountId, ids: [fullCreated] }, "g"]])
  const item = ((get.methodResponses[0]?.[1] as { list?: Record<string, unknown>[] }).list ?? [])[0]
  if (item === undefined) {
    failures += 1
    console.log("- Domain get after create: NOT FOUND")
  } else {
    const generated = generatedPropKeys(files, "RegistryDomain.ts", new Set())
    generated.add("id")
    const unknown = Object.keys(item).filter((key) => !generated.has(key))
    if (unknown.length > 0) {
      failures += 1
      console.log(`- Domain round-trip get: UNKNOWN keys: ${unknown.join(", ")}`)
    } else {
      console.log(`- Domain round-trip get: all ${Object.keys(item).length} keys known`)
    }
  }
}

const destroyIds = [probeCreated, fullCreated].filter((id) => id !== undefined)
if (destroyIds.length > 0) {
  // Creating a domain auto-provisions DkimSignature objects linked to it,
  // which block the destroy with objectIsLinked: remove those first.
  const sigQuery = await jmapCall(baseUrl, auth, [[`x:DkimSignature/query`, { accountId, limit: 100 }, "q"]])
  const sigIds = (sigQuery.methodResponses[0]?.[1] as { ids?: string[] }).ids ?? []
  if (sigIds.length > 0) {
    const sigGet = await jmapCall(baseUrl, auth, [[`x:DkimSignature/get`, { accountId, ids: sigIds }, "g"]])
    const sigList = (sigGet.methodResponses[0]?.[1] as { list?: { id: string; domainId?: string }[] }).list ?? []
    const linked = sigList
      .filter((sig) => sig.domainId !== undefined && destroyIds.includes(sig.domainId))
      .map((sig) => sig.id)
    if (linked.length > 0) {
      await jmapCall(baseUrl, auth, [[`x:DkimSignature/set`, { accountId, destroy: linked }, "c"]])
      console.log(`- Domain cleanup: destroyed ${linked.length} linked signatures`)
    }
  }
  const destroy = await jmapCall(baseUrl, auth, [[`x:Domain/set`, { accountId, destroy: destroyIds }, "c"]])
  const destroyed = (destroy.methodResponses[0]?.[1] as { destroyed?: string[] }).destroyed ?? []
  console.log(`- Domain destroy: ${destroyed.length}/${destroyIds.length} destroyed`)
  if (destroyed.length !== destroyIds.length) {
    failures += 1
  }
}

console.log(`verify: ${checked} objects key-checked, ${failures} failures`)
if (failures > 0) {
  process.exit(1)
}
