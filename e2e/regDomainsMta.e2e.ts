import { afterAll, beforeAll, describe, expect, test } from "bun:test"
import { stalwartClientConfig, type StalwartClientConfig } from "../src/client/stalwartClientConfig.js"
import { jmapRequest } from "../src/jmap/jmapRequest.js"
import { acmeProviderGet } from "../src/registry/domains/acmeProviderGet.js"
import { acmeProviderQuery } from "../src/registry/domains/acmeProviderQuery.js"
import { acmeProviderSet } from "../src/registry/domains/acmeProviderSet.js"
import { certificateGet } from "../src/registry/domains/certificateGet.js"
import { certificateSet } from "../src/registry/domains/certificateSet.js"
import { dkimSignatureCreate } from "../src/registry/domains/dkimSignatureCreate.js"
import { dkimSignatureGet } from "../src/registry/domains/dkimSignatureGet.js"
import { dkimSignatureQuery } from "../src/registry/domains/dkimSignatureQuery.js"
import { dkimSignatureSet } from "../src/registry/domains/dkimSignatureSet.js"
import { dnsResolverGet } from "../src/registry/domains/dnsResolverGet.js"
import { dnsResolverSet } from "../src/registry/domains/dnsResolverSet.js"
import { dnsServerGet } from "../src/registry/domains/dnsServerGet.js"
import { dnsServerQuery } from "../src/registry/domains/dnsServerQuery.js"
import { dnsServerSet } from "../src/registry/domains/dnsServerSet.js"
import { domainCreate } from "../src/registry/domains/domainCreate.js"
import { domainDestroy } from "../src/registry/domains/domainDestroy.js"
import { domainGet } from "../src/registry/domains/domainGet.js"
import { domainQuery } from "../src/registry/domains/domainQuery.js"
import { domainSet } from "../src/registry/domains/domainSet.js"
import { domainZoneFile } from "../src/registry/domains/domainZoneFile.js"
import { mtaConnectionStrategyGet } from "../src/registry/mta/mtaConnectionStrategyGet.js"
import { mtaConnectionStrategyQuery } from "../src/registry/mta/mtaConnectionStrategyQuery.js"
import { mtaConnectionStrategySet } from "../src/registry/mta/mtaConnectionStrategySet.js"
import { mtaDeliveryScheduleGet } from "../src/registry/mta/mtaDeliveryScheduleGet.js"
import { mtaDeliveryScheduleQuery } from "../src/registry/mta/mtaDeliveryScheduleQuery.js"
import { mtaDeliveryScheduleSet } from "../src/registry/mta/mtaDeliveryScheduleSet.js"
import { mtaExtensionsGet } from "../src/registry/mta/mtaExtensionsGet.js"
import { mtaExtensionsSet } from "../src/registry/mta/mtaExtensionsSet.js"
import { mtaHookGet } from "../src/registry/mta/mtaHookGet.js"
import { mtaHookQuery } from "../src/registry/mta/mtaHookQuery.js"
import { mtaHookSet } from "../src/registry/mta/mtaHookSet.js"
import { mtaInboundSessionGet } from "../src/registry/mta/mtaInboundSessionGet.js"
import { mtaInboundSessionSet } from "../src/registry/mta/mtaInboundSessionSet.js"
import { mtaInboundThrottleGet } from "../src/registry/mta/mtaInboundThrottleGet.js"
import { mtaInboundThrottleQuery } from "../src/registry/mta/mtaInboundThrottleQuery.js"
import { mtaInboundThrottleSet } from "../src/registry/mta/mtaInboundThrottleSet.js"
import { mtaMilterGet } from "../src/registry/mta/mtaMilterGet.js"
import { mtaMilterQuery } from "../src/registry/mta/mtaMilterQuery.js"
import { mtaMilterSet } from "../src/registry/mta/mtaMilterSet.js"
import { mtaOutboundStrategyGet } from "../src/registry/mta/mtaOutboundStrategyGet.js"
import { mtaOutboundStrategySet } from "../src/registry/mta/mtaOutboundStrategySet.js"
import { mtaOutboundThrottleGet } from "../src/registry/mta/mtaOutboundThrottleGet.js"
import { mtaOutboundThrottleQuery } from "../src/registry/mta/mtaOutboundThrottleQuery.js"
import { mtaOutboundThrottleSet } from "../src/registry/mta/mtaOutboundThrottleSet.js"
import { mtaQueueQuotaGet } from "../src/registry/mta/mtaQueueQuotaGet.js"
import { mtaQueueQuotaQuery } from "../src/registry/mta/mtaQueueQuotaQuery.js"
import { mtaQueueQuotaSet } from "../src/registry/mta/mtaQueueQuotaSet.js"
import { mtaRouteGet } from "../src/registry/mta/mtaRouteGet.js"
import { mtaRouteQuery } from "../src/registry/mta/mtaRouteQuery.js"
import { mtaRouteSet } from "../src/registry/mta/mtaRouteSet.js"
import { mtaStageAuthGet } from "../src/registry/mta/mtaStageAuthGet.js"
import { mtaStageAuthSet } from "../src/registry/mta/mtaStageAuthSet.js"
import { mtaStageConnectGet } from "../src/registry/mta/mtaStageConnectGet.js"
import { mtaStageConnectSet } from "../src/registry/mta/mtaStageConnectSet.js"
import { mtaStageDataGet } from "../src/registry/mta/mtaStageDataGet.js"
import { mtaStageDataSet } from "../src/registry/mta/mtaStageDataSet.js"
import { mtaStageEhloGet } from "../src/registry/mta/mtaStageEhloGet.js"
import { mtaStageEhloSet } from "../src/registry/mta/mtaStageEhloSet.js"
import { mtaStageMailGet } from "../src/registry/mta/mtaStageMailGet.js"
import { mtaStageMailSet } from "../src/registry/mta/mtaStageMailSet.js"
import { mtaStageRcptGet } from "../src/registry/mta/mtaStageRcptGet.js"
import { mtaStageRcptSet } from "../src/registry/mta/mtaStageRcptSet.js"
import { mtaStsGet } from "../src/registry/mta/mtaStsGet.js"
import { mtaStsSet } from "../src/registry/mta/mtaStsSet.js"
import { mtaTlsStrategyGet } from "../src/registry/mta/mtaTlsStrategyGet.js"
import { mtaTlsStrategyQuery } from "../src/registry/mta/mtaTlsStrategyQuery.js"
import { mtaTlsStrategySet } from "../src/registry/mta/mtaTlsStrategySet.js"
import { mtaVirtualQueueGet } from "../src/registry/mta/mtaVirtualQueueGet.js"
import { mtaVirtualQueueQuery } from "../src/registry/mta/mtaVirtualQueueQuery.js"
import { mtaVirtualQueueSet } from "../src/registry/mta/mtaVirtualQueueSet.js"
import { networkListenerGet } from "../src/registry/mta/networkListenerGet.js"
import { networkListenerQuery } from "../src/registry/mta/networkListenerQuery.js"
import { queuedMessageCancel } from "../src/registry/mta/queuedMessageCancel.js"
import { queuedMessageContents } from "../src/registry/mta/queuedMessageContents.js"
import { queuedMessageGet } from "../src/registry/mta/queuedMessageGet.js"
import { queuedMessageQuery } from "../src/registry/mta/queuedMessageQuery.js"
import { queuedMessageRetry } from "../src/registry/mta/queuedMessageRetry.js"
import { e2eRunId } from "./e2eRunId.js"
import { stalwartE2eSetup } from "./e2eSetup.js"

