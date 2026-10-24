import { afterAll, beforeAll, describe, expect, test } from "bun:test"
import type { StalwartClientConfig } from "../src/client/stalwartClientConfigSchema.js"
import { asnGet } from "../src/registry/lookups/asnGet.js"
import { asnSet } from "../src/registry/lookups/asnSet.js"
import { httpLookupGet } from "../src/registry/lookups/httpLookupGet.js"
import { httpLookupQuery } from "../src/registry/lookups/httpLookupQuery.js"
import { httpLookupSet } from "../src/registry/lookups/httpLookupSet.js"
import { memoryLookupKeyGet } from "../src/registry/lookups/memoryLookupKeyGet.js"
import { memoryLookupKeyQuery } from "../src/registry/lookups/memoryLookupKeyQuery.js"
import { memoryLookupKeySet } from "../src/registry/lookups/memoryLookupKeySet.js"
import { memoryLookupKeyValueGet } from "../src/registry/lookups/memoryLookupKeyValueGet.js"
import { memoryLookupKeyValueQuery } from "../src/registry/lookups/memoryLookupKeyValueQuery.js"
import { memoryLookupKeyValueSet } from "../src/registry/lookups/memoryLookupKeyValueSet.js"
import { storeLookupGet } from "../src/registry/lookups/storeLookupGet.js"
import { storeLookupQuery } from "../src/registry/lookups/storeLookupQuery.js"
import { storeLookupSet } from "../src/registry/lookups/storeLookupSet.js"
import { dkimReportSettingsGet } from "../src/registry/reportSettings/dkimReportSettingsGet.js"
import { dkimReportSettingsSet } from "../src/registry/reportSettings/dkimReportSettingsSet.js"
import { dmarcReportSettingsGet } from "../src/registry/reportSettings/dmarcReportSettingsGet.js"
import { dmarcReportSettingsSet } from "../src/registry/reportSettings/dmarcReportSettingsSet.js"
import { dsnReportSettingsGet } from "../src/registry/reportSettings/dsnReportSettingsGet.js"
import { dsnReportSettingsSet } from "../src/registry/reportSettings/dsnReportSettingsSet.js"
import { reportSettingsGet } from "../src/registry/reportSettings/reportSettingsGet.js"
import { reportSettingsSet } from "../src/registry/reportSettings/reportSettingsSet.js"
import { senderAuthGet } from "../src/registry/reportSettings/senderAuthGet.js"
import { senderAuthSet } from "../src/registry/reportSettings/senderAuthSet.js"
import { spfReportSettingsGet } from "../src/registry/reportSettings/spfReportSettingsGet.js"
import { spfReportSettingsSet } from "../src/registry/reportSettings/spfReportSettingsSet.js"
import { tlsReportSettingsGet } from "../src/registry/reportSettings/tlsReportSettingsGet.js"
import { tlsReportSettingsSet } from "../src/registry/reportSettings/tlsReportSettingsSet.js"
import { sieveSystemInterpreterGet } from "../src/registry/sieve/sieveSystemInterpreterGet.js"
import { sieveSystemInterpreterSet } from "../src/registry/sieve/sieveSystemInterpreterSet.js"
import { sieveSystemScriptCreate } from "../src/registry/sieve/sieveSystemScriptCreate.js"
import { sieveSystemScriptGet } from "../src/registry/sieve/sieveSystemScriptGet.js"
import { sieveSystemScriptQuery } from "../src/registry/sieve/sieveSystemScriptQuery.js"
import { sieveSystemScriptSet } from "../src/registry/sieve/sieveSystemScriptSet.js"
import { sieveUserInterpreterGet } from "../src/registry/sieve/sieveUserInterpreterGet.js"
import { sieveUserInterpreterSet } from "../src/registry/sieve/sieveUserInterpreterSet.js"
import { sieveUserScriptGet } from "../src/registry/sieve/sieveUserScriptGet.js"
import { sieveUserScriptQuery } from "../src/registry/sieve/sieveUserScriptQuery.js"
import { sieveUserScriptSet } from "../src/registry/sieve/sieveUserScriptSet.js"
import { spamBlockedDomainQuery } from "../src/registry/spam/spamBlockedDomainQuery.js"
import { spamClassifierGet } from "../src/registry/spam/spamClassifierGet.js"
import { spamClassifierSet } from "../src/registry/spam/spamClassifierSet.js"
import { spamDnsblServerGet } from "../src/registry/spam/spamDnsblServerGet.js"
import { spamDnsblServerQuery } from "../src/registry/spam/spamDnsblServerQuery.js"
import { spamDnsblServerSet } from "../src/registry/spam/spamDnsblServerSet.js"
import { spamDnsblSettingsGet } from "../src/registry/spam/spamDnsblSettingsGet.js"
import { spamDnsblSettingsSet } from "../src/registry/spam/spamDnsblSettingsSet.js"
import { spamFileExtensionGet } from "../src/registry/spam/spamFileExtensionGet.js"
import { spamFileExtensionQuery } from "../src/registry/spam/spamFileExtensionQuery.js"
import { spamFileExtensionSet } from "../src/registry/spam/spamFileExtensionSet.js"
import { spamLlmGet } from "../src/registry/spam/spamLlmGet.js"
import { spamLlmSet } from "../src/registry/spam/spamLlmSet.js"
import { spamPyzorGet } from "../src/registry/spam/spamPyzorGet.js"
import { spamPyzorSet } from "../src/registry/spam/spamPyzorSet.js"
import { spamRuleGet } from "../src/registry/spam/spamRuleGet.js"
import { spamRuleQuery } from "../src/registry/spam/spamRuleQuery.js"
import { spamRuleSet } from "../src/registry/spam/spamRuleSet.js"
import { spamSettingsGet } from "../src/registry/spam/spamSettingsGet.js"
import { spamSettingsSet } from "../src/registry/spam/spamSettingsSet.js"
import { spamTagGet } from "../src/registry/spam/spamTagGet.js"
import { spamTagQuery } from "../src/registry/spam/spamTagQuery.js"
import { spamTagSet } from "../src/registry/spam/spamTagSet.js"
import { spamTrainingSampleGet } from "../src/registry/spam/spamTrainingSampleGet.js"
import { spamTrainingSampleQuery } from "../src/registry/spam/spamTrainingSampleQuery.js"
import { spamTrapQuery } from "../src/registry/spam/spamTrapQuery.js"
import { spamTrustedDomainQuery } from "../src/registry/spam/spamTrustedDomainQuery.js"
import { spamUrlRedirectorQuery } from "../src/registry/spam/spamUrlRedirectorQuery.js"
import { e2eRunId } from "./e2eRunId.js"
import { stalwartE2eSetup } from "./e2eSetup.js"

