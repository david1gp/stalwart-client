import { afterEach, describe, expect, test } from "bun:test"
import { stalwartClientConfig } from "../src/client/stalwartClientConfig.js"
import { spamDnsblServerGet } from "../src/registry/spam/spamDnsblServerGet.js"
import { spamDnsblServerSet } from "../src/registry/spam/spamDnsblServerSet.js"
import { spamFileExtensionGet } from "../src/registry/spam/spamFileExtensionGet.js"
import { spamFileExtensionSet } from "../src/registry/spam/spamFileExtensionSet.js"
import { spamRuleGet } from "../src/registry/spam/spamRuleGet.js"
import { spamRuleSet } from "../src/registry/spam/spamRuleSet.js"
import { spamTagGet } from "../src/registry/spam/spamTagGet.js"
import { spamTagSet } from "../src/registry/spam/spamTagSet.js"
import { spamTrainingSampleGet } from "../src/registry/spam/spamTrainingSampleGet.js"
import { spamTrainingSampleSet } from "../src/registry/spam/spamTrainingSampleSet.js"
import { sieveSystemScriptGet } from "../src/registry/sieve/sieveSystemScriptGet.js"
import { sieveSystemScriptSet } from "../src/registry/sieve/sieveSystemScriptSet.js"
import { sieveUserScriptGet } from "../src/registry/sieve/sieveUserScriptGet.js"
import { sieveUserScriptSet } from "../src/registry/sieve/sieveUserScriptSet.js"
import { memoryLookupKeyGet } from "../src/registry/lookups/memoryLookupKeyGet.js"
import { memoryLookupKeySet } from "../src/registry/lookups/memoryLookupKeySet.js"
import { memoryLookupKeyValueGet } from "../src/registry/lookups/memoryLookupKeyValueGet.js"
import { memoryLookupKeyValueSet } from "../src/registry/lookups/memoryLookupKeyValueSet.js"
import { storeLookupGet } from "../src/registry/lookups/storeLookupGet.js"
import { storeLookupSet } from "../src/registry/lookups/storeLookupSet.js"
import { httpLookupGet } from "../src/registry/lookups/httpLookupGet.js"
import { httpLookupSet } from "../src/registry/lookups/httpLookupSet.js"
import { spamClassifierGet } from "../src/registry/spam/spamClassifierGet.js"
import { spamClassifierSet } from "../src/registry/spam/spamClassifierSet.js"
import { spamDnsblSettingsGet } from "../src/registry/spam/spamDnsblSettingsGet.js"
import { spamDnsblSettingsSet } from "../src/registry/spam/spamDnsblSettingsSet.js"
import { spamLlmGet } from "../src/registry/spam/spamLlmGet.js"
import { spamLlmSet } from "../src/registry/spam/spamLlmSet.js"
import { spamPyzorGet } from "../src/registry/spam/spamPyzorGet.js"
import { spamPyzorSet } from "../src/registry/spam/spamPyzorSet.js"
import { spamSettingsGet } from "../src/registry/spam/spamSettingsGet.js"
import { spamSettingsSet } from "../src/registry/spam/spamSettingsSet.js"
import { sieveSystemInterpreterGet } from "../src/registry/sieve/sieveSystemInterpreterGet.js"
import { sieveSystemInterpreterSet } from "../src/registry/sieve/sieveSystemInterpreterSet.js"
import { sieveUserInterpreterGet } from "../src/registry/sieve/sieveUserInterpreterGet.js"
import { sieveUserInterpreterSet } from "../src/registry/sieve/sieveUserInterpreterSet.js"
import { asnGet } from "../src/registry/lookups/asnGet.js"
import { asnSet } from "../src/registry/lookups/asnSet.js"
import { senderAuthGet } from "../src/registry/reportSettings/senderAuthGet.js"
import { senderAuthSet } from "../src/registry/reportSettings/senderAuthSet.js"
import { reportSettingsGet } from "../src/registry/reportSettings/reportSettingsGet.js"
import { reportSettingsSet } from "../src/registry/reportSettings/reportSettingsSet.js"
import { dkimReportSettingsGet } from "../src/registry/reportSettings/dkimReportSettingsGet.js"
import { dkimReportSettingsSet } from "../src/registry/reportSettings/dkimReportSettingsSet.js"
import { dmarcReportSettingsGet } from "../src/registry/reportSettings/dmarcReportSettingsGet.js"
import { dmarcReportSettingsSet } from "../src/registry/reportSettings/dmarcReportSettingsSet.js"
import { dsnReportSettingsGet } from "../src/registry/reportSettings/dsnReportSettingsGet.js"
import { dsnReportSettingsSet } from "../src/registry/reportSettings/dsnReportSettingsSet.js"
import { spfReportSettingsGet } from "../src/registry/reportSettings/spfReportSettingsGet.js"
import { spfReportSettingsSet } from "../src/registry/reportSettings/spfReportSettingsSet.js"
import { tlsReportSettingsGet } from "../src/registry/reportSettings/tlsReportSettingsGet.js"
import { tlsReportSettingsSet } from "../src/registry/reportSettings/tlsReportSettingsSet.js"
import { spamDnsblServerQuery } from "../src/registry/spam/spamDnsblServerQuery.js"
import { spamFileExtensionQuery } from "../src/registry/spam/spamFileExtensionQuery.js"
import { spamRuleQuery } from "../src/registry/spam/spamRuleQuery.js"
import { spamTagQuery } from "../src/registry/spam/spamTagQuery.js"
import { sieveSystemScriptQuery } from "../src/registry/sieve/sieveSystemScriptQuery.js"
import { sieveUserScriptQuery } from "../src/registry/sieve/sieveUserScriptQuery.js"
import { memoryLookupKeyQuery } from "../src/registry/lookups/memoryLookupKeyQuery.js"
import { memoryLookupKeyValueQuery } from "../src/registry/lookups/memoryLookupKeyValueQuery.js"
import { storeLookupQuery } from "../src/registry/lookups/storeLookupQuery.js"
import { httpLookupQuery } from "../src/registry/lookups/httpLookupQuery.js"
import { spamTrainingSampleQuery } from "../src/registry/spam/spamTrainingSampleQuery.js"
import { spamBlockedDomainQuery } from "../src/registry/spam/spamBlockedDomainQuery.js"
import { spamTrapQuery } from "../src/registry/spam/spamTrapQuery.js"
import { spamTrustedDomainQuery } from "../src/registry/spam/spamTrustedDomainQuery.js"
import { spamUrlRedirectorQuery } from "../src/registry/spam/spamUrlRedirectorQuery.js"
import { sieveSystemScriptCreate } from "../src/registry/sieve/sieveSystemScriptCreate.js"
import { fetchMockCreate, fetchMockJson } from "./fetchMock.js"
import { jmapTestSessionCreate } from "./jmapTestSession.js"

const config = stalwartClientConfig({ baseUrl: "https://mail.example.com", username: "admin", password: "pw" })
if (!config.success) throw new Error("fixture config invalid")