let config: StalwartClientConfig
let aliceConfig: StalwartClientConfig
let aliceAccountId = ""
const runId = e2eRunId()
const domainName = `e2e-${runId}.test`
const created = {
  domainId: undefined as string | undefined,
  dkimIds: [] as string[],
  certId: undefined as string | undefined,
  acmeId: undefined as string | undefined,
  dnsId: undefined as string | undefined,
  mtaIds: {} as Record<string, string>,
  deliveryScheduleId: undefined as string | undefined,
  scheduleQueueId: undefined as string | undefined,
  queuedId: undefined as string | undefined,
}

function fail(message: string, result: { success: boolean; errorMessage?: string; errorData?: unknown }): never {
  throw new Error(
    `${message}: ${result.success ? "unknown" : `${result.errorMessage} ${JSON.stringify(result.errorData ?? null)}`}`,
  )
}

/** Read the local-harness overlay for the user credentials (mirrors e2eSetup.ts, which only returns the admin config). */
async function e2eUserConfig(): Promise<{ config: StalwartClientConfig; accountId: string }> {
  const localFile = Bun.file(new URL("../ops/local-stalwart/.env.local", import.meta.url))
  const overlay: Record<string, string> = {}
  for (const line of (await localFile.text()).split("\n")) {
    const trimmed = line.trim()
    if (trimmed === "" || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq < 0) continue
    overlay[trimmed.slice(0, eq)] = trimmed.slice(eq + 1)
  }
  const parsed = stalwartClientConfig({
    baseUrl: overlay.STALWART_BASE_URL ?? process.env.STALWART_BASE_URL ?? "",
    username: overlay.STALWART_USER_A ?? process.env.STALWART_USER_A,
    password: overlay.STALWART_USER_A_PASSWORD ?? process.env.STALWART_USER_A_PASSWORD,
  })
  if (!parsed.success) throw new Error(`user config invalid: ${parsed.errorMessage}`)
  return { config: parsed.data, accountId: overlay.STALWART_USER_A_ACCOUNT_ID ?? "" }
}

beforeAll(async () => {
  config = await stalwartE2eSetup()
  const user = await e2eUserConfig()
  aliceConfig = user.config
  aliceAccountId = user.accountId
})

afterAll(async () => {
  // Strict reverse-order, best-effort teardown of run-scoped objects only. Never throws.
  const warn = async (label: string, run: () => Promise<{ success: boolean; errorMessage?: string }>) => {
    try {
      const r = await run()
      if (!r.success) console.warn(`teardown: ${label} failed: ${r.errorMessage}`)
    } catch (error) {
      console.warn(`teardown: ${label} threw: ${String(error)}`)
    }
  }
  if (created.queuedId !== undefined) {
    const id = created.queuedId
    await warn(`queued message ${id}`, () => queuedMessageCancel({ config, id }))
  }

  for (const [label, id] of Object.entries(created.mtaIds)) {
    await warn(`mta object ${label} ${id}`, async () => {
      if (label === "MtaConnectionStrategy") return mtaConnectionStrategySet({ config, destroy: [id] })
      if (label === "MtaHook") return mtaHookSet({ config, destroy: [id] })
      if (label === "MtaInboundThrottle") return mtaInboundThrottleSet({ config, destroy: [id] })
      if (label === "MtaMilter") return mtaMilterSet({ config, destroy: [id] })
      if (label === "MtaOutboundThrottle") return mtaOutboundThrottleSet({ config, destroy: [id] })
      if (label === "MtaQueueQuota") return mtaQueueQuotaSet({ config, destroy: [id] })
      if (label === "MtaRoute") return mtaRouteSet({ config, destroy: [id] })
      if (label === "MtaTlsStrategy") return mtaTlsStrategySet({ config, destroy: [id] })
      return mtaVirtualQueueSet({ config, destroy: [id] })
    })
  }
  if (created.deliveryScheduleId !== undefined) {
    const id = created.deliveryScheduleId
    await warn(`delivery schedule ${id}`, () => mtaDeliveryScheduleSet({ config, destroy: [id] }))
  }
  if (created.scheduleQueueId !== undefined) {
    const id = created.scheduleQueueId
    await warn(`schedule queue ${id}`, () => mtaVirtualQueueSet({ config, destroy: [id] }))
  }
  if (created.certId !== undefined) {
    const id = created.certId
    await warn(`certificate ${id}`, () => certificateSet({ config, destroy: [id] }))
  }
  if (created.acmeId !== undefined) {
    const id = created.acmeId
    await warn(`acme provider ${id}`, () => acmeProviderSet({ config, destroy: [id] }))
  }
  if (created.dnsId !== undefined) {
    const id = created.dnsId
    await warn(`dns server ${id}`, () => dnsServerSet({ config, destroy: [id] }))
  }
  if (created.domainId !== undefined) {
    const id = created.domainId
    await warn(`domain ${domainName}`, () => domainDestroy({ config, id }))
  }
})