let config: StalwartClientConfig
const runId = e2eRunId()
const tag = `e2e-${runId}`
const ns = `e2e-${runId}`
// The server normalizes SpamDnsblServer/SpamRule names: uppercase, dashes stripped.
const normName = tag.toUpperCase().replace(/[^A-Z0-9]/g, "")

const created: {
  dnsbl?: string
  ext?: string
  rule?: string
  stag?: string
  key?: string
  keyValue?: string
  store?: string
  http?: string
  sysScript?: string
  userScript?: string
} = {}

function fail(r: { errorMessage: string; errorData?: string | null }, what: string): Error {
  return new Error(`${what} failed: ${r.errorMessage} ${r.errorData ?? ""}`)
}

beforeAll(async () => {
  config = await stalwartE2eSetup()
})

afterAll(async () => {
  // Strict reverse-order, best-effort teardown of run-scoped objects only.
  const jobs: [string, () => Promise<{ success: boolean; errorMessage?: string }>][] = [
    ["SieveUserScript", () => sieveUserScriptSet({ config, destroy: created.userScript ? [created.userScript] : [] })],
    [
      "SieveSystemScript",
      () => sieveSystemScriptSet({ config, destroy: created.sysScript ? [created.sysScript] : [] }),
    ],
    ["HttpLookup", () => httpLookupSet({ config, destroy: created.http ? [created.http] : [] })],
    ["StoreLookup", () => storeLookupSet({ config, destroy: created.store ? [created.store] : [] })],
    [
      "MemoryLookupKeyValue",
      () => memoryLookupKeyValueSet({ config, destroy: created.keyValue ? [created.keyValue] : [] }),
    ],
    ["MemoryLookupKey", () => memoryLookupKeySet({ config, destroy: created.key ? [created.key] : [] })],
    ["SpamTag", () => spamTagSet({ config, destroy: created.stag ? [created.stag] : [] })],
    ["SpamRule", () => spamRuleSet({ config, destroy: created.rule ? [created.rule] : [] })],
    ["SpamFileExtension", () => spamFileExtensionSet({ config, destroy: created.ext ? [created.ext] : [] })],
    ["SpamDnsblServer", () => spamDnsblServerSet({ config, destroy: created.dnsbl ? [created.dnsbl] : [] })],
  ]
  for (const [name, run] of jobs) {
    // biome-ignore lint/suspicious/noExplicitAny: teardown guard
    const id = (created as any)[keyOf(name)]
    if (id === undefined) continue
    const r = await run()
    if (!r.success) console.warn(`teardown: ${name} ${id} not removed: ${r.errorMessage ?? "unknown"}`)
  }
})