/** Mock one JMAP method response and record every request body. */
function mockMethod(method: string, payload: Record<string, unknown>) {
  const sent: { using: string[]; methodCalls: [string, Record<string, unknown>, string][] }[] = []
  const mock = fetchMockCreate((request) => {
    if (new URL(request.url).pathname === "/jmap/session") return fetchMockJson(jmapTestSessionCreate())
    sent.push(JSON.parse(String(request.body)))
    return fetchMockJson({ methodResponses: [[method, payload, "c1"]], sessionState: "1" })
  })
  return { mock, sent }
}

const USING = ["urn:ietf:params:jmap:core", "urn:stalwart:jmap"]

let mock: ReturnType<typeof fetchMockCreate> | undefined
afterEach(() => {
  mock?.restore()
  mock = undefined
})

describe("reg-filtering object get", () => {
  test("spamDnsblServer sends x:SpamDnsblServer/get with ids and properties", async () => {
    const m = mockMethod("x:SpamDnsblServer/get", { list: [{ id: "o1" }], notFound: [] })
    mock = m.mock
    const r = await spamDnsblServerGet({ config: config.data, ids: ["o1"], properties: ["id"] })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]).toEqual(["x:SpamDnsblServer/get", { ids: ["o1"], properties: ["id"] }, "c1"])
  })

  test("spamFileExtension sends x:SpamFileExtension/get with ids and properties", async () => {
    const m = mockMethod("x:SpamFileExtension/get", { list: [{ id: "o1" }], notFound: [] })
    mock = m.mock
    const r = await spamFileExtensionGet({ config: config.data, ids: ["o1"], properties: ["id"] })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]).toEqual(["x:SpamFileExtension/get", { ids: ["o1"], properties: ["id"] }, "c1"])
  })

  test("spamRule sends x:SpamRule/get with ids and properties", async () => {
    const m = mockMethod("x:SpamRule/get", { list: [{ id: "o1" }], notFound: [] })
    mock = m.mock
    const r = await spamRuleGet({ config: config.data, ids: ["o1"], properties: ["id"] })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]).toEqual(["x:SpamRule/get", { ids: ["o1"], properties: ["id"] }, "c1"])
  })

  test("spamTag sends x:SpamTag/get with ids and properties", async () => {
    const m = mockMethod("x:SpamTag/get", { list: [{ id: "o1" }], notFound: [] })
    mock = m.mock
    const r = await spamTagGet({ config: config.data, ids: ["o1"], properties: ["id"] })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]).toEqual(["x:SpamTag/get", { ids: ["o1"], properties: ["id"] }, "c1"])
  })

  test("spamTrainingSample sends x:SpamTrainingSample/get with ids and properties", async () => {
    const m = mockMethod("x:SpamTrainingSample/get", { list: [{ id: "o1" }], notFound: [] })
    mock = m.mock
    const r = await spamTrainingSampleGet({ config: config.data, ids: ["o1"], properties: ["id"] })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]).toEqual(["x:SpamTrainingSample/get", { ids: ["o1"], properties: ["id"] }, "c1"])
  })

  test("sieveSystemScript sends x:SieveSystemScript/get with ids and properties", async () => {
    const m = mockMethod("x:SieveSystemScript/get", { list: [{ id: "o1" }], notFound: [] })
    mock = m.mock
    const r = await sieveSystemScriptGet({ config: config.data, ids: ["o1"], properties: ["id"] })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]).toEqual(["x:SieveSystemScript/get", { ids: ["o1"], properties: ["id"] }, "c1"])
  })

  test("sieveUserScript sends x:SieveUserScript/get with ids and properties", async () => {
    const m = mockMethod("x:SieveUserScript/get", { list: [{ id: "o1" }], notFound: [] })
    mock = m.mock
    const r = await sieveUserScriptGet({ config: config.data, ids: ["o1"], properties: ["id"] })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]).toEqual(["x:SieveUserScript/get", { ids: ["o1"], properties: ["id"] }, "c1"])
  })

  test("memoryLookupKey sends x:MemoryLookupKey/get with ids and properties", async () => {
    const m = mockMethod("x:MemoryLookupKey/get", { list: [{ id: "o1" }], notFound: [] })
    mock = m.mock
    const r = await memoryLookupKeyGet({ config: config.data, ids: ["o1"], properties: ["id"] })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]).toEqual(["x:MemoryLookupKey/get", { ids: ["o1"], properties: ["id"] }, "c1"])
  })

  test("memoryLookupKeyValue sends x:MemoryLookupKeyValue/get with ids and properties", async () => {
    const m = mockMethod("x:MemoryLookupKeyValue/get", { list: [{ id: "o1" }], notFound: [] })
    mock = m.mock
    const r = await memoryLookupKeyValueGet({ config: config.data, ids: ["o1"], properties: ["id"] })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]).toEqual(["x:MemoryLookupKeyValue/get", { ids: ["o1"], properties: ["id"] }, "c1"])
  })

  test("storeLookup sends x:StoreLookup/get with ids and properties", async () => {
    const m = mockMethod("x:StoreLookup/get", { list: [{ id: "o1" }], notFound: [] })
    mock = m.mock
    const r = await storeLookupGet({ config: config.data, ids: ["o1"], properties: ["id"] })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]).toEqual(["x:StoreLookup/get", { ids: ["o1"], properties: ["id"] }, "c1"])
  })

  test("httpLookup sends x:HttpLookup/get with ids and properties", async () => {
    const m = mockMethod("x:HttpLookup/get", { list: [{ id: "o1" }], notFound: [] })
    mock = m.mock
    const r = await httpLookupGet({ config: config.data, ids: ["o1"], properties: ["id"] })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]).toEqual(["x:HttpLookup/get", { ids: ["o1"], properties: ["id"] }, "c1"])
  })
})