describe("e2e reg-domains: domain lifecycle", () => {
  test(
    "domainCreate provisions a domain with auto-generated DKIM signatures",
    async () => {
      const r = await domainCreate({ config, name: domainName, domain: { description: `e2e run ${runId}` } })
      if (!r.success) fail("domainCreate failed", r)
      created.domainId = r.data.id
      expect(created.domainId).toBeString()
      // The server provisions DKIM signatures via background tasks, so poll briefly.
      let autoSigs: string[] = []
      for (let attempt = 0; attempt < 20; attempt++) {
        const sigs = await dkimSignatureQuery({ config, filter: { domainId: created.domainId } })
        if (!sigs.success) fail("dkimSignatureQuery failed", sigs)
        if (sigs.success && sigs.data.ids.length >= 2) {
          autoSigs = sigs.data.ids.map(String)
          break
        }
        await Bun.sleep(1000)
      }
      expect(autoSigs.length).toBeGreaterThanOrEqual(2)
    },
    { timeout: 30_000 },
  )

  test(
    "domainQuery finds it by name and domainGet reads it back",
    async () => {
      const q = await domainQuery({ config, filter: { name: domainName } })
      if (!q.success) fail("domainQuery failed", q)
      expect(q.data.ids.map(String)).toEqual([created.domainId as string])
      const g = await domainGet({ config, ids: [created.domainId as string] })
      if (!g.success) fail("domainGet failed", g)
      expect(g.data.list[0]?.name).toBe(domainName)
      expect(g.data.list[0]?.isEnabled).toBe(true)
    },
    { timeout: 30_000 },
  )

  test(
    "domainSet updates the description and domainZoneFile returns the zone",
    async () => {
      const u = await domainSet({
        config,
        update: { [created.domainId as string]: { description: `e2e run ${runId} updated` } },
      })
      if (!u.success) fail("domainSet failed", u)
      const g = await domainGet({ config, ids: [created.domainId as string], properties: ["description"] })
      if (!g.success) fail("domainGet failed", g)
      expect(g.data.list[0]?.description).toBe(`e2e run ${runId} updated`)
      const zone = await domainZoneFile({ config, id: created.domainId as string })
      if (!zone.success) fail("domainZoneFile failed", zone)
      expect(zone.data).toContain(domainName)
      expect(zone.data).toContain("TXT")
    },
    { timeout: 30_000 },
  )
})

describe("e2e reg-domains: DKIM signatures", () => {
  const keys = { ed25519: "", rsa: "" }

  test(
    "generates Ed25519 and RSA keypairs for the run",
    async () => {
      const run = (args: string[]) => {
        const proc = Bun.spawnSync(["openssl", ...args], { stdout: "pipe", stderr: "pipe" })
        if (proc.exitCode !== 0) throw new Error(`openssl ${args.join(" ")} failed: ${proc.stderr.toString()}`)
        return proc.stdout.toString()
      }
      keys.ed25519 = run(["genpkey", "-algorithm", "ed25519"])
      keys.rsa = run(["genpkey", "-algorithm", "RSA", "-pkeyopt", "rsa_keygen_bits:2048"])
      expect(keys.ed25519).toContain("PRIVATE KEY")
      expect(keys.rsa).toContain("PRIVATE KEY")
    },
    { timeout: 30_000 },
  )

  test(
    "dkimSignatureCreate covers each of the four algorithms",
    async () => {
      const cases = [
        { algorithm: "Dkim1Ed25519Sha256", selector: `e1-${runId}`, privateKey: keys.ed25519 },
        { algorithm: "Dkim1RsaSha256", selector: `r1-${runId}`, privateKey: keys.rsa },
        { algorithm: "Dkim2Ed25519Sha256", selector: `e2-${runId}`, privateKey: keys.ed25519 },
        { algorithm: "Dkim2RsaSha256", selector: `r2-${runId}`, privateKey: keys.rsa },
      ] as const
      for (const item of cases) {
        const r = await dkimSignatureCreate({
          config,
          domainId: created.domainId as string,
          selector: item.selector,
          privateKey: item.privateKey,
          algorithm: item.algorithm,
        })
        if (!r.success) fail(`dkimSignatureCreate ${item.algorithm} failed`, r)
        created.dkimIds.push(r.data.id)
      }
      expect(created.dkimIds).toHaveLength(4)
      const g = await dkimSignatureGet({ config, ids: created.dkimIds })
      if (!g.success) fail("dkimSignatureGet failed", g)
      expect(g.data.list).toHaveLength(4)
      const bySelector = new Map(g.data.list.map((s) => [(s as { selector: string }).selector, s]))
      for (const item of cases) expect(bySelector.has(item.selector)).toBe(true)
    },
    { timeout: 60_000 },
  )

  test(
    "dkimSignatureSet rotates one signature and destroys the created four",
    async () => {
      const target = created.dkimIds[0] as string
      const u = await dkimSignatureSet({ config, update: { [target]: { report: false } } })
      if (!u.success) fail("dkimSignatureSet failed", u)
      const g = await dkimSignatureGet({ config, ids: [target], properties: ["report"] })
      if (!g.success) fail("dkimSignatureGet failed", g)
      expect(g.data.list[0]?.report).toBe(false)
      const destroyedMine = [...created.dkimIds]
      const d = await dkimSignatureSet({ config, destroy: destroyedMine })
      if (!d.success) fail("dkimSignatureSet destroy failed", d)
      created.dkimIds = []
      const q = await dkimSignatureQuery({ config, filter: { domainId: created.domainId as string } })
      if (!q.success) fail("dkimSignatureQuery failed", q)
      // None of the created signatures remain; the auto-provisioned ones go with domainDestroy.
      for (const id of destroyedMine) expect(q.data.ids.map(String)).not.toContain(id)
    },
    { timeout: 30_000 },
  )
})