function keyOf(name: string): keyof typeof created {
  switch (name) {
    case "SieveUserScript":
      return "userScript"
    case "SieveSystemScript":
      return "sysScript"
    case "HttpLookup":
      return "http"
    case "StoreLookup":
      return "store"
    case "MemoryLookupKeyValue":
      return "keyValue"
    case "MemoryLookupKey":
      return "key"
    case "SpamTag":
      return "stag"
    case "SpamRule":
      return "rule"
    case "SpamFileExtension":
      return "ext"
    default:
      return "dnsbl"
  }
}

describe("e2e reg-filtering: spam object lifecycles", () => {
  test(
    "spamDnsblServer create/get/query/update round trip",
    async () => {
      const c = await spamDnsblServerSet({
        config,
        create: {
          n1: {
            "@type": "Any",
            name: normName,
            enable: false,
            tag: { else: "false", match: {} },
            zone: { else: "false", match: {} },
          },
        },
      })
      if (!c.success) throw fail(c, "dnsbl create")
      created.dnsbl = c.data.created?.n1?.id
      expect(created.dnsbl).toBeString()
      const id = created.dnsbl as string

      const g = await spamDnsblServerGet({ config, ids: [id] })
      if (!g.success) throw fail(g, "dnsbl get")
      expect(g.data.list[0]?.name).toBe(normName)

      const q = await spamDnsblServerQuery({ config, filter: { name: normName } })
      if (!q.success) throw fail(q, "dnsbl query")
      expect(q.data.ids.map(String)).toContain(id)

      const u = await spamDnsblServerSet({ config, update: { [id]: { description: tag } } })
      if (!u.success) throw fail(u, "dnsbl update")
      const g2 = await spamDnsblServerGet({ config, ids: [id], properties: ["description"] })
      if (!g2.success) throw fail(g2, "dnsbl re-get")
      expect(g2.data.list[0]?.description).toBe(tag)
    },
    { timeout: 30_000 },
  )

  test(
    "spamFileExtension create/get/query/update round trip",
    async () => {
      const c = await spamFileExtensionSet({
        config,
        create: { n1: { extension: `x${runId}`, contentTypes: {}, isArchive: false, isBad: true, isNz: false } },
      })
      if (!c.success) throw fail(c, "extension create")
      created.ext = c.data.created?.n1?.id
      expect(created.ext).toBeString()
      const id = created.ext as string

      const g = await spamFileExtensionGet({ config, ids: [id] })
      if (!g.success) throw fail(g, "extension get")
      expect(g.data.list[0]?.extension).toBe(`x${runId}`)

      const q = await spamFileExtensionQuery({ config, filter: { extension: `x${runId}` } })
      if (!q.success) throw fail(q, "extension query")
      expect(q.data.ids.map(String)).toContain(id)

      const u = await spamFileExtensionSet({ config, update: { [id]: { isNz: true } } })
      if (!u.success) throw fail(u, "extension update")
      const g2 = await spamFileExtensionGet({ config, ids: [id], properties: ["isNz"] })
      if (!g2.success) throw fail(g2, "extension re-get")
      expect(g2.data.list[0]?.isNz).toBe(true)
    },
    { timeout: 30_000 },
  )

  test(
    "spamRule create/get/query/update round trip",
    async () => {
      const c = await spamRuleSet({
        config,
        create: {
          n1: {
            "@type": "Any",
            name: normName,
            condition: { else: "false", match: {} },
            enable: false,
            priority: 1,
          },
        },
      })
      if (!c.success) throw fail(c, "rule create")
      created.rule = c.data.created?.n1?.id
      expect(created.rule).toBeString()
      const id = created.rule as string

      const g = await spamRuleGet({ config, ids: [id] })
      if (!g.success) throw fail(g, "rule get")
      expect(g.data.list[0]?.name).toBe(normName)

      const q = await spamRuleQuery({ config, filter: { name: normName } })
      if (!q.success) throw fail(q, "rule query")
      expect(q.data.ids.map(String)).toContain(id)

      const u = await spamRuleSet({ config, update: { [id]: { priority: 2 } } })
      if (!u.success) throw fail(u, "rule update")
      const g2 = await spamRuleGet({ config, ids: [id], properties: ["priority"] })
      if (!g2.success) throw fail(g2, "rule re-get")
      expect(g2.data.list[0]?.priority).toBe(2)
    },
    { timeout: 30_000 },
  )

  test(
    "spamTag create/get/query/update round trip",
    async () => {
      const c = await spamTagSet({
        config,
        create: { n1: { "@type": "Score", tag: `E2E${runId}`.toUpperCase(), score: 0.1 } },
      })
      if (!c.success) throw fail(c, "tag create")
      created.stag = c.data.created?.n1?.id
      expect(created.stag).toBeString()
      const id = created.stag as string

      const g = await spamTagGet({ config, ids: [id] })
      if (!g.success) throw fail(g, "tag get")
      expect(g.data.list[0]?.tag).toBe(`E2E${runId}`.toUpperCase())

      const q = await spamTagQuery({ config, filter: { tag: `E2E${runId}`.toUpperCase() } })
      if (!q.success) throw fail(q, "tag query")
      expect(q.data.ids.map(String)).toContain(id)

      const u = await spamTagSet({ config, update: { [id]: { score: 0.2 } } })
      if (!u.success) throw fail(u, "tag update")
      const g2 = await spamTagGet({ config, ids: [id], properties: ["score"] })
      if (!g2.success) throw fail(g2, "tag re-get")
      expect(g2.data.list[0]?.score).toBe(0.2)
    },
    { timeout: 30_000 },
  )
})