describe("reg-filtering object query", () => {
  test("spamDnsblServer sends x:SpamDnsblServer/query with filter, sort and limit", async () => {
    const m = mockMethod("x:SpamDnsblServer/query", { ids: ["o1"], position: 0, queryState: "n" })
    mock = m.mock
    const r = await spamDnsblServerQuery({
      config: config.data,
      filter: { name: "x" },
      sort: [{ property: "name" }],
      limit: 10,
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.ids).toEqual(["o1"])
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]).toEqual([
      "x:SpamDnsblServer/query",
      { filter: { name: "x" }, sort: [{ property: "name" }], limit: 10 },
      "c1",
    ])
  })

  test("spamFileExtension sends x:SpamFileExtension/query with filter, sort and limit", async () => {
    const m = mockMethod("x:SpamFileExtension/query", { ids: ["o1"], position: 0, queryState: "n" })
    mock = m.mock
    const r = await spamFileExtensionQuery({
      config: config.data,
      filter: { name: "x" },
      sort: [{ property: "name" }],
      limit: 10,
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.ids).toEqual(["o1"])
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]).toEqual([
      "x:SpamFileExtension/query",
      { filter: { name: "x" }, sort: [{ property: "name" }], limit: 10 },
      "c1",
    ])
  })

  test("spamRule sends x:SpamRule/query with filter, sort and limit", async () => {
    const m = mockMethod("x:SpamRule/query", { ids: ["o1"], position: 0, queryState: "n" })
    mock = m.mock
    const r = await spamRuleQuery({
      config: config.data,
      filter: { name: "x" },
      sort: [{ property: "name" }],
      limit: 10,
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.ids).toEqual(["o1"])
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]).toEqual([
      "x:SpamRule/query",
      { filter: { name: "x" }, sort: [{ property: "name" }], limit: 10 },
      "c1",
    ])
  })

  test("spamTag sends x:SpamTag/query with filter, sort and limit", async () => {
    const m = mockMethod("x:SpamTag/query", { ids: ["o1"], position: 0, queryState: "n" })
    mock = m.mock
    const r = await spamTagQuery({
      config: config.data,
      filter: { name: "x" },
      sort: [{ property: "name" }],
      limit: 10,
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.ids).toEqual(["o1"])
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]).toEqual([
      "x:SpamTag/query",
      { filter: { name: "x" }, sort: [{ property: "name" }], limit: 10 },
      "c1",
    ])
  })

  test("sieveSystemScript sends x:SieveSystemScript/query with filter, sort and limit", async () => {
    const m = mockMethod("x:SieveSystemScript/query", { ids: ["o1"], position: 0, queryState: "n" })
    mock = m.mock
    const r = await sieveSystemScriptQuery({
      config: config.data,
      filter: { name: "x" },
      sort: [{ property: "name" }],
      limit: 10,
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.ids).toEqual(["o1"])
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]).toEqual([
      "x:SieveSystemScript/query",
      { filter: { name: "x" }, sort: [{ property: "name" }], limit: 10 },
      "c1",
    ])
  })

  test("sieveUserScript sends x:SieveUserScript/query with filter, sort and limit", async () => {
    const m = mockMethod("x:SieveUserScript/query", { ids: ["o1"], position: 0, queryState: "n" })
    mock = m.mock
    const r = await sieveUserScriptQuery({
      config: config.data,
      filter: { name: "x" },
      sort: [{ property: "name" }],
      limit: 10,
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.ids).toEqual(["o1"])
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]).toEqual([
      "x:SieveUserScript/query",
      { filter: { name: "x" }, sort: [{ property: "name" }], limit: 10 },
      "c1",
    ])
  })

  test("memoryLookupKey sends x:MemoryLookupKey/query with filter, sort and limit", async () => {
    const m = mockMethod("x:MemoryLookupKey/query", { ids: ["o1"], position: 0, queryState: "n" })
    mock = m.mock
    const r = await memoryLookupKeyQuery({
      config: config.data,
      filter: { name: "x" },
      sort: [{ property: "name" }],
      limit: 10,
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.ids).toEqual(["o1"])
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]).toEqual([
      "x:MemoryLookupKey/query",
      { filter: { name: "x" }, sort: [{ property: "name" }], limit: 10 },
      "c1",
    ])
  })

  test("memoryLookupKeyValue sends x:MemoryLookupKeyValue/query with filter, sort and limit", async () => {
    const m = mockMethod("x:MemoryLookupKeyValue/query", { ids: ["o1"], position: 0, queryState: "n" })
    mock = m.mock
    const r = await memoryLookupKeyValueQuery({
      config: config.data,
      filter: { name: "x" },
      sort: [{ property: "name" }],
      limit: 10,
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.ids).toEqual(["o1"])
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]).toEqual([
      "x:MemoryLookupKeyValue/query",
      { filter: { name: "x" }, sort: [{ property: "name" }], limit: 10 },
      "c1",
    ])
  })

  test("storeLookup sends x:StoreLookup/query with filter, sort and limit", async () => {
    const m = mockMethod("x:StoreLookup/query", { ids: ["o1"], position: 0, queryState: "n" })
    mock = m.mock
    const r = await storeLookupQuery({
      config: config.data,
      filter: { name: "x" },
      sort: [{ property: "name" }],
      limit: 10,
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.ids).toEqual(["o1"])
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]).toEqual([
      "x:StoreLookup/query",
      { filter: { name: "x" }, sort: [{ property: "name" }], limit: 10 },
      "c1",
    ])
  })

  test("httpLookup sends x:HttpLookup/query with filter, sort and limit", async () => {
    const m = mockMethod("x:HttpLookup/query", { ids: ["o1"], position: 0, queryState: "n" })
    mock = m.mock
    const r = await httpLookupQuery({
      config: config.data,
      filter: { name: "x" },
      sort: [{ property: "name" }],
      limit: 10,
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.ids).toEqual(["o1"])
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]).toEqual([
      "x:HttpLookup/query",
      { filter: { name: "x" }, sort: [{ property: "name" }], limit: 10 },
      "c1",
    ])
  })
})