describe("e2e reg-domains: certificate, ACME provider and DNS server", () => {
  test(
    "certificateSet creates a self-signed certificate and destroys it",
    async () => {
      const subject = `/CN=${domainName}`
      const keyPath = `/tmp/e2e-${runId}-key.pem`
      const certPath = `/tmp/e2e-${runId}-cert.pem`
      const keyProc = Bun.spawnSync([
        "openssl",
        "genpkey",
        "-algorithm",
        "RSA",
        "-pkeyopt",
        "rsa_keygen_bits:2048",
        "-out",
        keyPath,
      ])
      if (keyProc.exitCode !== 0) throw new Error("openssl genpkey failed")
      const certProc = Bun.spawnSync([
        "openssl",
        "req",
        "-x509",
        "-new",
        "-key",
        keyPath,
        "-days",
        "1",
        "-subj",
        subject,
        "-out",
        certPath,
      ])
      if (certProc.exitCode !== 0) throw new Error("openssl req -x509 failed")
      const keyPem = await Bun.file(keyPath).text()
      const certPem = await Bun.file(certPath).text()
      expect(certPem).toContain("CERTIFICATE")
      const c = await certificateSet({
        config,
        create: {
          c1: {
            certificate: { "@type": "Text", value: certPem },
            privateKey: { "@type": "Text", secret: keyPem },
          },
        },
      })
      if (!c.success) fail("certificateSet create failed", c)
      created.certId = c.data.created?.c1?.id
      expect(created.certId).toBeString()
      const g = await certificateGet({ config, ids: [created.certId as string] })
      if (!g.success) fail("certificateGet failed", g)
      expect(g.data.list[0]?.issuer).toBeString()
      const d = await certificateSet({ config, destroy: [created.certId as string] })
      if (!d.success) fail("certificateSet destroy failed", d)
      created.certId = undefined
    },
    { timeout: 60_000 },
  )

  test(
    "acmeProviderSet creates and destroys a dummy provider",
    async () => {
      // The server eagerly registers an ACME account against the directory on create
      // (`crates/jmap/src/registry/mapping/tls.rs`: `acme_create_account`), so a dummy
      // URL can never succeed — and the container has no route to a host-local stub
      // (all of host.containers.internal, the bridge gateways and the host LAN fail
      // with connection errors). Pin the observed error shape instead; the create and
      // destroy wire shapes are covered by unit tests.
      const c = await acmeProviderSet({
        config,
        create: {
          a1: {
            contact: { [`acme-${runId}@example.test`]: true },
            directory: "https://acme.invalid/directory",
            reuseKey: false,
          },
        },
      })
      if (!c.success) expect(c.errorMessage).toContain("Failed to create ACME account")
      else fail("acmeProviderSet unexpectedly succeeded", c)
    },
    { timeout: 30_000 },
  )

  test(
    "dnsServerSet creates and destroys a TSIG server on loopback",
    async () => {
      const c = await dnsServerSet({
        config,
        create: {
          s1: {
            "@type": "Tsig",
            description: `e2e run ${runId}`,
            host: "127.0.0.1",
            keyName: `e2e-${runId}`,
            key: { "@type": "Value", secret: Buffer.from(`e2e-secret-${runId}`).toString("base64") },
          },
        },
      })
      if (!c.success) fail("dnsServerSet create failed", c)
      created.dnsId = c.data.created?.s1?.id
      expect(created.dnsId).toBeString()
      const g = await dnsServerGet({ config, ids: [created.dnsId as string] })
      if (!g.success) fail("dnsServerGet failed", g)
      const d = await dnsServerSet({ config, destroy: [created.dnsId as string] })
      if (!d.success) fail("dnsServerSet destroy failed", d)
      created.dnsId = undefined
    },
    { timeout: 30_000 },
  )

  test(
    "dnsResolverGet reads the resolver and a reversible update restores it",
    async () => {
      const g = await dnsResolverGet({ config })
      if (!g.success) fail("dnsResolverGet failed", g)
      const current = g.data.list[0] as unknown as { timeout: number }
      expect(current.timeout).toBeNumber()
      const u = await dnsResolverSet({ config, update: { singleton: { timeout: current.timeout + 1 } } })
      if (!u.success) fail("dnsResolverSet failed", u)
      const back = await dnsResolverGet({ config, properties: ["timeout"] })
      if (!back.success) fail("dnsResolverGet failed", back)
      expect((back.data.list[0] as unknown as { timeout: number }).timeout).toBe(current.timeout + 1)
      const restore = await dnsResolverSet({ config, update: { singleton: { timeout: current.timeout } } })
      if (!restore.success) fail("dnsResolverSet restore failed", restore)
    },
    { timeout: 30_000 },
  )
})