describe("e2e reg-filtering: lookup object lifecycles", () => {
  test(
    "memoryLookupKey create/get/query/update round trip",
    async () => {
      const c = await memoryLookupKeySet({
        config,
        create: { n1: { namespace: ns, key: "example.test", isGlobPattern: false } },
      })
      if (!c.success) throw fail(c, "key create")
      created.key = c.data.created?.n1?.id
      expect(created.key).toBeString()
      const id = created.key as string

      const g = await memoryLookupKeyGet({ config, ids: [id] })
      if (!g.success) throw fail(g, "key get")
      expect(g.data.list[0]?.namespace).toBe(ns)

      const q = await memoryLookupKeyQuery({ config, filter: { namespace: ns } })
      if (!q.success) throw fail(q, "key query")
      expect(q.data.ids.map(String)).toContain(id)

      const u = await memoryLookupKeySet({ config, update: { [id]: { key: "other.test" } } })
      if (!u.success) throw fail(u, "key update")
      const g2 = await memoryLookupKeyGet({ config, ids: [id], properties: ["key"] })
      if (!g2.success) throw fail(g2, "key re-get")
      expect(g2.data.list[0]?.key).toBe("other.test")
    },
    { timeout: 30_000 },
  )

  test(
    "memoryLookupKeyValue create/get/query/update round trip",
    async () => {
      const c = await memoryLookupKeyValueSet({
        config,
        create: { n1: { namespace: ns, key: "k", value: "v", isGlobPattern: false } },
      })
      if (!c.success) throw fail(c, "key-value create")
      created.keyValue = c.data.created?.n1?.id
      expect(created.keyValue).toBeString()
      const id = created.keyValue as string

      const g = await memoryLookupKeyValueGet({ config, ids: [id] })
      if (!g.success) throw fail(g, "key-value get")
      expect(g.data.list[0]?.value).toBe("v")

      const q = await memoryLookupKeyValueQuery({ config, filter: { namespace: ns } })
      if (!q.success) throw fail(q, "key-value query")
      expect(q.data.ids.map(String)).toContain(id)

      const u = await memoryLookupKeyValueSet({ config, update: { [id]: { value: "v2" } } })
      if (!u.success) throw fail(u, "key-value update")
      const g2 = await memoryLookupKeyValueGet({ config, ids: [id], properties: ["value"] })
      if (!g2.success) throw fail(g2, "key-value re-get")
      expect(g2.data.list[0]?.value).toBe("v2")
    },
    { timeout: 30_000 },
  )

  test(
    "storeLookup create/get/query/destroy round trip",
    async () => {
      const c = await storeLookupSet({
        config,
        create: {
          n1: {
            namespace: `${ns}-store`,
            store: {
              "@type": "Redis",
              url: "redis://127.0.0.1:6399",
              poolMaxConnections: 2,
              timeout: 1000,
              poolTimeoutCreate: null,
              poolTimeoutRecycle: null,
              poolTimeoutWait: null,
            },
          },
        },
      })
      if (!c.success) throw fail(c, "store create")
      created.store = c.data.created?.n1?.id
      expect(created.store).toBeString()
      const id = created.store as string

      const g = await storeLookupGet({ config, ids: [id] })
      if (!g.success) throw fail(g, "store get")
      expect(g.data.list[0]?.namespace).toBe(`${ns}-store`)

      // StoreLookup/query does not support the namespace filter: list and match locally.
      const q = await storeLookupQuery({ config, limit: 100 })
      if (!q.success) throw fail(q, "store query")
      expect(q.data.ids.map(String)).toContain(id)
    },
    { timeout: 30_000 },
  )

  test(
    "httpLookup create/get/query/destroy round trip",
    async () => {
      const c = await httpLookupSet({
        config,
        create: {
          n1: {
            namespace: `${ns}-http`,
            url: "http://127.0.0.1:9/e2e-list.txt",
            format: { "@type": "List" },
            isGzipped: false,
          },
        },
      })
      if (!c.success) throw fail(c, "http create")
      created.http = c.data.created?.n1?.id
      expect(created.http).toBeString()
      const id = created.http as string

      const g = await httpLookupGet({ config, ids: [id] })
      if (!g.success) throw fail(g, "http get")
      expect(g.data.list[0]?.namespace).toBe(`${ns}-http`)

      // HttpLookup/query does not support the namespace filter: list and match locally.
      const q = await httpLookupQuery({ config, limit: 100 })
      if (!q.success) throw fail(q, "http query")
      expect(q.data.ids.map(String)).toContain(id)
    },
    { timeout: 30_000 },
  )
})