describe("reg-filtering object set", () => {
  test("spamDnsblServer sends x:SpamDnsblServer/set create and returns created ids", async () => {
    const m = mockMethod("x:SpamDnsblServer/set", { created: { c1: { id: "n1" } } })
    mock = m.mock
    const r = await spamDnsblServerSet({ config: config.data, create: { c1: { name: "e2e-x" } } })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.created?.c1?.id).toBe("n1")
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]).toEqual(["x:SpamDnsblServer/set", { create: { c1: { name: "e2e-x" } } }, "c1"])
  })

  test("spamDnsblServer turns a notCreated entry into a ResultErr carrying the set response", async () => {
    const m = mockMethod("x:SpamDnsblServer/set", {
      notCreated: { c1: { type: "invalidProperties", description: "bad" } },
    })
    mock = m.mock
    const r = await spamDnsblServerSet({ config: config.data, create: { c1: { name: "bad" } } })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.op).toBe("registrySet")
      expect(r.errorData ?? "").toContain("notCreated")
    }
  })

  test("spamFileExtension sends x:SpamFileExtension/set create and returns created ids", async () => {
    const m = mockMethod("x:SpamFileExtension/set", { created: { c1: { id: "n1" } } })
    mock = m.mock
    const r = await spamFileExtensionSet({ config: config.data, create: { c1: { name: "e2e-x" } } })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.created?.c1?.id).toBe("n1")
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]).toEqual(["x:SpamFileExtension/set", { create: { c1: { name: "e2e-x" } } }, "c1"])
  })

  test("spamFileExtension turns a notCreated entry into a ResultErr carrying the set response", async () => {
    const m = mockMethod("x:SpamFileExtension/set", {
      notCreated: { c1: { type: "invalidProperties", description: "bad" } },
    })
    mock = m.mock
    const r = await spamFileExtensionSet({ config: config.data, create: { c1: { name: "bad" } } })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.op).toBe("registrySet")
      expect(r.errorData ?? "").toContain("notCreated")
    }
  })

  test("spamRule sends x:SpamRule/set create and returns created ids", async () => {
    const m = mockMethod("x:SpamRule/set", { created: { c1: { id: "n1" } } })
    mock = m.mock
    const r = await spamRuleSet({ config: config.data, create: { c1: { name: "e2e-x" } } })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.created?.c1?.id).toBe("n1")
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]).toEqual(["x:SpamRule/set", { create: { c1: { name: "e2e-x" } } }, "c1"])
  })

  test("spamRule turns a notCreated entry into a ResultErr carrying the set response", async () => {
    const m = mockMethod("x:SpamRule/set", { notCreated: { c1: { type: "invalidProperties", description: "bad" } } })
    mock = m.mock
    const r = await spamRuleSet({ config: config.data, create: { c1: { name: "bad" } } })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.op).toBe("registrySet")
      expect(r.errorData ?? "").toContain("notCreated")
    }
  })

  test("spamTag sends x:SpamTag/set create and returns created ids", async () => {
    const m = mockMethod("x:SpamTag/set", { created: { c1: { id: "n1" } } })
    mock = m.mock
    const r = await spamTagSet({ config: config.data, create: { c1: { name: "e2e-x" } } })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.created?.c1?.id).toBe("n1")
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]).toEqual(["x:SpamTag/set", { create: { c1: { name: "e2e-x" } } }, "c1"])
  })

  test("spamTag turns a notCreated entry into a ResultErr carrying the set response", async () => {
    const m = mockMethod("x:SpamTag/set", { notCreated: { c1: { type: "invalidProperties", description: "bad" } } })
    mock = m.mock
    const r = await spamTagSet({ config: config.data, create: { c1: { name: "bad" } } })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.op).toBe("registrySet")
      expect(r.errorData ?? "").toContain("notCreated")
    }
  })

  test("spamTrainingSample sends x:SpamTrainingSample/set create and returns created ids", async () => {
    const m = mockMethod("x:SpamTrainingSample/set", { created: { c1: { id: "n1" } } })
    mock = m.mock
    const r = await spamTrainingSampleSet({ config: config.data, create: { c1: { name: "e2e-x" } } })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.created?.c1?.id).toBe("n1")
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]).toEqual(["x:SpamTrainingSample/set", { create: { c1: { name: "e2e-x" } } }, "c1"])
  })

  test("spamTrainingSample turns a notCreated entry into a ResultErr carrying the set response", async () => {
    const m = mockMethod("x:SpamTrainingSample/set", {
      notCreated: { c1: { type: "invalidProperties", description: "bad" } },
    })
    mock = m.mock
    const r = await spamTrainingSampleSet({ config: config.data, create: { c1: { name: "bad" } } })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.op).toBe("registrySet")
      expect(r.errorData ?? "").toContain("notCreated")
    }
  })

  test("sieveSystemScript sends x:SieveSystemScript/set create and returns created ids", async () => {
    const m = mockMethod("x:SieveSystemScript/set", { created: { c1: { id: "n1" } } })
    mock = m.mock
    const r = await sieveSystemScriptSet({ config: config.data, create: { c1: { name: "e2e-x" } } })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.created?.c1?.id).toBe("n1")
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]).toEqual(["x:SieveSystemScript/set", { create: { c1: { name: "e2e-x" } } }, "c1"])
  })

  test("sieveSystemScript turns a notCreated entry into a ResultErr carrying the set response", async () => {
    const m = mockMethod("x:SieveSystemScript/set", {
      notCreated: { c1: { type: "invalidProperties", description: "bad" } },
    })
    mock = m.mock
    const r = await sieveSystemScriptSet({ config: config.data, create: { c1: { name: "bad" } } })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.op).toBe("registrySet")
      expect(r.errorData ?? "").toContain("notCreated")
    }
  })

  test("sieveUserScript sends x:SieveUserScript/set create and returns created ids", async () => {
    const m = mockMethod("x:SieveUserScript/set", { created: { c1: { id: "n1" } } })
    mock = m.mock
    const r = await sieveUserScriptSet({ config: config.data, create: { c1: { name: "e2e-x" } } })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.created?.c1?.id).toBe("n1")
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]).toEqual(["x:SieveUserScript/set", { create: { c1: { name: "e2e-x" } } }, "c1"])
  })

  test("sieveUserScript turns a notCreated entry into a ResultErr carrying the set response", async () => {
    const m = mockMethod("x:SieveUserScript/set", {
      notCreated: { c1: { type: "invalidProperties", description: "bad" } },
    })
    mock = m.mock
    const r = await sieveUserScriptSet({ config: config.data, create: { c1: { name: "bad" } } })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.op).toBe("registrySet")
      expect(r.errorData ?? "").toContain("notCreated")
    }
  })

  test("memoryLookupKey sends x:MemoryLookupKey/set create and returns created ids", async () => {
    const m = mockMethod("x:MemoryLookupKey/set", { created: { c1: { id: "n1" } } })
    mock = m.mock
    const r = await memoryLookupKeySet({ config: config.data, create: { c1: { name: "e2e-x" } } })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.created?.c1?.id).toBe("n1")
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]).toEqual(["x:MemoryLookupKey/set", { create: { c1: { name: "e2e-x" } } }, "c1"])
  })

  test("memoryLookupKey turns a notCreated entry into a ResultErr carrying the set response", async () => {
    const m = mockMethod("x:MemoryLookupKey/set", {
      notCreated: { c1: { type: "invalidProperties", description: "bad" } },
    })
    mock = m.mock
    const r = await memoryLookupKeySet({ config: config.data, create: { c1: { name: "bad" } } })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.op).toBe("registrySet")
      expect(r.errorData ?? "").toContain("notCreated")
    }
  })

  test("memoryLookupKeyValue sends x:MemoryLookupKeyValue/set create and returns created ids", async () => {
    const m = mockMethod("x:MemoryLookupKeyValue/set", { created: { c1: { id: "n1" } } })
    mock = m.mock
    const r = await memoryLookupKeyValueSet({ config: config.data, create: { c1: { name: "e2e-x" } } })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.created?.c1?.id).toBe("n1")
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]).toEqual([
      "x:MemoryLookupKeyValue/set",
      { create: { c1: { name: "e2e-x" } } },
      "c1",
    ])
  })

  test("memoryLookupKeyValue turns a notCreated entry into a ResultErr carrying the set response", async () => {
    const m = mockMethod("x:MemoryLookupKeyValue/set", {
      notCreated: { c1: { type: "invalidProperties", description: "bad" } },
    })
    mock = m.mock
    const r = await memoryLookupKeyValueSet({ config: config.data, create: { c1: { name: "bad" } } })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.op).toBe("registrySet")
      expect(r.errorData ?? "").toContain("notCreated")
    }
  })

  test("storeLookup sends x:StoreLookup/set create and returns created ids", async () => {
    const m = mockMethod("x:StoreLookup/set", { created: { c1: { id: "n1" } } })
    mock = m.mock
    const r = await storeLookupSet({ config: config.data, create: { c1: { name: "e2e-x" } } })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.created?.c1?.id).toBe("n1")
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]).toEqual(["x:StoreLookup/set", { create: { c1: { name: "e2e-x" } } }, "c1"])
  })

  test("storeLookup turns a notCreated entry into a ResultErr carrying the set response", async () => {
    const m = mockMethod("x:StoreLookup/set", { notCreated: { c1: { type: "invalidProperties", description: "bad" } } })
    mock = m.mock
    const r = await storeLookupSet({ config: config.data, create: { c1: { name: "bad" } } })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.op).toBe("registrySet")
      expect(r.errorData ?? "").toContain("notCreated")
    }
  })

  test("httpLookup sends x:HttpLookup/set create and returns created ids", async () => {
    const m = mockMethod("x:HttpLookup/set", { created: { c1: { id: "n1" } } })
    mock = m.mock
    const r = await httpLookupSet({ config: config.data, create: { c1: { name: "e2e-x" } } })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.created?.c1?.id).toBe("n1")
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]).toEqual(["x:HttpLookup/set", { create: { c1: { name: "e2e-x" } } }, "c1"])
  })

  test("httpLookup turns a notCreated entry into a ResultErr carrying the set response", async () => {
    const m = mockMethod("x:HttpLookup/set", { notCreated: { c1: { type: "invalidProperties", description: "bad" } } })
    mock = m.mock
    const r = await httpLookupSet({ config: config.data, create: { c1: { name: "bad" } } })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.op).toBe("registrySet")
      expect(r.errorData ?? "").toContain("notCreated")
    }
  })
})