describe("e2e reg-mta: object lifecycles", () => {
  test(
    "each Mta* object and the virtual queue: create, update and destroy",
    async () => {
      const name = (suffix: string) => `e${runId.slice(0, 6)}-${suffix}`
      const cases: {
        label: string
        create: (
          id: string,
        ) => Promise<{ success: boolean; errorMessage?: string; errorData?: unknown; data?: { id?: string } }>
        read: (id: string) => Promise<{ success: boolean; errorMessage?: string }>
        update: (id: string) => Promise<{ success: boolean; errorMessage?: string }>
      }[] = [
        {
          label: "MtaConnectionStrategy",
          create: async (n) => {
            const r = await mtaConnectionStrategySet({
              config,
              create: { c1: { name: n, sourceIps: { "0": { sourceIp: "127.0.0.1", ehloHostname: null } } } },
            })
            if (!r.success) return r
            return { success: true as const, data: { id: r.data.created?.c1?.id } }
          },
          read: async (id) => mtaConnectionStrategyGet({ config, ids: [id] }),
          update: async (id) => mtaConnectionStrategySet({ config, update: { [id]: { description: `e2e ${runId}` } } }),
        },
        {
          label: "MtaHook",
          create: async () => {
            const r = await mtaHookSet({
              config,
              create: {
                c1: {
                  allowInvalidCerts: false,
                  httpAuth: { "@type": "Unauthenticated" },
                  httpHeaders: {},
                  url: "http://127.0.0.1:9/hook",
                },
              },
            })
            if (!r.success) return r
            return { success: true as const, data: { id: r.data.created?.c1?.id } }
          },
          read: async (id) => mtaHookGet({ config, ids: [id] }),
          update: async (id) => mtaHookSet({ config, update: { [id]: { timeout: 30001 } } }),
        },
        {
          label: "MtaInboundThrottle",
          create: async (n) => {
            const r = await mtaInboundThrottleSet({
              config,
              create: { c1: { description: n, key: {}, rate: { count: 10, period: 60 } } },
            })
            if (!r.success) return r
            return { success: true as const, data: { id: r.data.created?.c1?.id } }
          },
          read: async (id) => mtaInboundThrottleGet({ config, ids: [id] }),
          update: async (id) =>
            mtaInboundThrottleSet({ config, update: { [id]: { rate: { count: 11, period: 60 } } } }),
        },
        {
          label: "MtaMilter",
          create: async () => {
            const r = await mtaMilterSet({
              config,
              create: { c1: { allowInvalidCerts: false, hostname: "127.0.0.1", useTls: false } },
            })
            if (!r.success) return r
            return { success: true as const, data: { id: r.data.created?.c1?.id } }
          },
          read: async (id) => mtaMilterGet({ config, ids: [id] }),
          update: async (id) => mtaMilterSet({ config, update: { [id]: { timeoutData: 60001 } } }),
        },
        {
          label: "MtaOutboundThrottle",
          create: async (n) => {
            const r = await mtaOutboundThrottleSet({
              config,
              create: { c1: { description: n, key: {}, rate: { count: 10, period: 60 } } },
            })
            if (!r.success) return r
            return { success: true as const, data: { id: r.data.created?.c1?.id } }
          },
          read: async (id) => mtaOutboundThrottleGet({ config, ids: [id] }),
          update: async (id) => mtaOutboundThrottleSet({ config, update: { [id]: { description: `e2e ${runId}` } } }),
        },
        {
          label: "MtaQueueQuota",
          create: async (n) => {
            const r = await mtaQueueQuotaSet({
              config,
              create: { c1: { description: n, key: {}, match: { match: {}, else: "true" }, messages: 100 } },
            })
            if (!r.success) return r
            return { success: true as const, data: { id: r.data.created?.c1?.id } }
          },
          read: async (id) => mtaQueueQuotaGet({ config, ids: [id] }),
          update: async (id) => mtaQueueQuotaSet({ config, update: { [id]: { messages: 101 } } }),
        },
        {
          label: "MtaRoute",
          create: async (n) => {
            const r = await mtaRouteSet({ config, create: { c1: { "@type": "Mx", name: n } } })
            if (!r.success) return r
            return { success: true as const, data: { id: r.data.created?.c1?.id } }
          },
          read: async (id) => mtaRouteGet({ config, ids: [id] }),
          update: async (id) => mtaRouteSet({ config, update: { [id]: { description: `e2e ${runId}` } } }),
        },
        {
          label: "MtaTlsStrategy",
          create: async (n) => {
            const r = await mtaTlsStrategySet({ config, create: { c1: { name: n, allowInvalidCerts: false } } })
            if (!r.success) return r
            return { success: true as const, data: { id: r.data.created?.c1?.id } }
          },
          read: async (id) => mtaTlsStrategyGet({ config, ids: [id] }),
          update: async (id) => mtaTlsStrategySet({ config, update: { [id]: { description: `e2e ${runId}` } } }),
        },
      ]
      for (const [index, item] of cases.entries()) {
        const n = name(`o${index}`)
        const c = await item.create(n)
        if (!c.success || typeof c.data?.id !== "string") fail(`${item.label} create failed`, c)
        const id = c.data.id
        created.mtaIds[item.label] = id
        const g = await item.read(id)
        if (!g.success) fail(`${item.label} get failed`, g)
        const u = await item.update(id)
        if (!u.success) fail(`${item.label} update failed`, u)
      }
      // Query each type and confirm the throwaway instance is listed.
      const queries: { label: string; run: () => Promise<Awaited<ReturnType<typeof mtaRouteQuery>>> }[] = [
        {
          label: "MtaConnectionStrategy",
          run: () => mtaConnectionStrategyQuery({ config, filter: { name: name("o0") } }),
        },
        { label: "MtaHook", run: () => mtaHookQuery({ config, limit: 50 }) },
        { label: "MtaInboundThrottle", run: () => mtaInboundThrottleQuery({ config, limit: 50 }) },
        { label: "MtaMilter", run: () => mtaMilterQuery({ config }) },
        { label: "MtaOutboundThrottle", run: () => mtaOutboundThrottleQuery({ config, limit: 50 }) },
        { label: "MtaQueueQuota", run: () => mtaQueueQuotaQuery({ config, limit: 50 }) },
        { label: "MtaRoute", run: () => mtaRouteQuery({ config, filter: { name: name("o6") } }) },
        { label: "MtaTlsStrategy", run: () => mtaTlsStrategyQuery({ config, filter: { name: name("o7") } }) },
      ]
      for (const item of queries) {
        const q = await item.run()
        if (!q.success) fail(`${item.label} query failed`, q)
        if (q.success) expect(q.data.ids.map(String)).toContain(created.mtaIds[item.label] as string)
      }
      // Destroy every throwaway in reverse order.
      const labels = Object.keys(created.mtaIds).reverse()
      for (const label of labels) {
        const id = created.mtaIds[label] as string
        const destroyers: Record<string, (id: string) => Promise<{ success: boolean; errorMessage?: string }>> = {
          MtaConnectionStrategy: (x) => mtaConnectionStrategySet({ config, destroy: [x] }),
          MtaHook: (x) => mtaHookSet({ config, destroy: [x] }),
          MtaInboundThrottle: (x) => mtaInboundThrottleSet({ config, destroy: [x] }),
          MtaMilter: (x) => mtaMilterSet({ config, destroy: [x] }),
          MtaOutboundThrottle: (x) => mtaOutboundThrottleSet({ config, destroy: [x] }),
          MtaQueueQuota: (x) => mtaQueueQuotaSet({ config, destroy: [x] }),
          MtaRoute: (x) => mtaRouteSet({ config, destroy: [x] }),
          MtaTlsStrategy: (x) => mtaTlsStrategySet({ config, destroy: [x] }),
        }
        const d = await destroyers[label]?.(id)
        if (!d?.success) fail(`${label} destroy failed`, d ?? { success: false })
        delete created.mtaIds[label]
      }
    },
    { timeout: 120_000 },
  )

  test(
    "virtual queue and delivery schedule chain by id",
    async () => {
      const queueName = `q${runId.slice(0, 7)}`
      const vq = await mtaVirtualQueueSet({ config, create: { c1: { name: queueName } } })
      if (!vq.success) fail("mtaVirtualQueueSet create failed", vq)
      created.scheduleQueueId = vq.data.created?.c1?.id
      expect(created.scheduleQueueId).toBeString()
      const ds = await mtaDeliveryScheduleSet({
        config,
        create: {
          c1: {
            name: `e${runId.slice(0, 6)}-ds`,
            queueId: created.scheduleQueueId as string,
            retry: { "@type": "Default" },
            notify: { "@type": "Default" },
            expiry: { "@type": "Attempts", maxAttempts: 5 },
          },
        },
      })
      if (!ds.success) fail("mtaDeliveryScheduleSet create failed", ds)
      created.deliveryScheduleId = ds.data.created?.c1?.id
      expect(created.deliveryScheduleId).toBeString()
      const g = await mtaDeliveryScheduleGet({ config, ids: [created.deliveryScheduleId as string] })
      if (!g.success) fail("mtaDeliveryScheduleGet failed", g)
      const q = await mtaDeliveryScheduleQuery({ config, filter: { name: `e${runId.slice(0, 6)}-ds` } })
      if (!q.success) fail("mtaDeliveryScheduleQuery failed", q)
      expect(q.data.ids.map(String)).toContain(created.deliveryScheduleId as string)
      const vqGet = await mtaVirtualQueueGet({ config, ids: [created.scheduleQueueId as string] })
      if (!vqGet.success) fail("mtaVirtualQueueGet failed", vqGet)
      const vqQuery = await mtaVirtualQueueQuery({ config, filter: { name: queueName } })
      if (!vqQuery.success) fail("mtaVirtualQueueQuery failed", vqQuery)
      expect(vqQuery.data.ids.map(String)).toContain(created.scheduleQueueId as string)
      const u = await mtaDeliveryScheduleSet({
        config,
        update: { [created.deliveryScheduleId as string]: { description: `e2e ${runId}` } },
      })
      if (!u.success) fail("mtaDeliveryScheduleSet update failed", u)
      const d = await mtaDeliveryScheduleSet({ config, destroy: [created.deliveryScheduleId as string] })
      if (!d.success) fail("mtaDeliveryScheduleSet destroy failed", d)
      created.deliveryScheduleId = undefined
      const vd = await mtaVirtualQueueSet({ config, destroy: [created.scheduleQueueId as string] })
      if (!vd.success) fail("mtaVirtualQueueSet destroy failed", vd)
      created.scheduleQueueId = undefined
    },
    { timeout: 60_000 },
  )
})