describe("e2e reg-filtering: sieve script lifecycles", () => {
  test(
    "sieveSystemScriptCreate then get/query/update round trip",
    async () => {
      const c = await sieveSystemScriptCreate({
        config,
        script: { name: tag, contents: 'require "fileinto";\n', isActive: false },
      })
      if (!c.success) throw fail(c, "system script create")
      created.sysScript = c.data.created?.script?.id
      expect(created.sysScript).toBeString()
      const id = created.sysScript as string

      const g = await sieveSystemScriptGet({ config, ids: [id] })
      if (!g.success) throw fail(g, "system script get")
      expect(g.data.list[0]?.name).toBe(tag)

      const q = await sieveSystemScriptQuery({ config, filter: { name: tag } })
      if (!q.success) throw fail(q, "system script query")
      expect(q.data.ids.map(String)).toContain(id)

      const u = await sieveSystemScriptSet({ config, update: { [id]: { description: tag } } })
      if (!u.success) throw fail(u, "system script update")
      const g2 = await sieveSystemScriptGet({ config, ids: [id], properties: ["description"] })
      if (!g2.success) throw fail(g2, "system script re-get")
      expect(g2.data.list[0]?.description).toBe(tag)
    },
    { timeout: 30_000 },
  )

  test(
    "sieveUserScript create/get/query/update round trip",
    async () => {
      const c = await sieveUserScriptSet({
        config,
        create: { n1: { name: tag, contents: 'require "fileinto";\n', isActive: false } },
      })
      if (!c.success) throw fail(c, "user script create")
      created.userScript = c.data.created?.n1?.id
      expect(created.userScript).toBeString()
      const id = created.userScript as string

      const g = await sieveUserScriptGet({ config, ids: [id] })
      if (!g.success) throw fail(g, "user script get")
      expect(g.data.list[0]?.name).toBe(tag)

      const q = await sieveUserScriptQuery({ config, filter: { name: tag } })
      if (!q.success) throw fail(q, "user script query")
      expect(q.data.ids.map(String)).toContain(id)

      const u = await sieveUserScriptSet({ config, update: { [id]: { description: tag } } })
      if (!u.success) throw fail(u, "user script update")
      const g2 = await sieveUserScriptGet({ config, ids: [id], properties: ["description"] })
      if (!g2.success) throw fail(g2, "user script re-get")
      expect(g2.data.list[0]?.description).toBe(tag)
    },
    { timeout: 30_000 },
  )

  test(
    "invalid sieve contents are rejected with a contents validation error",
    async () => {
      const r = await sieveSystemScriptSet({
        config,
        create: { bad: { name: `${tag}-bad`, contents: "this is not sieve {{{", isActive: false } },
      })
      expect(r.success).toBe(false)
      if (!r.success) {
        expect(r.errorData ?? "").toContain("Failed to compile system Sieve script")
        expect(r.errorData ?? "").toContain("contents")
      }
    },
    { timeout: 30_000 },
  )
})