describe("reg-filtering singleton get", () => {
  test('spamClassifier sends x:SpamClassifier/get with ids ["singleton"]', async () => {
    const m = mockMethod("x:SpamClassifier/get", { list: [{ id: "singleton" }], notFound: [] })
    mock = m.mock
    const r = await spamClassifierGet({ config: config.data })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]?.[0]).toBe("x:SpamClassifier/get")
    expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({ ids: ["singleton"] })
  })

  test('spamDnsblSettings sends x:SpamDnsblSettings/get with ids ["singleton"]', async () => {
    const m = mockMethod("x:SpamDnsblSettings/get", { list: [{ id: "singleton" }], notFound: [] })
    mock = m.mock
    const r = await spamDnsblSettingsGet({ config: config.data })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]?.[0]).toBe("x:SpamDnsblSettings/get")
    expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({ ids: ["singleton"] })
  })

  test('spamLlm sends x:SpamLlm/get with ids ["singleton"]', async () => {
    const m = mockMethod("x:SpamLlm/get", { list: [{ id: "singleton" }], notFound: [] })
    mock = m.mock
    const r = await spamLlmGet({ config: config.data })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]?.[0]).toBe("x:SpamLlm/get")
    expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({ ids: ["singleton"] })
  })

  test('spamPyzor sends x:SpamPyzor/get with ids ["singleton"]', async () => {
    const m = mockMethod("x:SpamPyzor/get", { list: [{ id: "singleton" }], notFound: [] })
    mock = m.mock
    const r = await spamPyzorGet({ config: config.data })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]?.[0]).toBe("x:SpamPyzor/get")
    expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({ ids: ["singleton"] })
  })

  test('spamSettings sends x:SpamSettings/get with ids ["singleton"]', async () => {
    const m = mockMethod("x:SpamSettings/get", { list: [{ id: "singleton" }], notFound: [] })
    mock = m.mock
    const r = await spamSettingsGet({ config: config.data })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]?.[0]).toBe("x:SpamSettings/get")
    expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({ ids: ["singleton"] })
  })

  test('sieveSystemInterpreter sends x:SieveSystemInterpreter/get with ids ["singleton"]', async () => {
    const m = mockMethod("x:SieveSystemInterpreter/get", { list: [{ id: "singleton" }], notFound: [] })
    mock = m.mock
    const r = await sieveSystemInterpreterGet({ config: config.data })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]?.[0]).toBe("x:SieveSystemInterpreter/get")
    expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({ ids: ["singleton"] })
  })

  test('sieveUserInterpreter sends x:SieveUserInterpreter/get with ids ["singleton"]', async () => {
    const m = mockMethod("x:SieveUserInterpreter/get", { list: [{ id: "singleton" }], notFound: [] })
    mock = m.mock
    const r = await sieveUserInterpreterGet({ config: config.data })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]?.[0]).toBe("x:SieveUserInterpreter/get")
    expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({ ids: ["singleton"] })
  })

  test('asn sends x:Asn/get with ids ["singleton"]', async () => {
    const m = mockMethod("x:Asn/get", { list: [{ id: "singleton" }], notFound: [] })
    mock = m.mock
    const r = await asnGet({ config: config.data })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]?.[0]).toBe("x:Asn/get")
    expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({ ids: ["singleton"] })
  })

  test('senderAuth sends x:SenderAuth/get with ids ["singleton"]', async () => {
    const m = mockMethod("x:SenderAuth/get", { list: [{ id: "singleton" }], notFound: [] })
    mock = m.mock
    const r = await senderAuthGet({ config: config.data })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]?.[0]).toBe("x:SenderAuth/get")
    expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({ ids: ["singleton"] })
  })

  test('reportSettings sends x:ReportSettings/get with ids ["singleton"]', async () => {
    const m = mockMethod("x:ReportSettings/get", { list: [{ id: "singleton" }], notFound: [] })
    mock = m.mock
    const r = await reportSettingsGet({ config: config.data })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]?.[0]).toBe("x:ReportSettings/get")
    expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({ ids: ["singleton"] })
  })

  test('dkimReportSettings sends x:DkimReportSettings/get with ids ["singleton"]', async () => {
    const m = mockMethod("x:DkimReportSettings/get", { list: [{ id: "singleton" }], notFound: [] })
    mock = m.mock
    const r = await dkimReportSettingsGet({ config: config.data })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]?.[0]).toBe("x:DkimReportSettings/get")
    expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({ ids: ["singleton"] })
  })

  test('dmarcReportSettings sends x:DmarcReportSettings/get with ids ["singleton"]', async () => {
    const m = mockMethod("x:DmarcReportSettings/get", { list: [{ id: "singleton" }], notFound: [] })
    mock = m.mock
    const r = await dmarcReportSettingsGet({ config: config.data })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]?.[0]).toBe("x:DmarcReportSettings/get")
    expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({ ids: ["singleton"] })
  })

  test('dsnReportSettings sends x:DsnReportSettings/get with ids ["singleton"]', async () => {
    const m = mockMethod("x:DsnReportSettings/get", { list: [{ id: "singleton" }], notFound: [] })
    mock = m.mock
    const r = await dsnReportSettingsGet({ config: config.data })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]?.[0]).toBe("x:DsnReportSettings/get")
    expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({ ids: ["singleton"] })
  })

  test('spfReportSettings sends x:SpfReportSettings/get with ids ["singleton"]', async () => {
    const m = mockMethod("x:SpfReportSettings/get", { list: [{ id: "singleton" }], notFound: [] })
    mock = m.mock
    const r = await spfReportSettingsGet({ config: config.data })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]?.[0]).toBe("x:SpfReportSettings/get")
    expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({ ids: ["singleton"] })
  })

  test('tlsReportSettings sends x:TlsReportSettings/get with ids ["singleton"]', async () => {
    const m = mockMethod("x:TlsReportSettings/get", { list: [{ id: "singleton" }], notFound: [] })
    mock = m.mock
    const r = await tlsReportSettingsGet({ config: config.data })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]?.[0]).toBe("x:TlsReportSettings/get")
    expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({ ids: ["singleton"] })
  })
})