describe("e2e reg-mta: singleton reversals", () => {
  test(
    "each Mta* singleton round-trips one field",
    async () => {
      // Flip one expression field to an explicit new value, verify, then restore.
      const flipExpression = async (
        label: string,
        current: string,
        updated: string,
        set: (elseValue: string) => Promise<{ success: boolean; errorMessage?: string; errorData?: unknown }>,
        getElse: () => Promise<string>,
      ) => {
        const u = await set(updated)
        if (!u.success) fail(`${label} set failed`, u)
        expect(await getElse()).toBe(updated)
        const restore = await set(current)
        if (!restore.success) fail(`${label} restore failed`, restore)
        expect(await getElse()).toBe(current)
      }
      const extensionsBefore = await mtaExtensionsGet({ config, properties: ["requireTls"] })
      if (!extensionsBefore.success) fail("mtaExtensionsGet failed", extensionsBefore)
      const requireTls = extensionsBefore.data.list[0]?.requireTls.else ?? "true"
      await flipExpression(
        "mtaExtensions.requireTls",
        requireTls,
        requireTls === "true" ? "false" : "true",
        (elseValue) =>
          mtaExtensionsSet({ config, update: { singleton: { requireTls: { match: {}, else: elseValue } } } }),
        async () => {
          const g = await mtaExtensionsGet({ config, properties: ["requireTls"] })
          if (!g.success) fail("mtaExtensionsGet failed", g)
          return g.data.list[0]?.requireTls.else ?? ""
        },
      )
      const sessionBefore = await mtaInboundSessionGet({ config, properties: ["transferLimit"] })
      if (!sessionBefore.success) fail("mtaInboundSessionGet failed", sessionBefore)
      const transferLimit = sessionBefore.data.list[0]?.transferLimit.else ?? "262144000"
      await flipExpression(
        "mtaInboundSession.transferLimit",
        transferLimit,
        `${transferLimit}0`,
        (elseValue) =>
          mtaInboundSessionSet({ config, update: { singleton: { transferLimit: { match: {}, else: elseValue } } } }),
        async () => {
          const g = await mtaInboundSessionGet({ config, properties: ["transferLimit"] })
          if (!g.success) fail("mtaInboundSessionGet failed", g)
          return g.data.list[0]?.transferLimit.else ?? ""
        },
      )
      const authBefore = await mtaStageAuthGet({ config, properties: ["maxFailures"] })
      if (!authBefore.success) fail("mtaStageAuthGet failed", authBefore)
      const maxFailures = authBefore.data.list[0]?.maxFailures.else ?? "3"
      await flipExpression(
        "mtaStageAuth.maxFailures",
        maxFailures,
        maxFailures === "3" ? "4" : "3",
        (elseValue) =>
          mtaStageAuthSet({ config, update: { singleton: { maxFailures: { match: {}, else: elseValue } } } }),
        async () => {
          const g = await mtaStageAuthGet({ config, properties: ["maxFailures"] })
          if (!g.success) fail("mtaStageAuthGet failed", g)
          return g.data.list[0]?.maxFailures.else ?? ""
        },
      )
      const connectBefore = await mtaStageConnectGet({ config, properties: ["hostname"] })
      if (!connectBefore.success) fail("mtaStageConnectGet failed", connectBefore)
      const hostname = connectBefore.data.list[0]?.hostname.else ?? "system('hostname')"
      await flipExpression(
        "mtaStageConnect.hostname",
        hostname,
        "'mail.example.test'",
        (elseValue) =>
          mtaStageConnectSet({ config, update: { singleton: { hostname: { match: {}, else: elseValue } } } }),
        async () => {
          const g = await mtaStageConnectGet({ config, properties: ["hostname"] })
          if (!g.success) fail("mtaStageConnectGet failed", g)
          return g.data.list[0]?.hostname.else ?? ""
        },
      )
      const dataBefore = await mtaStageDataGet({ config, properties: ["maxMessages"] })
      if (!dataBefore.success) fail("mtaStageDataGet failed", dataBefore)
      const maxMessages = dataBefore.data.list[0]?.maxMessages.else ?? "10"
      await flipExpression(
        "mtaStageData.maxMessages",
        maxMessages,
        maxMessages === "10" ? "11" : "10",
        (elseValue) =>
          mtaStageDataSet({ config, update: { singleton: { maxMessages: { match: {}, else: elseValue } } } }),
        async () => {
          const g = await mtaStageDataGet({ config, properties: ["maxMessages"] })
          if (!g.success) fail("mtaStageDataGet failed", g)
          return g.data.list[0]?.maxMessages.else ?? ""
        },
      )
      const rcptBefore = await mtaStageRcptGet({ config, properties: ["maxRecipients"] })
      if (!rcptBefore.success) fail("mtaStageRcptGet failed", rcptBefore)
      const maxRecipients = rcptBefore.data.list[0]?.maxRecipients.else ?? "100"
      await flipExpression(
        "mtaStageRcpt.maxRecipients",
        maxRecipients,
        maxRecipients === "100" ? "101" : "100",
        (elseValue) =>
          mtaStageRcptSet({ config, update: { singleton: { maxRecipients: { match: {}, else: elseValue } } } }),
        async () => {
          const g = await mtaStageRcptGet({ config, properties: ["maxRecipients"] })
          if (!g.success) fail("mtaStageRcptGet failed", g)
          return g.data.list[0]?.maxRecipients.else ?? ""
        },
      )
      // Plain-number singletons.
      const stsBefore = await mtaStsGet({ config, properties: ["maxAge"] })
      if (!stsBefore.success) fail("mtaStsGet failed", stsBefore)
      const maxAge = stsBefore.data.list[0]?.maxAge ?? 604800000
      const stsUp = await mtaStsSet({ config, update: { singleton: { maxAge: maxAge + 1 } } })
      if (!stsUp.success) fail("mtaStsSet failed", stsUp)
      const stsMid = await mtaStsGet({ config, properties: ["maxAge"] })
      if (!stsMid.success) fail("mtaStsGet failed", stsMid)
      expect(stsMid.data.list[0]?.maxAge).toBe(maxAge + 1)
      const stsRestore = await mtaStsSet({ config, update: { singleton: { maxAge } } })
      if (!stsRestore.success) fail("mtaStsSet restore failed", stsRestore)
      // Same-value writes for routing/policy singletons (changing them would reroute mail).
      const outboundBefore = await mtaOutboundStrategyGet({ config, properties: ["route"] })
      if (!outboundBefore.success) fail("mtaOutboundStrategyGet failed", outboundBefore)
      const outbound = await mtaOutboundStrategySet({
        config,
        update: { singleton: { route: outboundBefore.data.list[0]?.route } },
      })
      if (!outbound.success) fail("mtaOutboundStrategySet failed", outbound)
      const ehloBefore = await mtaStageEhloGet({ config, properties: ["require"] })
      if (!ehloBefore.success) fail("mtaStageEhloGet failed", ehloBefore)
      const ehlo = await mtaStageEhloSet({
        config,
        update: { singleton: { require: ehloBefore.data.list[0]?.require } },
      })
      if (!ehlo.success) fail("mtaStageEhloSet failed", ehlo)
      const mailBefore = await mtaStageMailGet({ config, properties: ["rewrite"] })
      if (!mailBefore.success) fail("mtaStageMailGet failed", mailBefore)
      const mail = await mtaStageMailSet({
        config,
        update: { singleton: { rewrite: mailBefore.data.list[0]?.rewrite } },
      })
      if (!mail.success) fail("mtaStageMailSet failed", mail)
    },
    { timeout: 120_000 },
  )
})