describe("e2e reg-filtering: spam views and training samples", () => {
  test(
    "spam views query their namespaces",
    async () => {
      for (const query of [spamBlockedDomainQuery, spamTrapQuery, spamTrustedDomainQuery, spamUrlRedirectorQuery]) {
        const r = await query({ config, limit: 10 })
        if (!r.success) throw fail(r, "spam view query")
        expect(Array.isArray(r.data.ids)).toBe(true)
      }
    },
    { timeout: 30_000 },
  )

  test(
    "spamTrainingSample query and get succeed",
    async () => {
      const q = await spamTrainingSampleQuery({ config, limit: 10 })
      if (!q.success) throw fail(q, "training sample query")
      expect(Array.isArray(q.data.ids)).toBe(true)
      const g = await spamTrainingSampleGet({ config })
      if (!g.success) throw fail(g, "training sample get")
      expect(Array.isArray(g.data.list)).toBe(true)
    },
    { timeout: 30_000 },
  )
})

describe("e2e reg-filtering: singleton reversible updates", () => {
  test(
    "spamClassifier minSpamSamples round trip",
    async () => {
      const g = await spamClassifierGet({ config })
      if (!g.success) throw fail(g, "classifier get")
      const orig = g.data.list[0]?.minSpamSamples as number
      expect(orig).toBeNumber()
      const u = await spamClassifierSet({ config, update: { singleton: { minSpamSamples: orig + 1 } } })
      if (!u.success) throw fail(u, "classifier update")
      const g2 = await spamClassifierGet({ config, properties: ["minSpamSamples"] })
      if (!g2.success) throw fail(g2, "classifier re-get")
      expect(g2.data.list[0]?.minSpamSamples).toBe(orig + 1)
      const back = await spamClassifierSet({ config, update: { singleton: { minSpamSamples: orig } } })
      if (!back.success) throw fail(back, "classifier restore")
    },
    { timeout: 30_000 },
  )

  test(
    "spamDnsblSettings ipLimit round trip",
    async () => {
      const g = await spamDnsblSettingsGet({ config })
      if (!g.success) throw fail(g, "dnsbl settings get")
      const orig = g.data.list[0]?.ipLimit as number
      const u = await spamDnsblSettingsSet({ config, update: { singleton: { ipLimit: orig + 1 } } })
      if (!u.success) throw fail(u, "dnsbl settings update")
      const g2 = await spamDnsblSettingsGet({ config, properties: ["ipLimit"] })
      if (!g2.success) throw fail(g2, "dnsbl settings re-get")
      expect(g2.data.list[0]?.ipLimit).toBe(orig + 1)
      const back = await spamDnsblSettingsSet({ config, update: { singleton: { ipLimit: orig } } })
      if (!back.success) throw fail(back, "dnsbl settings restore")
    },
    { timeout: 30_000 },
  )

  test(
    "spamLlm stays disabled (enterprise Enable needs an AiModel)",
    async () => {
      const g = await spamLlmGet({ config })
      if (!g.success) throw fail(g, "llm get")
      expect(g.data.list[0]?.["@type"]).toBe("Disable")
      const u = await spamLlmSet({ config, update: { singleton: { "@type": "Disable" } } })
      if (!u.success) throw fail(u, "llm disable set")
    },
    { timeout: 30_000 },
  )

  test(
    "spamPyzor port round trip",
    async () => {
      const g = await spamPyzorGet({ config })
      if (!g.success) throw fail(g, "pyzor get")
      const orig = g.data.list[0]?.port as number
      const u = await spamPyzorSet({ config, update: { singleton: { port: orig + 1 } } })
      if (!u.success) throw fail(u, "pyzor update")
      const g2 = await spamPyzorGet({ config, properties: ["port"] })
      if (!g2.success) throw fail(g2, "pyzor re-get")
      expect(g2.data.list[0]?.port).toBe(orig + 1)
      const back = await spamPyzorSet({ config, update: { singleton: { port: orig } } })
      if (!back.success) throw fail(back, "pyzor restore")
    },
    { timeout: 30_000 },
  )

  test(
    "spamSettings scoreSpam round trip",
    async () => {
      const g = await spamSettingsGet({ config })
      if (!g.success) throw fail(g, "spam settings get")
      const orig = g.data.list[0]?.scoreSpam as number
      const u = await spamSettingsSet({ config, update: { singleton: { scoreSpam: orig + 1 } } })
      if (!u.success) throw fail(u, "spam settings update")
      const g2 = await spamSettingsGet({ config, properties: ["scoreSpam"] })
      if (!g2.success) throw fail(g2, "spam settings re-get")
      expect(g2.data.list[0]?.scoreSpam).toBe(orig + 1)
      const back = await spamSettingsSet({ config, update: { singleton: { scoreSpam: orig } } })
      if (!back.success) throw fail(back, "spam settings restore")
    },
    { timeout: 30_000 },
  )

  test(
    "asn timeout round trip",
    async () => {
      const g = await asnGet({ config })
      if (!g.success) throw fail(g, "asn get")
      const orig = g.data.list[0]?.timeout as number
      expect(orig).toBeNumber()
      const u = await asnSet({ config, update: { singleton: { timeout: orig + 1000 } } })
      if (!u.success) throw fail(u, "asn update")
      const g2 = await asnGet({ config, properties: ["timeout"] })
      if (!g2.success) throw fail(g2, "asn re-get")
      expect(g2.data.list[0]?.timeout).toBe(orig + 1000)
      const back = await asnSet({ config, update: { singleton: { timeout: orig } } })
      if (!back.success) throw fail(back, "asn restore")
    },
    { timeout: 30_000 },
  )

  test(
    "sieveSystemInterpreter maxNestedIncludes round trip",
    async () => {
      const g = await sieveSystemInterpreterGet({ config })
      if (!g.success) throw fail(g, "system interpreter get")
      const orig = g.data.list[0]?.maxNestedIncludes as number
      const u = await sieveSystemInterpreterSet({ config, update: { singleton: { maxNestedIncludes: orig + 1 } } })
      if (!u.success) throw fail(u, "system interpreter update")
      const g2 = await sieveSystemInterpreterGet({ config, properties: ["maxNestedIncludes"] })
      if (!g2.success) throw fail(g2, "system interpreter re-get")
      expect(g2.data.list[0]?.maxNestedIncludes).toBe(orig + 1)
      const back = await sieveSystemInterpreterSet({ config, update: { singleton: { maxNestedIncludes: orig } } })
      if (!back.success) throw fail(back, "system interpreter restore")
    },
    { timeout: 30_000 },
  )

  test(
    "sieveUserInterpreter maxIncludes round trip",
    async () => {
      const g = await sieveUserInterpreterGet({ config })
      if (!g.success) throw fail(g, "user interpreter get")
      const orig = g.data.list[0]?.maxIncludes as number
      const u = await sieveUserInterpreterSet({ config, update: { singleton: { maxIncludes: orig + 1 } } })
      if (!u.success) throw fail(u, "user interpreter update")
      const g2 = await sieveUserInterpreterGet({ config, properties: ["maxIncludes"] })
      if (!g2.success) throw fail(g2, "user interpreter re-get")
      expect(g2.data.list[0]?.maxIncludes).toBe(orig + 1)
      const back = await sieveUserInterpreterSet({ config, update: { singleton: { maxIncludes: orig } } })
      if (!back.success) throw fail(back, "user interpreter restore")
    },
    { timeout: 30_000 },
  )

  test(
    "senderAuth dkimStrict flip round trip",
    async () => {
      const g = await senderAuthGet({ config })
      if (!g.success) throw fail(g, "senderAuth get")
      const orig = g.data.list[0]?.dkimStrict as boolean
      const u = await senderAuthSet({ config, update: { singleton: { dkimStrict: !orig } } })
      if (!u.success) throw fail(u, "senderAuth update")
      const g2 = await senderAuthGet({ config, properties: ["dkimStrict"] })
      if (!g2.success) throw fail(g2, "senderAuth re-get")
      expect(g2.data.list[0]?.dkimStrict).toBe(!orig)
      const back = await senderAuthSet({ config, update: { singleton: { dkimStrict: orig } } })
      if (!back.success) throw fail(back, "senderAuth restore")
    },
    { timeout: 30_000 },
  )

  test(
    "reportSettings inboundReportForwarding flip round trip",
    async () => {
      const g = await reportSettingsGet({ config })
      if (!g.success) throw fail(g, "reportSettings get")
      const orig = g.data.list[0]?.inboundReportForwarding as boolean
      const u = await reportSettingsSet({ config, update: { singleton: { inboundReportForwarding: !orig } } })
      if (!u.success) throw fail(u, "reportSettings update")
      const g2 = await reportSettingsGet({ config, properties: ["inboundReportForwarding"] })
      if (!g2.success) throw fail(g2, "reportSettings re-get")
      expect(g2.data.list[0]?.inboundReportForwarding).toBe(!orig)
      const back = await reportSettingsSet({ config, update: { singleton: { inboundReportForwarding: orig } } })
      if (!back.success) throw fail(back, "reportSettings restore")
    },
    { timeout: 30_000 },
  )

  test(
    "dkimReportSettings subject round trip",
    async () => {
      const g = await dkimReportSettingsGet({ config })
      if (!g.success) throw fail(g, "dkim report get")
      const orig = (g.data.list[0]?.subject as { else?: string } | undefined)?.else
      expect(orig).toBeString()
      const changed = `${orig} + 'e2e'`
      const u = await dkimReportSettingsSet({ config, update: { singleton: { subject: { else: changed } } } })
      if (!u.success) throw fail(u, "dkim report update")
      const g2 = await dkimReportSettingsGet({ config, properties: ["subject"] })
      if (!g2.success) throw fail(g2, "dkim report re-get")
      expect((g2.data.list[0]?.subject as { else?: string } | undefined)?.else).toBe(changed)
      const back = await dkimReportSettingsSet({ config, update: { singleton: { subject: { else: orig } } } })
      if (!back.success) throw fail(back, "dkim report restore")
    },
    { timeout: 30_000 },
  )

  test(
    "dmarcReportSettings aggregateFromAddress round trip",
    async () => {
      const g = await dmarcReportSettingsGet({ config })
      if (!g.success) throw fail(g, "dmarc report get")
      const orig = (g.data.list[0]?.aggregateFromAddress as { else?: string } | undefined)?.else
      expect(orig).toBeString()
      const changed = `${orig} + 'e2e'`
      const u = await dmarcReportSettingsSet({
        config,
        update: { singleton: { aggregateFromAddress: { else: changed } } },
      })
      if (!u.success) throw fail(u, "dmarc report update")
      const g2 = await dmarcReportSettingsGet({ config, properties: ["aggregateFromAddress"] })
      if (!g2.success) throw fail(g2, "dmarc report re-get")
      expect((g2.data.list[0]?.aggregateFromAddress as { else?: string } | undefined)?.else).toBe(changed)
      const back = await dmarcReportSettingsSet({
        config,
        update: { singleton: { aggregateFromAddress: { else: orig } } },
      })
      if (!back.success) throw fail(back, "dmarc report restore")
    },
    { timeout: 30_000 },
  )

  test(
    "dsnReportSettings fromName round trip",
    async () => {
      const g = await dsnReportSettingsGet({ config })
      if (!g.success) throw fail(g, "dsn report get")
      const orig = (g.data.list[0]?.fromName as { else?: string } | undefined)?.else
      expect(orig).toBeString()
      const changed = `${orig} + 'e2e'`
      const u = await dsnReportSettingsSet({ config, update: { singleton: { fromName: { else: changed } } } })
      if (!u.success) throw fail(u, "dsn report update")
      const g2 = await dsnReportSettingsGet({ config, properties: ["fromName"] })
      if (!g2.success) throw fail(g2, "dsn report re-get")
      expect((g2.data.list[0]?.fromName as { else?: string } | undefined)?.else).toBe(changed)
      const back = await dsnReportSettingsSet({ config, update: { singleton: { fromName: { else: orig } } } })
      if (!back.success) throw fail(back, "dsn report restore")
    },
    { timeout: 30_000 },
  )

  test(
    "spfReportSettings subject round trip",
    async () => {
      const g = await spfReportSettingsGet({ config })
      if (!g.success) throw fail(g, "spf report get")
      const orig = (g.data.list[0]?.subject as { else?: string } | undefined)?.else
      expect(orig).toBeString()
      const changed = `${orig} + 'e2e'`
      const u = await spfReportSettingsSet({ config, update: { singleton: { subject: { else: changed } } } })
      if (!u.success) throw fail(u, "spf report update")
      const g2 = await spfReportSettingsGet({ config, properties: ["subject"] })
      if (!g2.success) throw fail(g2, "spf report re-get")
      expect((g2.data.list[0]?.subject as { else?: string } | undefined)?.else).toBe(changed)
      const back = await spfReportSettingsSet({ config, update: { singleton: { subject: { else: orig } } } })
      if (!back.success) throw fail(back, "spf report restore")
    },
    { timeout: 30_000 },
  )

  test(
    "tlsReportSettings subject round trip",
    async () => {
      const g = await tlsReportSettingsGet({ config })
      if (!g.success) throw fail(g, "tls report get")
      const orig = (g.data.list[0]?.subject as { else?: string } | undefined)?.else
      expect(orig).toBeString()
      const changed = `${orig} + 'e2e'`
      const u = await tlsReportSettingsSet({ config, update: { singleton: { subject: { else: changed } } } })
      if (!u.success) throw fail(u, "tls report update")
      const g2 = await tlsReportSettingsGet({ config, properties: ["subject"] })
      if (!g2.success) throw fail(g2, "tls report re-get")
      expect((g2.data.list[0]?.subject as { else?: string } | undefined)?.else).toBe(changed)
      const back = await tlsReportSettingsSet({ config, update: { singleton: { subject: { else: orig } } } })
      if (!back.success) throw fail(back, "tls report restore")
    },
    { timeout: 30_000 },
  )
})