describe("reg-filtering singleton set", () => {
  test("spamClassifier sends x:SpamClassifier/set update for the singleton", async () => {
    const m = mockMethod("x:SpamClassifier/set", { updated: { singleton: null } })
    mock = m.mock
    const r = await spamClassifierSet({ config: config.data, update: { singleton: { note: "x" } } })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]).toEqual(["x:SpamClassifier/set", { update: { singleton: { note: "x" } } }, "c1"])
  })

  test("spamClassifier turns a notUpdated entry into a ResultErr", async () => {
    const m = mockMethod("x:SpamClassifier/set", {
      notUpdated: { singleton: { type: "forbidden", description: "no" } },
    })
    mock = m.mock
    const r = await spamClassifierSet({ config: config.data, update: { singleton: { note: "x" } } })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.op).toBe("registrySet")
      expect(r.errorMessage).toContain("notUpdated")
    }
  })

  test("spamDnsblSettings sends x:SpamDnsblSettings/set update for the singleton", async () => {
    const m = mockMethod("x:SpamDnsblSettings/set", { updated: { singleton: null } })
    mock = m.mock
    const r = await spamDnsblSettingsSet({ config: config.data, update: { singleton: { note: "x" } } })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]).toEqual([
      "x:SpamDnsblSettings/set",
      { update: { singleton: { note: "x" } } },
      "c1",
    ])
  })

  test("spamDnsblSettings turns a notUpdated entry into a ResultErr", async () => {
    const m = mockMethod("x:SpamDnsblSettings/set", {
      notUpdated: { singleton: { type: "forbidden", description: "no" } },
    })
    mock = m.mock
    const r = await spamDnsblSettingsSet({ config: config.data, update: { singleton: { note: "x" } } })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.op).toBe("registrySet")
      expect(r.errorMessage).toContain("notUpdated")
    }
  })

  test("spamLlm sends x:SpamLlm/set update for the singleton", async () => {
    const m = mockMethod("x:SpamLlm/set", { updated: { singleton: null } })
    mock = m.mock
    const r = await spamLlmSet({ config: config.data, update: { singleton: { note: "x" } } })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]).toEqual(["x:SpamLlm/set", { update: { singleton: { note: "x" } } }, "c1"])
  })

  test("spamLlm turns a notUpdated entry into a ResultErr", async () => {
    const m = mockMethod("x:SpamLlm/set", { notUpdated: { singleton: { type: "forbidden", description: "no" } } })
    mock = m.mock
    const r = await spamLlmSet({ config: config.data, update: { singleton: { note: "x" } } })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.op).toBe("registrySet")
      expect(r.errorMessage).toContain("notUpdated")
    }
  })

  test("spamPyzor sends x:SpamPyzor/set update for the singleton", async () => {
    const m = mockMethod("x:SpamPyzor/set", { updated: { singleton: null } })
    mock = m.mock
    const r = await spamPyzorSet({ config: config.data, update: { singleton: { note: "x" } } })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]).toEqual(["x:SpamPyzor/set", { update: { singleton: { note: "x" } } }, "c1"])
  })

  test("spamPyzor turns a notUpdated entry into a ResultErr", async () => {
    const m = mockMethod("x:SpamPyzor/set", { notUpdated: { singleton: { type: "forbidden", description: "no" } } })
    mock = m.mock
    const r = await spamPyzorSet({ config: config.data, update: { singleton: { note: "x" } } })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.op).toBe("registrySet")
      expect(r.errorMessage).toContain("notUpdated")
    }
  })

  test("spamSettings sends x:SpamSettings/set update for the singleton", async () => {
    const m = mockMethod("x:SpamSettings/set", { updated: { singleton: null } })
    mock = m.mock
    const r = await spamSettingsSet({ config: config.data, update: { singleton: { note: "x" } } })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]).toEqual(["x:SpamSettings/set", { update: { singleton: { note: "x" } } }, "c1"])
  })

  test("spamSettings turns a notUpdated entry into a ResultErr", async () => {
    const m = mockMethod("x:SpamSettings/set", { notUpdated: { singleton: { type: "forbidden", description: "no" } } })
    mock = m.mock
    const r = await spamSettingsSet({ config: config.data, update: { singleton: { note: "x" } } })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.op).toBe("registrySet")
      expect(r.errorMessage).toContain("notUpdated")
    }
  })

  test("sieveSystemInterpreter sends x:SieveSystemInterpreter/set update for the singleton", async () => {
    const m = mockMethod("x:SieveSystemInterpreter/set", { updated: { singleton: null } })
    mock = m.mock
    const r = await sieveSystemInterpreterSet({ config: config.data, update: { singleton: { note: "x" } } })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]).toEqual([
      "x:SieveSystemInterpreter/set",
      { update: { singleton: { note: "x" } } },
      "c1",
    ])
  })

  test("sieveSystemInterpreter turns a notUpdated entry into a ResultErr", async () => {
    const m = mockMethod("x:SieveSystemInterpreter/set", {
      notUpdated: { singleton: { type: "forbidden", description: "no" } },
    })
    mock = m.mock
    const r = await sieveSystemInterpreterSet({ config: config.data, update: { singleton: { note: "x" } } })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.op).toBe("registrySet")
      expect(r.errorMessage).toContain("notUpdated")
    }
  })

  test("sieveUserInterpreter sends x:SieveUserInterpreter/set update for the singleton", async () => {
    const m = mockMethod("x:SieveUserInterpreter/set", { updated: { singleton: null } })
    mock = m.mock
    const r = await sieveUserInterpreterSet({ config: config.data, update: { singleton: { note: "x" } } })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]).toEqual([
      "x:SieveUserInterpreter/set",
      { update: { singleton: { note: "x" } } },
      "c1",
    ])
  })

  test("sieveUserInterpreter turns a notUpdated entry into a ResultErr", async () => {
    const m = mockMethod("x:SieveUserInterpreter/set", {
      notUpdated: { singleton: { type: "forbidden", description: "no" } },
    })
    mock = m.mock
    const r = await sieveUserInterpreterSet({ config: config.data, update: { singleton: { note: "x" } } })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.op).toBe("registrySet")
      expect(r.errorMessage).toContain("notUpdated")
    }
  })

  test("asn sends x:Asn/set update for the singleton", async () => {
    const m = mockMethod("x:Asn/set", { updated: { singleton: null } })
    mock = m.mock
    const r = await asnSet({ config: config.data, update: { singleton: { note: "x" } } })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]).toEqual(["x:Asn/set", { update: { singleton: { note: "x" } } }, "c1"])
  })

  test("asn turns a notUpdated entry into a ResultErr", async () => {
    const m = mockMethod("x:Asn/set", { notUpdated: { singleton: { type: "forbidden", description: "no" } } })
    mock = m.mock
    const r = await asnSet({ config: config.data, update: { singleton: { note: "x" } } })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.op).toBe("registrySet")
      expect(r.errorMessage).toContain("notUpdated")
    }
  })

  test("senderAuth sends x:SenderAuth/set update for the singleton", async () => {
    const m = mockMethod("x:SenderAuth/set", { updated: { singleton: null } })
    mock = m.mock
    const r = await senderAuthSet({ config: config.data, update: { singleton: { note: "x" } } })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]).toEqual(["x:SenderAuth/set", { update: { singleton: { note: "x" } } }, "c1"])
  })

  test("senderAuth turns a notUpdated entry into a ResultErr", async () => {
    const m = mockMethod("x:SenderAuth/set", { notUpdated: { singleton: { type: "forbidden", description: "no" } } })
    mock = m.mock
    const r = await senderAuthSet({ config: config.data, update: { singleton: { note: "x" } } })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.op).toBe("registrySet")
      expect(r.errorMessage).toContain("notUpdated")
    }
  })

  test("reportSettings sends x:ReportSettings/set update for the singleton", async () => {
    const m = mockMethod("x:ReportSettings/set", { updated: { singleton: null } })
    mock = m.mock
    const r = await reportSettingsSet({ config: config.data, update: { singleton: { note: "x" } } })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]).toEqual(["x:ReportSettings/set", { update: { singleton: { note: "x" } } }, "c1"])
  })

  test("reportSettings turns a notUpdated entry into a ResultErr", async () => {
    const m = mockMethod("x:ReportSettings/set", {
      notUpdated: { singleton: { type: "forbidden", description: "no" } },
    })
    mock = m.mock
    const r = await reportSettingsSet({ config: config.data, update: { singleton: { note: "x" } } })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.op).toBe("registrySet")
      expect(r.errorMessage).toContain("notUpdated")
    }
  })

  test("dkimReportSettings sends x:DkimReportSettings/set update for the singleton", async () => {
    const m = mockMethod("x:DkimReportSettings/set", { updated: { singleton: null } })
    mock = m.mock
    const r = await dkimReportSettingsSet({ config: config.data, update: { singleton: { note: "x" } } })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]).toEqual([
      "x:DkimReportSettings/set",
      { update: { singleton: { note: "x" } } },
      "c1",
    ])
  })

  test("dkimReportSettings turns a notUpdated entry into a ResultErr", async () => {
    const m = mockMethod("x:DkimReportSettings/set", {
      notUpdated: { singleton: { type: "forbidden", description: "no" } },
    })
    mock = m.mock
    const r = await dkimReportSettingsSet({ config: config.data, update: { singleton: { note: "x" } } })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.op).toBe("registrySet")
      expect(r.errorMessage).toContain("notUpdated")
    }
  })

  test("dmarcReportSettings sends x:DmarcReportSettings/set update for the singleton", async () => {
    const m = mockMethod("x:DmarcReportSettings/set", { updated: { singleton: null } })
    mock = m.mock
    const r = await dmarcReportSettingsSet({ config: config.data, update: { singleton: { note: "x" } } })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]).toEqual([
      "x:DmarcReportSettings/set",
      { update: { singleton: { note: "x" } } },
      "c1",
    ])
  })

  test("dmarcReportSettings turns a notUpdated entry into a ResultErr", async () => {
    const m = mockMethod("x:DmarcReportSettings/set", {
      notUpdated: { singleton: { type: "forbidden", description: "no" } },
    })
    mock = m.mock
    const r = await dmarcReportSettingsSet({ config: config.data, update: { singleton: { note: "x" } } })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.op).toBe("registrySet")
      expect(r.errorMessage).toContain("notUpdated")
    }
  })

  test("dsnReportSettings sends x:DsnReportSettings/set update for the singleton", async () => {
    const m = mockMethod("x:DsnReportSettings/set", { updated: { singleton: null } })
    mock = m.mock
    const r = await dsnReportSettingsSet({ config: config.data, update: { singleton: { note: "x" } } })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]).toEqual([
      "x:DsnReportSettings/set",
      { update: { singleton: { note: "x" } } },
      "c1",
    ])
  })

  test("dsnReportSettings turns a notUpdated entry into a ResultErr", async () => {
    const m = mockMethod("x:DsnReportSettings/set", {
      notUpdated: { singleton: { type: "forbidden", description: "no" } },
    })
    mock = m.mock
    const r = await dsnReportSettingsSet({ config: config.data, update: { singleton: { note: "x" } } })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.op).toBe("registrySet")
      expect(r.errorMessage).toContain("notUpdated")
    }
  })

  test("spfReportSettings sends x:SpfReportSettings/set update for the singleton", async () => {
    const m = mockMethod("x:SpfReportSettings/set", { updated: { singleton: null } })
    mock = m.mock
    const r = await spfReportSettingsSet({ config: config.data, update: { singleton: { note: "x" } } })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]).toEqual([
      "x:SpfReportSettings/set",
      { update: { singleton: { note: "x" } } },
      "c1",
    ])
  })

  test("spfReportSettings turns a notUpdated entry into a ResultErr", async () => {
    const m = mockMethod("x:SpfReportSettings/set", {
      notUpdated: { singleton: { type: "forbidden", description: "no" } },
    })
    mock = m.mock
    const r = await spfReportSettingsSet({ config: config.data, update: { singleton: { note: "x" } } })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.op).toBe("registrySet")
      expect(r.errorMessage).toContain("notUpdated")
    }
  })

  test("tlsReportSettings sends x:TlsReportSettings/set update for the singleton", async () => {
    const m = mockMethod("x:TlsReportSettings/set", { updated: { singleton: null } })
    mock = m.mock
    const r = await tlsReportSettingsSet({ config: config.data, update: { singleton: { note: "x" } } })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]).toEqual([
      "x:TlsReportSettings/set",
      { update: { singleton: { note: "x" } } },
      "c1",
    ])
  })

  test("tlsReportSettings turns a notUpdated entry into a ResultErr", async () => {
    const m = mockMethod("x:TlsReportSettings/set", {
      notUpdated: { singleton: { type: "forbidden", description: "no" } },
    })
    mock = m.mock
    const r = await tlsReportSettingsSet({ config: config.data, update: { singleton: { note: "x" } } })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.op).toBe("registrySet")
      expect(r.errorMessage).toContain("notUpdated")
    }
  })
})