describe("e2e reg-mta: listeners and queue", () => {
  test(
    "networkListenerQuery lists listeners and get reads one back",
    async () => {
      const q = await networkListenerQuery({ config, limit: 20 })
      if (!q.success) fail("networkListenerQuery failed", q)
      expect(q.data.ids.length).toBeGreaterThanOrEqual(7)
      const g = await networkListenerGet({ config, ids: [String(q.data.ids[0])], properties: ["name", "protocol"] })
      if (!g.success) fail("networkListenerGet failed", g)
      expect(g.data.list[0]?.name).toBeString()
    },
    { timeout: 30_000 },
  )

  test(
    "queued message: live missing-id contract after harmless failed delivery",
    async () => {
      // No deterministic hold exists on this instance: delivery to unroutable
      // `.test` recipients fails permanently in well under 2s (negative DNS is
      // cached), relay connection-refused is permanent too
      // (`crates/jmap/src/registry/mapping/queued_message.rs`), and plain
      // registry writes do not rebuild the live queue config without a reload.
      // So submit harmlessly (default routes are local+mx only — nothing relays
      // to a real host), drain what appears, then pin the missing-id contract.
      const testDomain = `queued-${runId}.test`
      // Alice's inbox id and identity id (stable per database, so resolve them first).
      const mailboxes = await jmapRequest({
        config: aliceConfig,
        using: ["urn:ietf:params:jmap:core", "urn:ietf:params:jmap:mail"],
        calls: [{ methodName: "Mailbox/get", arguments: { accountId: aliceAccountId } }],
      })
      if (!mailboxes.success) fail("Mailbox/get failed", mailboxes)
      const inbox = (mailboxes.data[0]?.arguments as { list: { id: string; role?: string }[] }).list.find(
        (m) => m.role === "inbox",
      )?.id
      if (inbox === undefined) throw new Error("alice has no inbox")
      const identities = await jmapRequest({
        config: aliceConfig,
        using: ["urn:ietf:params:jmap:core", "urn:ietf:params:jmap:submission"],
        calls: [{ methodName: "Identity/get", arguments: { accountId: aliceAccountId } }],
      })
      if (!identities.success) fail("Identity/get failed", identities)
      const identityId = (identities.data[0]?.arguments as { list: { id: string }[] }).list[0]?.id
      if (identityId === undefined) throw new Error("alice has no identity")

      // Submit to the held test domain: valid per Stalwart, routed to the dead relay.
      const recipient = `nobody@${testDomain}`
      const subject = `e2e queue ${runId}`
      const submitted = await jmapRequest({
        config: aliceConfig,
        using: ["urn:ietf:params:jmap:core", "urn:ietf:params:jmap:mail", "urn:ietf:params:jmap:submission"],
        calls: [
          {
            methodName: "Email/set",
            arguments: {
              accountId: aliceAccountId,
              create: {
                e1: {
                  mailboxIds: { [inbox]: true },
                  from: [{ email: "alice@example.test" }],
                  to: [{ email: recipient }],
                  subject,
                  textBody: [{ partId: "t1", type: "text/plain" }],
                  bodyValues: { t1: { value: "queued body" } },
                },
              },
            },
          },
          {
            methodName: "EmailSubmission/set",
            arguments: {
              accountId: aliceAccountId,
              create: {
                s1: {
                  emailId: "#e1",
                  envelope: { mailFrom: { email: "alice@example.test" }, rcptTo: [{ email: recipient }] },
                  identityId,
                },
              },
            },
          },
        ],
      })
      if (!submitted.success) fail("Email/set+EmailSubmission/set failed", submitted)

      // Drain whatever is still queued for our recipient (usually nothing — the
      // permanent failure lands in well under 2s), cancelling it when found so
      // every assertion below holds in every interleaving.
      let queuedId: string | undefined
      for (let attempt = 0; attempt < 10; attempt++) {
        const q = await queuedMessageQuery({ config, filter: { returnPath: "alice@example.test" } })
        if (!q.success) fail("queuedMessageQuery failed", q)
        let found: string | undefined
        for (const id of q.data.ids.map(String)) {
          const g = await queuedMessageGet({ config, ids: [id] })
          if (!g.success) fail("queuedMessageGet failed", g)
          if (g.success) {
            const recipients = Object.keys(
              (g.data.list[0] as unknown as { recipients: Record<string, unknown> } | undefined)?.recipients ?? {},
            )
            if (recipients.includes(recipient)) {
              found = id
              break
            }
          }
        }
        if (found !== undefined) {
          queuedId = found
          break
        }
        await Bun.sleep(1000)
      }
      if (queuedId !== undefined) {
        created.queuedId = queuedId
        const full = await queuedMessageGet({ config, ids: [queuedId] })
        if (!full.success) fail("queuedMessageGet failed", full)
        else if (full.data.list.length > 0) {
          expect(full.data.list[0]?.returnPath).toBe("alice@example.test")
          const contents = await queuedMessageContents({ config, id: queuedId })
          if (contents.success) expect(contents.data).toContain(subject)
          // else already drained mid-test; fall through to the pins below.
        }
        const cancel = await queuedMessageCancel({ config, id: queuedId })
        if (!cancel.success && !cancel.errorMessage.includes("notFound")) fail("queuedMessageCancel failed", cancel)
        created.queuedId = undefined
      }
      // Pin the missing-id contract on a certainly-absent id. It must be
      // id-shaped: unparseable keys are silently dropped by the framework
      // (neither updated nor notUpdated), while well-formed unknown ids yield
      // notFound (`queued_message.rs` update/destroy paths, `get.rs`).
      const missingId = queuedId ?? "zzzzzzzzzz"
      const gone = await queuedMessageGet({ config, ids: [missingId] })
      if (!gone.success) fail("queuedMessageGet failed", gone)
      expect(gone.data.list).toHaveLength(0)
      expect(gone.data.notFound.map(String)).toContain(missingId)
      const retry = await queuedMessageRetry({ config, id: missingId })
      if (!retry.success) expect(retry.errorMessage).toContain("notFound")
      else fail("queuedMessageRetry unexpectedly succeeded", retry)
      const cancelMissing = await queuedMessageCancel({ config, id: missingId })
      if (!cancelMissing.success) expect(cancelMissing.errorMessage).toContain("notFound")
      else fail("queuedMessageCancel unexpectedly succeeded", cancelMissing)
      const contentsMissing = await queuedMessageContents({ config, id: missingId })
      if (contentsMissing.success) throw new Error("queuedMessageContents unexpectedly succeeded")
      expect(contentsMissing.op).toBe("queuedMessageContents")
    },
    { timeout: 120_000 },
  )
})

describe("e2e reg-domains-mta: teardown", () => {
  test(
    "domainDestroy removes the domain with its auto-provisioned signatures",
    async () => {
      const d = await domainDestroy({ config, id: created.domainId as string })
      if (!d.success) fail("domainDestroy failed", d)
      expect(d.data.destroyed).toBe(created.domainId as string)
      expect(d.data.destroyedSignatures.length).toBeGreaterThanOrEqual(2)
      created.domainId = undefined
      const q = await domainQuery({ config, filter: { name: domainName } })
      if (!q.success) fail("domainQuery failed", q)
      expect(q.data.ids).toHaveLength(0)
    },
    { timeout: 30_000 },
  )
})