describe("reg-filtering spam views", () => {
  test("spamBlockedDomainQuery queries MemoryLookupKey forced to namespace blocked-domains", async () => {
    const m = mockMethod("x:MemoryLookupKey/query", { ids: [], position: 0, queryState: "n" })
    mock = m.mock
    const r = await spamBlockedDomainQuery({ config: config.data, filter: { key: "x.test" }, limit: 5 })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]).toEqual([
      "x:MemoryLookupKey/query",
      { filter: { key: "x.test", namespace: "blocked-domains" }, limit: 5 },
      "c1",
    ])
  })

  test("spamTrapQuery queries MemoryLookupKey forced to namespace spam-traps", async () => {
    const m = mockMethod("x:MemoryLookupKey/query", { ids: [], position: 0, queryState: "n" })
    mock = m.mock
    const r = await spamTrapQuery({ config: config.data, filter: { key: "x.test" }, limit: 5 })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]).toEqual([
      "x:MemoryLookupKey/query",
      { filter: { key: "x.test", namespace: "spam-traps" }, limit: 5 },
      "c1",
    ])
  })

  test("spamTrustedDomainQuery queries MemoryLookupKey forced to namespace trusted-domains", async () => {
    const m = mockMethod("x:MemoryLookupKey/query", { ids: [], position: 0, queryState: "n" })
    mock = m.mock
    const r = await spamTrustedDomainQuery({ config: config.data, filter: { key: "x.test" }, limit: 5 })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]).toEqual([
      "x:MemoryLookupKey/query",
      { filter: { key: "x.test", namespace: "trusted-domains" }, limit: 5 },
      "c1",
    ])
  })

  test("spamUrlRedirectorQuery queries MemoryLookupKey forced to namespace url-redirectors", async () => {
    const m = mockMethod("x:MemoryLookupKey/query", { ids: [], position: 0, queryState: "n" })
    mock = m.mock
    const r = await spamUrlRedirectorQuery({ config: config.data, filter: { key: "x.test" }, limit: 5 })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]).toEqual([
      "x:MemoryLookupKey/query",
      { filter: { key: "x.test", namespace: "url-redirectors" }, limit: 5 },
      "c1",
    ])
  })
})

describe("reg-filtering spam training sample special mapping", () => {
  test("spamTrainingSampleQuery only sends the accountId filter", async () => {
    const m = mockMethod("x:SpamTrainingSample/query", { ids: [], position: 0, queryState: "n" })
    mock = m.mock
    const r = await spamTrainingSampleQuery({ config: config.data, filter: { accountId: "a1" }, limit: 10 })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]).toEqual([
      "x:SpamTrainingSample/query",
      { filter: { accountId: "a1" }, limit: 10 },
      "c1",
    ])
  })

  test("spamTrainingSampleQuery strips non-accountId filter keys client-side", async () => {
    const m = mockMethod("x:SpamTrainingSample/query", { ids: [], position: 0, queryState: "n" })
    mock = m.mock
    const r = await spamTrainingSampleQuery({
      config: config.data,
      filter: { accountId: "a1", isSpam: true } as never,
      limit: 10,
    })
    expect(r.success).toBe(true)
    // isSpam is dropped: the server answers unsupportedFilter for anything but accountId
    expect(m.sent[0]?.methodCalls[0]).toEqual([
      "x:SpamTrainingSample/query",
      { filter: { accountId: "a1" }, limit: 10 },
      "c1",
    ])
  })

  test("spamTrainingSampleSet surfaces an update rejection as a ResultErr", async () => {
    const m = mockMethod("x:SpamTrainingSample/set", {
      notUpdated: { s1: { type: "forbidden", description: "Spam training samples cannot be modified." } },
    })
    mock = m.mock
    const r = await spamTrainingSampleSet({ config: config.data, update: { s1: { isSpam: false } } })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.op).toBe("registrySet")
      expect(r.errorMessage).toContain("notUpdated")
    }
  })
})

describe("reg-filtering sieve create convenience", () => {
  test("sieveSystemScriptCreate sends a single-entry create", async () => {
    const m = mockMethod("x:SieveSystemScript/set", { created: { script: { id: "v9" } } })
    mock = m.mock
    const r = await sieveSystemScriptCreate({
      config: config.data,
      script: { name: "x", contents: 'require "fileinto";', isActive: false },
    })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.using).toEqual(USING)
    expect(m.sent[0]?.methodCalls[0]).toEqual([
      "x:SieveSystemScript/set",
      { create: { script: { name: "x", contents: 'require "fileinto";', isActive: false } } },
      "c1",
    ])
  })

  test("sieveSystemScriptCreate surfaces sieve compile errors as a ResultErr", async () => {
    const m = mockMethod("x:SieveSystemScript/set", {
      notCreated: {
        script: {
          type: "invalidProperties",
          description: "Failed to compile system Sieve script: boom",
          properties: ["contents"],
        },
      },
    })
    mock = m.mock
    const r = await sieveSystemScriptCreate({
      config: config.data,
      script: { name: "bad", contents: "bogus {{{", isActive: false },
    })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.op).toBe("registrySet")
      expect(r.errorMessage).toContain("notCreated")
      expect(r.errorData ?? "").toContain("invalidProperties")
    }
  })

  test("sieveSystemScriptCreate rejects empty contents without sending", async () => {
    const m = mockMethod("x:SieveSystemScript/set", { created: {} })
    mock = m.mock
    const r = await sieveSystemScriptCreate({
      config: config.data,
      script: { name: "x", contents: "", isActive: false },
    })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("sieveSystemScriptCreate")
    expect(m.sent).toHaveLength(0)
  })
})

describe("reg-filtering invalid options", () => {
  test("object get with an invalid config is a ResultErr with op", async () => {
    const r = await spamRuleGet({ config: { baseUrl: "" } })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("spamRuleGet")
  })

  test("sieve get with an invalid config is a ResultErr with op", async () => {
    const r = await sieveSystemScriptGet({ config: { baseUrl: "" } })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("sieveSystemScriptGet")
  })

  test("lookup get with an invalid config is a ResultErr with op", async () => {
    const r = await memoryLookupKeyGet({ config: { baseUrl: "" } })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("memoryLookupKeyGet")
  })

  test("report settings get with an invalid config is a ResultErr with op", async () => {
    const r = await senderAuthGet({ config: { baseUrl: "" } })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("senderAuthGet")
  })

  test("singleton set without update is a ResultErr without sending", async () => {
    const m = mockMethod("x:SpamSettings/set", { updated: {} })
    mock = m.mock
    const r = await spamSettingsSet({ config: config.data, update: undefined as never })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("spamSettingsSet")
    expect(m.sent).toHaveLength(0)
  })
})
