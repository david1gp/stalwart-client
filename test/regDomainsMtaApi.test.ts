import { afterEach, describe, expect, test } from "bun:test"
import { buildApplication, buildRouteMap } from "@stricli/core"
import { stalwartClientConfig } from "../src/client/stalwartClientConfig.js"
import { domainsCommands } from "../src/registry/domains/cli/domainsCommands.js"
import { mtaCommands } from "../src/registry/mta/cli/mtaCommands.js"
import { dkimSignatureAlgorithms } from "../src/registry/domains/dkimSignatureAlgorithms.js"
import { dkimSignatureCreate } from "../src/registry/domains/dkimSignatureCreate.js"
import { domainCreate } from "../src/registry/domains/domainCreate.js"
import { domainDestroy } from "../src/registry/domains/domainDestroy.js"
import { domainZoneFile } from "../src/registry/domains/domainZoneFile.js"
import { queuedMessageCancel } from "../src/registry/mta/queuedMessageCancel.js"
import { queuedMessageContents } from "../src/registry/mta/queuedMessageContents.js"
import { queuedMessageRetry } from "../src/registry/mta/queuedMessageRetry.js"
import { domainGet } from "../src/registry/domains/domainGet.js"
import { domainSet } from "../src/registry/domains/domainSet.js"
import { dkimSignatureGet } from "../src/registry/domains/dkimSignatureGet.js"
import { dkimSignatureSet } from "../src/registry/domains/dkimSignatureSet.js"
import { certificateGet } from "../src/registry/domains/certificateGet.js"
import { certificateSet } from "../src/registry/domains/certificateSet.js"
import { acmeProviderGet } from "../src/registry/domains/acmeProviderGet.js"
import { acmeProviderSet } from "../src/registry/domains/acmeProviderSet.js"
import { dnsServerGet } from "../src/registry/domains/dnsServerGet.js"
import { dnsServerSet } from "../src/registry/domains/dnsServerSet.js"
import { dnsResolverGet } from "../src/registry/domains/dnsResolverGet.js"
import { dnsResolverSet } from "../src/registry/domains/dnsResolverSet.js"
import { mtaConnectionStrategyGet } from "../src/registry/mta/mtaConnectionStrategyGet.js"
import { mtaConnectionStrategySet } from "../src/registry/mta/mtaConnectionStrategySet.js"
import { mtaDeliveryScheduleGet } from "../src/registry/mta/mtaDeliveryScheduleGet.js"
import { mtaDeliveryScheduleSet } from "../src/registry/mta/mtaDeliveryScheduleSet.js"
import { mtaHookGet } from "../src/registry/mta/mtaHookGet.js"
import { mtaHookSet } from "../src/registry/mta/mtaHookSet.js"
import { mtaInboundThrottleGet } from "../src/registry/mta/mtaInboundThrottleGet.js"
import { mtaInboundThrottleSet } from "../src/registry/mta/mtaInboundThrottleSet.js"
import { mtaMilterGet } from "../src/registry/mta/mtaMilterGet.js"
import { mtaMilterSet } from "../src/registry/mta/mtaMilterSet.js"
import { mtaOutboundThrottleGet } from "../src/registry/mta/mtaOutboundThrottleGet.js"
import { mtaOutboundThrottleSet } from "../src/registry/mta/mtaOutboundThrottleSet.js"
import { mtaQueueQuotaGet } from "../src/registry/mta/mtaQueueQuotaGet.js"
import { mtaQueueQuotaSet } from "../src/registry/mta/mtaQueueQuotaSet.js"
import { mtaRouteGet } from "../src/registry/mta/mtaRouteGet.js"
import { mtaRouteSet } from "../src/registry/mta/mtaRouteSet.js"
import { mtaTlsStrategyGet } from "../src/registry/mta/mtaTlsStrategyGet.js"
import { mtaTlsStrategySet } from "../src/registry/mta/mtaTlsStrategySet.js"
import { mtaVirtualQueueGet } from "../src/registry/mta/mtaVirtualQueueGet.js"
import { mtaVirtualQueueSet } from "../src/registry/mta/mtaVirtualQueueSet.js"
import { networkListenerGet } from "../src/registry/mta/networkListenerGet.js"
import { networkListenerSet } from "../src/registry/mta/networkListenerSet.js"
import { queuedMessageGet } from "../src/registry/mta/queuedMessageGet.js"
import { queuedMessageSet } from "../src/registry/mta/queuedMessageSet.js"
import { mtaExtensionsGet } from "../src/registry/mta/mtaExtensionsGet.js"
import { mtaExtensionsSet } from "../src/registry/mta/mtaExtensionsSet.js"
import { mtaInboundSessionGet } from "../src/registry/mta/mtaInboundSessionGet.js"
import { mtaInboundSessionSet } from "../src/registry/mta/mtaInboundSessionSet.js"
import { mtaOutboundStrategyGet } from "../src/registry/mta/mtaOutboundStrategyGet.js"
import { mtaOutboundStrategySet } from "../src/registry/mta/mtaOutboundStrategySet.js"
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
import { domainQuery } from "../src/registry/domains/domainQuery.js"
import { dkimSignatureQuery } from "../src/registry/domains/dkimSignatureQuery.js"
import { certificateQuery } from "../src/registry/domains/certificateQuery.js"
import { acmeProviderQuery } from "../src/registry/domains/acmeProviderQuery.js"
import { dnsServerQuery } from "../src/registry/domains/dnsServerQuery.js"
import { mtaConnectionStrategyQuery } from "../src/registry/mta/mtaConnectionStrategyQuery.js"
import { mtaDeliveryScheduleQuery } from "../src/registry/mta/mtaDeliveryScheduleQuery.js"
import { mtaHookQuery } from "../src/registry/mta/mtaHookQuery.js"
import { mtaInboundThrottleQuery } from "../src/registry/mta/mtaInboundThrottleQuery.js"
import { mtaMilterQuery } from "../src/registry/mta/mtaMilterQuery.js"
import { mtaOutboundThrottleQuery } from "../src/registry/mta/mtaOutboundThrottleQuery.js"
import { mtaQueueQuotaQuery } from "../src/registry/mta/mtaQueueQuotaQuery.js"
import { mtaRouteQuery } from "../src/registry/mta/mtaRouteQuery.js"
import { mtaTlsStrategyQuery } from "../src/registry/mta/mtaTlsStrategyQuery.js"
import { mtaVirtualQueueQuery } from "../src/registry/mta/mtaVirtualQueueQuery.js"
import { networkListenerQuery } from "../src/registry/mta/networkListenerQuery.js"
import { queuedMessageQuery } from "../src/registry/mta/queuedMessageQuery.js"
import { fetchMockCreate, fetchMockJson } from "./fetchMock.js"
import { jmapTestSessionCreate } from "./jmapTestSession.js"

const config = stalwartClientConfig({ baseUrl: "https://mail.example.com", username: "admin", password: "pw" })
if (!config.success) throw new Error("fixture config invalid")

type SentCall = { using: string[]; methodCalls: [string, Record<string, unknown>, string][] }

function mockFor(responses: Record<string, unknown>): {
  mock: ReturnType<typeof fetchMockCreate>
  sent: SentCall[]
} {
  const sent: SentCall[] = []
  const mock = fetchMockCreate((request) => {
    if (new URL(request.url).pathname === "/jmap/session") return fetchMockJson(jmapTestSessionCreate())
    sent.push(JSON.parse(String(request.body)) as SentCall)
    const name = (sent[sent.length - 1]?.methodCalls[0]?.[0] ?? "") as string
    return fetchMockJson({ methodResponses: [[name, responses[name] ?? {}, "c1"]], sessionState: "1" })
  })
  return { mock, sent }
}

function mockHandle(mock: ReturnType<typeof fetchMockCreate>): void {
  pending.push(mock)
}

let pending: ReturnType<typeof fetchMockCreate>[] = []
afterEach(() => {
  for (const m of pending) m.restore()
  pending = []
})

describe("reg-domains-mta wire shapes", () => {
  test("domainGet sends x:Domain/get with ids: null when no ids are given", async () => {
    const { mock, sent } = mockFor({
      "x:Domain/get": { accountId: "a1", state: "1", list: [{ id: "x1" }], notFound: [] },
    })
    mockHandle(mock)
    const r = await domainGet({ config: config.data })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.list[0]?.id).toBe("x1")
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual(["x:Domain/get", { ids: null }, "c1"])
  })

  test("domainQuery passes filter, sort and limit through", async () => {
    const { mock, sent } = mockFor({
      "x:Domain/query": { accountId: "a1", queryState: "n", canCalculateChanges: true, position: 0, ids: ["x1"] },
    })
    mockHandle(mock)
    const r = await domainQuery({
      config: config.data,
      filter: { name: "example.com" },
      sort: [{ property: "name" }],
      limit: 10,
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.ids).toEqual(["x1"])
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual([
      "x:Domain/query",
      { filter: { name: "example.com" }, sort: [{ property: "name" }], limit: 10 },
      "c1",
    ])
  })

  test("domainSet sends create/update/destroy through to x:Domain/set", async () => {
    const { mock, sent } = mockFor({
      "x:Domain/set": { accountId: "a1", created: { c1: { id: "y1" } }, updated: { y1: null }, destroyed: ["z1"] },
    })
    mockHandle(mock)
    const r = await domainSet({
      config: config.data,
      create: { c1: { name: "e2e.test" } },
      update: { y1: { description: "hi" } },
      destroy: ["z1"],
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.created?.c1?.id).toBe("y1")
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual([
      "x:Domain/set",
      { create: { c1: { name: "e2e.test" } }, update: { y1: { description: "hi" } }, destroy: ["z1"] },
      "c1",
    ])
  })

  test("dkimSignatureGet sends x:DkimSignature/get with ids: null when no ids are given", async () => {
    const { mock, sent } = mockFor({
      "x:DkimSignature/get": { accountId: "a1", state: "1", list: [{ id: "x1" }], notFound: [] },
    })
    mockHandle(mock)
    const r = await dkimSignatureGet({ config: config.data })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.list[0]?.id).toBe("x1")
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual(["x:DkimSignature/get", { ids: null }, "c1"])
  })

  test("dkimSignatureQuery passes filter, sort and limit through", async () => {
    const { mock, sent } = mockFor({
      "x:DkimSignature/query": {
        accountId: "a1",
        queryState: "n",
        canCalculateChanges: true,
        position: 0,
        ids: ["x1"],
      },
    })
    mockHandle(mock)
    const r = await dkimSignatureQuery({
      config: config.data,
      filter: { name: "example.com" },
      sort: [{ property: "name" }],
      limit: 10,
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.ids).toEqual(["x1"])
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual([
      "x:DkimSignature/query",
      { filter: { name: "example.com" }, sort: [{ property: "name" }], limit: 10 },
      "c1",
    ])
  })

  test("dkimSignatureSet sends create/update/destroy through to x:DkimSignature/set", async () => {
    const { mock, sent } = mockFor({
      "x:DkimSignature/set": {
        accountId: "a1",
        created: { c1: { id: "y1" } },
        updated: { y1: null },
        destroyed: ["z1"],
      },
    })
    mockHandle(mock)
    const r = await dkimSignatureSet({
      config: config.data,
      create: { c1: { name: "e2e.test" } },
      update: { y1: { description: "hi" } },
      destroy: ["z1"],
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.created?.c1?.id).toBe("y1")
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual([
      "x:DkimSignature/set",
      { create: { c1: { name: "e2e.test" } }, update: { y1: { description: "hi" } }, destroy: ["z1"] },
      "c1",
    ])
  })

  test("certificateGet sends x:Certificate/get with ids: null when no ids are given", async () => {
    const { mock, sent } = mockFor({
      "x:Certificate/get": { accountId: "a1", state: "1", list: [{ id: "x1" }], notFound: [] },
    })
    mockHandle(mock)
    const r = await certificateGet({ config: config.data })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.list[0]?.id).toBe("x1")
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual(["x:Certificate/get", { ids: null }, "c1"])
  })

  test("certificateQuery passes filter, sort and limit through", async () => {
    const { mock, sent } = mockFor({
      "x:Certificate/query": { accountId: "a1", queryState: "n", canCalculateChanges: true, position: 0, ids: ["x1"] },
    })
    mockHandle(mock)
    const r = await certificateQuery({
      config: config.data,
      filter: { name: "example.com" },
      sort: [{ property: "name" }],
      limit: 10,
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.ids).toEqual(["x1"])
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual([
      "x:Certificate/query",
      { filter: { name: "example.com" }, sort: [{ property: "name" }], limit: 10 },
      "c1",
    ])
  })

  test("certificateSet sends create/update/destroy through to x:Certificate/set", async () => {
    const { mock, sent } = mockFor({
      "x:Certificate/set": { accountId: "a1", created: { c1: { id: "y1" } }, updated: { y1: null }, destroyed: ["z1"] },
    })
    mockHandle(mock)
    const r = await certificateSet({
      config: config.data,
      create: { c1: { name: "e2e.test" } },
      update: { y1: { description: "hi" } },
      destroy: ["z1"],
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.created?.c1?.id).toBe("y1")
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual([
      "x:Certificate/set",
      { create: { c1: { name: "e2e.test" } }, update: { y1: { description: "hi" } }, destroy: ["z1"] },
      "c1",
    ])
  })

  test("acmeProviderGet sends x:AcmeProvider/get with ids: null when no ids are given", async () => {
    const { mock, sent } = mockFor({
      "x:AcmeProvider/get": { accountId: "a1", state: "1", list: [{ id: "x1" }], notFound: [] },
    })
    mockHandle(mock)
    const r = await acmeProviderGet({ config: config.data })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.list[0]?.id).toBe("x1")
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual(["x:AcmeProvider/get", { ids: null }, "c1"])
  })

  test("acmeProviderQuery passes filter, sort and limit through", async () => {
    const { mock, sent } = mockFor({
      "x:AcmeProvider/query": { accountId: "a1", queryState: "n", canCalculateChanges: true, position: 0, ids: ["x1"] },
    })
    mockHandle(mock)
    const r = await acmeProviderQuery({
      config: config.data,
      filter: { name: "example.com" },
      sort: [{ property: "name" }],
      limit: 10,
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.ids).toEqual(["x1"])
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual([
      "x:AcmeProvider/query",
      { filter: { name: "example.com" }, sort: [{ property: "name" }], limit: 10 },
      "c1",
    ])
  })

  test("acmeProviderSet sends create/update/destroy through to x:AcmeProvider/set", async () => {
    const { mock, sent } = mockFor({
      "x:AcmeProvider/set": {
        accountId: "a1",
        created: { c1: { id: "y1" } },
        updated: { y1: null },
        destroyed: ["z1"],
      },
    })
    mockHandle(mock)
    const r = await acmeProviderSet({
      config: config.data,
      create: { c1: { name: "e2e.test" } },
      update: { y1: { description: "hi" } },
      destroy: ["z1"],
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.created?.c1?.id).toBe("y1")
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual([
      "x:AcmeProvider/set",
      { create: { c1: { name: "e2e.test" } }, update: { y1: { description: "hi" } }, destroy: ["z1"] },
      "c1",
    ])
  })

  test("dnsServerGet sends x:DnsServer/get with ids: null when no ids are given", async () => {
    const { mock, sent } = mockFor({
      "x:DnsServer/get": { accountId: "a1", state: "1", list: [{ id: "x1" }], notFound: [] },
    })
    mockHandle(mock)
    const r = await dnsServerGet({ config: config.data })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.list[0]?.id).toBe("x1")
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual(["x:DnsServer/get", { ids: null }, "c1"])
  })

  test("dnsServerQuery passes filter, sort and limit through", async () => {
    const { mock, sent } = mockFor({
      "x:DnsServer/query": { accountId: "a1", queryState: "n", canCalculateChanges: true, position: 0, ids: ["x1"] },
    })
    mockHandle(mock)
    const r = await dnsServerQuery({
      config: config.data,
      filter: { name: "example.com" },
      sort: [{ property: "name" }],
      limit: 10,
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.ids).toEqual(["x1"])
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual([
      "x:DnsServer/query",
      { filter: { name: "example.com" }, sort: [{ property: "name" }], limit: 10 },
      "c1",
    ])
  })

  test("dnsServerSet sends create/update/destroy through to x:DnsServer/set", async () => {
    const { mock, sent } = mockFor({
      "x:DnsServer/set": { accountId: "a1", created: { c1: { id: "y1" } }, updated: { y1: null }, destroyed: ["z1"] },
    })
    mockHandle(mock)
    const r = await dnsServerSet({
      config: config.data,
      create: { c1: { name: "e2e.test" } },
      update: { y1: { description: "hi" } },
      destroy: ["z1"],
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.created?.c1?.id).toBe("y1")
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual([
      "x:DnsServer/set",
      { create: { c1: { name: "e2e.test" } }, update: { y1: { description: "hi" } }, destroy: ["z1"] },
      "c1",
    ])
  })

  test('dnsResolverGet fills in ids: ["singleton"] for the DnsResolver singleton', async () => {
    const { mock, sent } = mockFor({
      "x:DnsResolver/get": { accountId: "a1", list: [{ id: "singleton" }], notFound: [] },
    })
    mockHandle(mock)
    const r = await dnsResolverGet({ config: config.data })
    expect(r.success).toBe(true)
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual(["x:DnsResolver/get", { ids: ["singleton"] }, "c1"])
  })

  test("dnsResolverSet updates the DnsResolver singleton", async () => {
    const { mock, sent } = mockFor({ "x:DnsResolver/set": { accountId: "a1", updated: { singleton: null } } })
    mockHandle(mock)
    const r = await dnsResolverSet({ config: config.data, update: { singleton: { description: "hi" } } })
    expect(r.success).toBe(true)
    expect(sent[0]?.methodCalls[0]).toEqual([
      "x:DnsResolver/set",
      { update: { singleton: { description: "hi" } } },
      "c1",
    ])
  })

  test("mtaConnectionStrategyGet sends x:MtaConnectionStrategy/get with ids: null when no ids are given", async () => {
    const { mock, sent } = mockFor({
      "x:MtaConnectionStrategy/get": { accountId: "a1", state: "1", list: [{ id: "x1" }], notFound: [] },
    })
    mockHandle(mock)
    const r = await mtaConnectionStrategyGet({ config: config.data })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.list[0]?.id).toBe("x1")
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual(["x:MtaConnectionStrategy/get", { ids: null }, "c1"])
  })

  test("mtaConnectionStrategyQuery passes filter, sort and limit through", async () => {
    const { mock, sent } = mockFor({
      "x:MtaConnectionStrategy/query": {
        accountId: "a1",
        queryState: "n",
        canCalculateChanges: true,
        position: 0,
        ids: ["x1"],
      },
    })
    mockHandle(mock)
    const r = await mtaConnectionStrategyQuery({
      config: config.data,
      filter: { name: "example.com" },
      sort: [{ property: "name" }],
      limit: 10,
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.ids).toEqual(["x1"])
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual([
      "x:MtaConnectionStrategy/query",
      { filter: { name: "example.com" }, sort: [{ property: "name" }], limit: 10 },
      "c1",
    ])
  })

  test("mtaConnectionStrategySet sends create/update/destroy through to x:MtaConnectionStrategy/set", async () => {
    const { mock, sent } = mockFor({
      "x:MtaConnectionStrategy/set": {
        accountId: "a1",
        created: { c1: { id: "y1" } },
        updated: { y1: null },
        destroyed: ["z1"],
      },
    })
    mockHandle(mock)
    const r = await mtaConnectionStrategySet({
      config: config.data,
      create: { c1: { name: "e2e.test" } },
      update: { y1: { description: "hi" } },
      destroy: ["z1"],
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.created?.c1?.id).toBe("y1")
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual([
      "x:MtaConnectionStrategy/set",
      { create: { c1: { name: "e2e.test" } }, update: { y1: { description: "hi" } }, destroy: ["z1"] },
      "c1",
    ])
  })

  test("mtaDeliveryScheduleGet sends x:MtaDeliverySchedule/get with ids: null when no ids are given", async () => {
    const { mock, sent } = mockFor({
      "x:MtaDeliverySchedule/get": { accountId: "a1", state: "1", list: [{ id: "x1" }], notFound: [] },
    })
    mockHandle(mock)
    const r = await mtaDeliveryScheduleGet({ config: config.data })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.list[0]?.id).toBe("x1")
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual(["x:MtaDeliverySchedule/get", { ids: null }, "c1"])
  })

  test("mtaDeliveryScheduleQuery passes filter, sort and limit through", async () => {
    const { mock, sent } = mockFor({
      "x:MtaDeliverySchedule/query": {
        accountId: "a1",
        queryState: "n",
        canCalculateChanges: true,
        position: 0,
        ids: ["x1"],
      },
    })
    mockHandle(mock)
    const r = await mtaDeliveryScheduleQuery({
      config: config.data,
      filter: { name: "example.com" },
      sort: [{ property: "name" }],
      limit: 10,
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.ids).toEqual(["x1"])
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual([
      "x:MtaDeliverySchedule/query",
      { filter: { name: "example.com" }, sort: [{ property: "name" }], limit: 10 },
      "c1",
    ])
  })

  test("mtaDeliveryScheduleSet sends create/update/destroy through to x:MtaDeliverySchedule/set", async () => {
    const { mock, sent } = mockFor({
      "x:MtaDeliverySchedule/set": {
        accountId: "a1",
        created: { c1: { id: "y1" } },
        updated: { y1: null },
        destroyed: ["z1"],
      },
    })
    mockHandle(mock)
    const r = await mtaDeliveryScheduleSet({
      config: config.data,
      create: { c1: { name: "e2e.test" } },
      update: { y1: { description: "hi" } },
      destroy: ["z1"],
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.created?.c1?.id).toBe("y1")
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual([
      "x:MtaDeliverySchedule/set",
      { create: { c1: { name: "e2e.test" } }, update: { y1: { description: "hi" } }, destroy: ["z1"] },
      "c1",
    ])
  })

  test("mtaHookGet sends x:MtaHook/get with ids: null when no ids are given", async () => {
    const { mock, sent } = mockFor({
      "x:MtaHook/get": { accountId: "a1", state: "1", list: [{ id: "x1" }], notFound: [] },
    })
    mockHandle(mock)
    const r = await mtaHookGet({ config: config.data })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.list[0]?.id).toBe("x1")
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual(["x:MtaHook/get", { ids: null }, "c1"])
  })

  test("mtaHookQuery passes filter, sort and limit through", async () => {
    const { mock, sent } = mockFor({
      "x:MtaHook/query": { accountId: "a1", queryState: "n", canCalculateChanges: true, position: 0, ids: ["x1"] },
    })
    mockHandle(mock)
    const r = await mtaHookQuery({
      config: config.data,
      filter: { name: "example.com" },
      sort: [{ property: "name" }],
      limit: 10,
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.ids).toEqual(["x1"])
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual([
      "x:MtaHook/query",
      { filter: { name: "example.com" }, sort: [{ property: "name" }], limit: 10 },
      "c1",
    ])
  })

  test("mtaHookSet sends create/update/destroy through to x:MtaHook/set", async () => {
    const { mock, sent } = mockFor({
      "x:MtaHook/set": { accountId: "a1", created: { c1: { id: "y1" } }, updated: { y1: null }, destroyed: ["z1"] },
    })
    mockHandle(mock)
    const r = await mtaHookSet({
      config: config.data,
      create: { c1: { name: "e2e.test" } },
      update: { y1: { description: "hi" } },
      destroy: ["z1"],
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.created?.c1?.id).toBe("y1")
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual([
      "x:MtaHook/set",
      { create: { c1: { name: "e2e.test" } }, update: { y1: { description: "hi" } }, destroy: ["z1"] },
      "c1",
    ])
  })

  test("mtaInboundThrottleGet sends x:MtaInboundThrottle/get with ids: null when no ids are given", async () => {
    const { mock, sent } = mockFor({
      "x:MtaInboundThrottle/get": { accountId: "a1", state: "1", list: [{ id: "x1" }], notFound: [] },
    })
    mockHandle(mock)
    const r = await mtaInboundThrottleGet({ config: config.data })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.list[0]?.id).toBe("x1")
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual(["x:MtaInboundThrottle/get", { ids: null }, "c1"])
  })

  test("mtaInboundThrottleQuery passes filter, sort and limit through", async () => {
    const { mock, sent } = mockFor({
      "x:MtaInboundThrottle/query": {
        accountId: "a1",
        queryState: "n",
        canCalculateChanges: true,
        position: 0,
        ids: ["x1"],
      },
    })
    mockHandle(mock)
    const r = await mtaInboundThrottleQuery({
      config: config.data,
      filter: { name: "example.com" },
      sort: [{ property: "name" }],
      limit: 10,
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.ids).toEqual(["x1"])
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual([
      "x:MtaInboundThrottle/query",
      { filter: { name: "example.com" }, sort: [{ property: "name" }], limit: 10 },
      "c1",
    ])
  })

  test("mtaInboundThrottleSet sends create/update/destroy through to x:MtaInboundThrottle/set", async () => {
    const { mock, sent } = mockFor({
      "x:MtaInboundThrottle/set": {
        accountId: "a1",
        created: { c1: { id: "y1" } },
        updated: { y1: null },
        destroyed: ["z1"],
      },
    })
    mockHandle(mock)
    const r = await mtaInboundThrottleSet({
      config: config.data,
      create: { c1: { name: "e2e.test" } },
      update: { y1: { description: "hi" } },
      destroy: ["z1"],
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.created?.c1?.id).toBe("y1")
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual([
      "x:MtaInboundThrottle/set",
      { create: { c1: { name: "e2e.test" } }, update: { y1: { description: "hi" } }, destroy: ["z1"] },
      "c1",
    ])
  })

  test("mtaMilterGet sends x:MtaMilter/get with ids: null when no ids are given", async () => {
    const { mock, sent } = mockFor({
      "x:MtaMilter/get": { accountId: "a1", state: "1", list: [{ id: "x1" }], notFound: [] },
    })
    mockHandle(mock)
    const r = await mtaMilterGet({ config: config.data })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.list[0]?.id).toBe("x1")
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual(["x:MtaMilter/get", { ids: null }, "c1"])
  })

  test("mtaMilterQuery passes filter, sort and limit through", async () => {
    const { mock, sent } = mockFor({
      "x:MtaMilter/query": { accountId: "a1", queryState: "n", canCalculateChanges: true, position: 0, ids: ["x1"] },
    })
    mockHandle(mock)
    const r = await mtaMilterQuery({
      config: config.data,
      filter: { name: "example.com" },
      sort: [{ property: "name" }],
      limit: 10,
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.ids).toEqual(["x1"])
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual([
      "x:MtaMilter/query",
      { filter: { name: "example.com" }, sort: [{ property: "name" }], limit: 10 },
      "c1",
    ])
  })

  test("mtaMilterSet sends create/update/destroy through to x:MtaMilter/set", async () => {
    const { mock, sent } = mockFor({
      "x:MtaMilter/set": { accountId: "a1", created: { c1: { id: "y1" } }, updated: { y1: null }, destroyed: ["z1"] },
    })
    mockHandle(mock)
    const r = await mtaMilterSet({
      config: config.data,
      create: { c1: { name: "e2e.test" } },
      update: { y1: { description: "hi" } },
      destroy: ["z1"],
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.created?.c1?.id).toBe("y1")
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual([
      "x:MtaMilter/set",
      { create: { c1: { name: "e2e.test" } }, update: { y1: { description: "hi" } }, destroy: ["z1"] },
      "c1",
    ])
  })

  test("mtaOutboundThrottleGet sends x:MtaOutboundThrottle/get with ids: null when no ids are given", async () => {
    const { mock, sent } = mockFor({
      "x:MtaOutboundThrottle/get": { accountId: "a1", state: "1", list: [{ id: "x1" }], notFound: [] },
    })
    mockHandle(mock)
    const r = await mtaOutboundThrottleGet({ config: config.data })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.list[0]?.id).toBe("x1")
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual(["x:MtaOutboundThrottle/get", { ids: null }, "c1"])
  })

  test("mtaOutboundThrottleQuery passes filter, sort and limit through", async () => {
    const { mock, sent } = mockFor({
      "x:MtaOutboundThrottle/query": {
        accountId: "a1",
        queryState: "n",
        canCalculateChanges: true,
        position: 0,
        ids: ["x1"],
      },
    })
    mockHandle(mock)
    const r = await mtaOutboundThrottleQuery({
      config: config.data,
      filter: { name: "example.com" },
      sort: [{ property: "name" }],
      limit: 10,
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.ids).toEqual(["x1"])
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual([
      "x:MtaOutboundThrottle/query",
      { filter: { name: "example.com" }, sort: [{ property: "name" }], limit: 10 },
      "c1",
    ])
  })

  test("mtaOutboundThrottleSet sends create/update/destroy through to x:MtaOutboundThrottle/set", async () => {
    const { mock, sent } = mockFor({
      "x:MtaOutboundThrottle/set": {
        accountId: "a1",
        created: { c1: { id: "y1" } },
        updated: { y1: null },
        destroyed: ["z1"],
      },
    })
    mockHandle(mock)
    const r = await mtaOutboundThrottleSet({
      config: config.data,
      create: { c1: { name: "e2e.test" } },
      update: { y1: { description: "hi" } },
      destroy: ["z1"],
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.created?.c1?.id).toBe("y1")
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual([
      "x:MtaOutboundThrottle/set",
      { create: { c1: { name: "e2e.test" } }, update: { y1: { description: "hi" } }, destroy: ["z1"] },
      "c1",
    ])
  })

  test("mtaQueueQuotaGet sends x:MtaQueueQuota/get with ids: null when no ids are given", async () => {
    const { mock, sent } = mockFor({
      "x:MtaQueueQuota/get": { accountId: "a1", state: "1", list: [{ id: "x1" }], notFound: [] },
    })
    mockHandle(mock)
    const r = await mtaQueueQuotaGet({ config: config.data })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.list[0]?.id).toBe("x1")
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual(["x:MtaQueueQuota/get", { ids: null }, "c1"])
  })

  test("mtaQueueQuotaQuery passes filter, sort and limit through", async () => {
    const { mock, sent } = mockFor({
      "x:MtaQueueQuota/query": {
        accountId: "a1",
        queryState: "n",
        canCalculateChanges: true,
        position: 0,
        ids: ["x1"],
      },
    })
    mockHandle(mock)
    const r = await mtaQueueQuotaQuery({
      config: config.data,
      filter: { name: "example.com" },
      sort: [{ property: "name" }],
      limit: 10,
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.ids).toEqual(["x1"])
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual([
      "x:MtaQueueQuota/query",
      { filter: { name: "example.com" }, sort: [{ property: "name" }], limit: 10 },
      "c1",
    ])
  })

  test("mtaQueueQuotaSet sends create/update/destroy through to x:MtaQueueQuota/set", async () => {
    const { mock, sent } = mockFor({
      "x:MtaQueueQuota/set": {
        accountId: "a1",
        created: { c1: { id: "y1" } },
        updated: { y1: null },
        destroyed: ["z1"],
      },
    })
    mockHandle(mock)
    const r = await mtaQueueQuotaSet({
      config: config.data,
      create: { c1: { name: "e2e.test" } },
      update: { y1: { description: "hi" } },
      destroy: ["z1"],
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.created?.c1?.id).toBe("y1")
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual([
      "x:MtaQueueQuota/set",
      { create: { c1: { name: "e2e.test" } }, update: { y1: { description: "hi" } }, destroy: ["z1"] },
      "c1",
    ])
  })

  test("mtaRouteGet sends x:MtaRoute/get with ids: null when no ids are given", async () => {
    const { mock, sent } = mockFor({
      "x:MtaRoute/get": { accountId: "a1", state: "1", list: [{ id: "x1" }], notFound: [] },
    })
    mockHandle(mock)
    const r = await mtaRouteGet({ config: config.data })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.list[0]?.id).toBe("x1")
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual(["x:MtaRoute/get", { ids: null }, "c1"])
  })

  test("mtaRouteQuery passes filter, sort and limit through", async () => {
    const { mock, sent } = mockFor({
      "x:MtaRoute/query": { accountId: "a1", queryState: "n", canCalculateChanges: true, position: 0, ids: ["x1"] },
    })
    mockHandle(mock)
    const r = await mtaRouteQuery({
      config: config.data,
      filter: { name: "example.com" },
      sort: [{ property: "name" }],
      limit: 10,
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.ids).toEqual(["x1"])
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual([
      "x:MtaRoute/query",
      { filter: { name: "example.com" }, sort: [{ property: "name" }], limit: 10 },
      "c1",
    ])
  })

  test("mtaRouteSet sends create/update/destroy through to x:MtaRoute/set", async () => {
    const { mock, sent } = mockFor({
      "x:MtaRoute/set": { accountId: "a1", created: { c1: { id: "y1" } }, updated: { y1: null }, destroyed: ["z1"] },
    })
    mockHandle(mock)
    const r = await mtaRouteSet({
      config: config.data,
      create: { c1: { name: "e2e.test" } },
      update: { y1: { description: "hi" } },
      destroy: ["z1"],
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.created?.c1?.id).toBe("y1")
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual([
      "x:MtaRoute/set",
      { create: { c1: { name: "e2e.test" } }, update: { y1: { description: "hi" } }, destroy: ["z1"] },
      "c1",
    ])
  })

  test("mtaTlsStrategyGet sends x:MtaTlsStrategy/get with ids: null when no ids are given", async () => {
    const { mock, sent } = mockFor({
      "x:MtaTlsStrategy/get": { accountId: "a1", state: "1", list: [{ id: "x1" }], notFound: [] },
    })
    mockHandle(mock)
    const r = await mtaTlsStrategyGet({ config: config.data })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.list[0]?.id).toBe("x1")
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual(["x:MtaTlsStrategy/get", { ids: null }, "c1"])
  })

  test("mtaTlsStrategyQuery passes filter, sort and limit through", async () => {
    const { mock, sent } = mockFor({
      "x:MtaTlsStrategy/query": {
        accountId: "a1",
        queryState: "n",
        canCalculateChanges: true,
        position: 0,
        ids: ["x1"],
      },
    })
    mockHandle(mock)
    const r = await mtaTlsStrategyQuery({
      config: config.data,
      filter: { name: "example.com" },
      sort: [{ property: "name" }],
      limit: 10,
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.ids).toEqual(["x1"])
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual([
      "x:MtaTlsStrategy/query",
      { filter: { name: "example.com" }, sort: [{ property: "name" }], limit: 10 },
      "c1",
    ])
  })

  test("mtaTlsStrategySet sends create/update/destroy through to x:MtaTlsStrategy/set", async () => {
    const { mock, sent } = mockFor({
      "x:MtaTlsStrategy/set": {
        accountId: "a1",
        created: { c1: { id: "y1" } },
        updated: { y1: null },
        destroyed: ["z1"],
      },
    })
    mockHandle(mock)
    const r = await mtaTlsStrategySet({
      config: config.data,
      create: { c1: { name: "e2e.test" } },
      update: { y1: { description: "hi" } },
      destroy: ["z1"],
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.created?.c1?.id).toBe("y1")
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual([
      "x:MtaTlsStrategy/set",
      { create: { c1: { name: "e2e.test" } }, update: { y1: { description: "hi" } }, destroy: ["z1"] },
      "c1",
    ])
  })

  test("mtaVirtualQueueGet sends x:MtaVirtualQueue/get with ids: null when no ids are given", async () => {
    const { mock, sent } = mockFor({
      "x:MtaVirtualQueue/get": { accountId: "a1", state: "1", list: [{ id: "x1" }], notFound: [] },
    })
    mockHandle(mock)
    const r = await mtaVirtualQueueGet({ config: config.data })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.list[0]?.id).toBe("x1")
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual(["x:MtaVirtualQueue/get", { ids: null }, "c1"])
  })

  test("mtaVirtualQueueQuery passes filter, sort and limit through", async () => {
    const { mock, sent } = mockFor({
      "x:MtaVirtualQueue/query": {
        accountId: "a1",
        queryState: "n",
        canCalculateChanges: true,
        position: 0,
        ids: ["x1"],
      },
    })
    mockHandle(mock)
    const r = await mtaVirtualQueueQuery({
      config: config.data,
      filter: { name: "example.com" },
      sort: [{ property: "name" }],
      limit: 10,
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.ids).toEqual(["x1"])
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual([
      "x:MtaVirtualQueue/query",
      { filter: { name: "example.com" }, sort: [{ property: "name" }], limit: 10 },
      "c1",
    ])
  })

  test("mtaVirtualQueueSet sends create/update/destroy through to x:MtaVirtualQueue/set", async () => {
    const { mock, sent } = mockFor({
      "x:MtaVirtualQueue/set": {
        accountId: "a1",
        created: { c1: { id: "y1" } },
        updated: { y1: null },
        destroyed: ["z1"],
      },
    })
    mockHandle(mock)
    const r = await mtaVirtualQueueSet({
      config: config.data,
      create: { c1: { name: "e2e.test" } },
      update: { y1: { description: "hi" } },
      destroy: ["z1"],
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.created?.c1?.id).toBe("y1")
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual([
      "x:MtaVirtualQueue/set",
      { create: { c1: { name: "e2e.test" } }, update: { y1: { description: "hi" } }, destroy: ["z1"] },
      "c1",
    ])
  })

  test("networkListenerGet sends x:NetworkListener/get with ids: null when no ids are given", async () => {
    const { mock, sent } = mockFor({
      "x:NetworkListener/get": { accountId: "a1", state: "1", list: [{ id: "x1" }], notFound: [] },
    })
    mockHandle(mock)
    const r = await networkListenerGet({ config: config.data })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.list[0]?.id).toBe("x1")
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual(["x:NetworkListener/get", { ids: null }, "c1"])
  })

  test("networkListenerQuery passes filter, sort and limit through", async () => {
    const { mock, sent } = mockFor({
      "x:NetworkListener/query": {
        accountId: "a1",
        queryState: "n",
        canCalculateChanges: true,
        position: 0,
        ids: ["x1"],
      },
    })
    mockHandle(mock)
    const r = await networkListenerQuery({
      config: config.data,
      filter: { name: "example.com" },
      sort: [{ property: "name" }],
      limit: 10,
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.ids).toEqual(["x1"])
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual([
      "x:NetworkListener/query",
      { filter: { name: "example.com" }, sort: [{ property: "name" }], limit: 10 },
      "c1",
    ])
  })

  test("networkListenerSet sends create/update/destroy through to x:NetworkListener/set", async () => {
    const { mock, sent } = mockFor({
      "x:NetworkListener/set": {
        accountId: "a1",
        created: { c1: { id: "y1" } },
        updated: { y1: null },
        destroyed: ["z1"],
      },
    })
    mockHandle(mock)
    const r = await networkListenerSet({
      config: config.data,
      create: { c1: { name: "e2e.test" } },
      update: { y1: { description: "hi" } },
      destroy: ["z1"],
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.created?.c1?.id).toBe("y1")
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual([
      "x:NetworkListener/set",
      { create: { c1: { name: "e2e.test" } }, update: { y1: { description: "hi" } }, destroy: ["z1"] },
      "c1",
    ])
  })

  test("queuedMessageGet sends x:QueuedMessage/get with ids: null when no ids are given", async () => {
    const { mock, sent } = mockFor({
      "x:QueuedMessage/get": { accountId: "a1", state: "1", list: [{ id: "x1" }], notFound: [] },
    })
    mockHandle(mock)
    const r = await queuedMessageGet({ config: config.data })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.list[0]?.id).toBe("x1")
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual(["x:QueuedMessage/get", { ids: null }, "c1"])
  })

  test("queuedMessageQuery passes filter, sort and limit through", async () => {
    const { mock, sent } = mockFor({
      "x:QueuedMessage/query": {
        accountId: "a1",
        queryState: "n",
        canCalculateChanges: true,
        position: 0,
        ids: ["x1"],
      },
    })
    mockHandle(mock)
    const r = await queuedMessageQuery({
      config: config.data,
      filter: { name: "example.com" },
      sort: [{ property: "name" }],
      limit: 10,
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.ids).toEqual(["x1"])
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual([
      "x:QueuedMessage/query",
      { filter: { name: "example.com" }, sort: [{ property: "name" }], limit: 10 },
      "c1",
    ])
  })

  test("queuedMessageSet sends create/update/destroy through to x:QueuedMessage/set", async () => {
    const { mock, sent } = mockFor({
      "x:QueuedMessage/set": {
        accountId: "a1",
        created: { c1: { id: "y1" } },
        updated: { y1: null },
        destroyed: ["z1"],
      },
    })
    mockHandle(mock)
    const r = await queuedMessageSet({
      config: config.data,
      create: { c1: { name: "e2e.test" } },
      update: { y1: { description: "hi" } },
      destroy: ["z1"],
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.created?.c1?.id).toBe("y1")
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual([
      "x:QueuedMessage/set",
      { create: { c1: { name: "e2e.test" } }, update: { y1: { description: "hi" } }, destroy: ["z1"] },
      "c1",
    ])
  })

  test('mtaExtensionsGet fills in ids: ["singleton"] for the MtaExtensions singleton', async () => {
    const { mock, sent } = mockFor({
      "x:MtaExtensions/get": { accountId: "a1", list: [{ id: "singleton" }], notFound: [] },
    })
    mockHandle(mock)
    const r = await mtaExtensionsGet({ config: config.data })
    expect(r.success).toBe(true)
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual(["x:MtaExtensions/get", { ids: ["singleton"] }, "c1"])
  })

  test("mtaExtensionsSet updates the MtaExtensions singleton", async () => {
    const { mock, sent } = mockFor({ "x:MtaExtensions/set": { accountId: "a1", updated: { singleton: null } } })
    mockHandle(mock)
    const r = await mtaExtensionsSet({ config: config.data, update: { singleton: { description: "hi" } } })
    expect(r.success).toBe(true)
    expect(sent[0]?.methodCalls[0]).toEqual([
      "x:MtaExtensions/set",
      { update: { singleton: { description: "hi" } } },
      "c1",
    ])
  })

  test('mtaInboundSessionGet fills in ids: ["singleton"] for the MtaInboundSession singleton', async () => {
    const { mock, sent } = mockFor({
      "x:MtaInboundSession/get": { accountId: "a1", list: [{ id: "singleton" }], notFound: [] },
    })
    mockHandle(mock)
    const r = await mtaInboundSessionGet({ config: config.data })
    expect(r.success).toBe(true)
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual(["x:MtaInboundSession/get", { ids: ["singleton"] }, "c1"])
  })

  test("mtaInboundSessionSet updates the MtaInboundSession singleton", async () => {
    const { mock, sent } = mockFor({ "x:MtaInboundSession/set": { accountId: "a1", updated: { singleton: null } } })
    mockHandle(mock)
    const r = await mtaInboundSessionSet({ config: config.data, update: { singleton: { description: "hi" } } })
    expect(r.success).toBe(true)
    expect(sent[0]?.methodCalls[0]).toEqual([
      "x:MtaInboundSession/set",
      { update: { singleton: { description: "hi" } } },
      "c1",
    ])
  })

  test('mtaOutboundStrategyGet fills in ids: ["singleton"] for the MtaOutboundStrategy singleton', async () => {
    const { mock, sent } = mockFor({
      "x:MtaOutboundStrategy/get": { accountId: "a1", list: [{ id: "singleton" }], notFound: [] },
    })
    mockHandle(mock)
    const r = await mtaOutboundStrategyGet({ config: config.data })
    expect(r.success).toBe(true)
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual(["x:MtaOutboundStrategy/get", { ids: ["singleton"] }, "c1"])
  })

  test("mtaOutboundStrategySet updates the MtaOutboundStrategy singleton", async () => {
    const { mock, sent } = mockFor({ "x:MtaOutboundStrategy/set": { accountId: "a1", updated: { singleton: null } } })
    mockHandle(mock)
    const r = await mtaOutboundStrategySet({ config: config.data, update: { singleton: { description: "hi" } } })
    expect(r.success).toBe(true)
    expect(sent[0]?.methodCalls[0]).toEqual([
      "x:MtaOutboundStrategy/set",
      { update: { singleton: { description: "hi" } } },
      "c1",
    ])
  })

  test('mtaStageAuthGet fills in ids: ["singleton"] for the MtaStageAuth singleton', async () => {
    const { mock, sent } = mockFor({
      "x:MtaStageAuth/get": { accountId: "a1", list: [{ id: "singleton" }], notFound: [] },
    })
    mockHandle(mock)
    const r = await mtaStageAuthGet({ config: config.data })
    expect(r.success).toBe(true)
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual(["x:MtaStageAuth/get", { ids: ["singleton"] }, "c1"])
  })

  test("mtaStageAuthSet updates the MtaStageAuth singleton", async () => {
    const { mock, sent } = mockFor({ "x:MtaStageAuth/set": { accountId: "a1", updated: { singleton: null } } })
    mockHandle(mock)
    const r = await mtaStageAuthSet({ config: config.data, update: { singleton: { description: "hi" } } })
    expect(r.success).toBe(true)
    expect(sent[0]?.methodCalls[0]).toEqual([
      "x:MtaStageAuth/set",
      { update: { singleton: { description: "hi" } } },
      "c1",
    ])
  })

  test('mtaStageConnectGet fills in ids: ["singleton"] for the MtaStageConnect singleton', async () => {
    const { mock, sent } = mockFor({
      "x:MtaStageConnect/get": { accountId: "a1", list: [{ id: "singleton" }], notFound: [] },
    })
    mockHandle(mock)
    const r = await mtaStageConnectGet({ config: config.data })
    expect(r.success).toBe(true)
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual(["x:MtaStageConnect/get", { ids: ["singleton"] }, "c1"])
  })

  test("mtaStageConnectSet updates the MtaStageConnect singleton", async () => {
    const { mock, sent } = mockFor({ "x:MtaStageConnect/set": { accountId: "a1", updated: { singleton: null } } })
    mockHandle(mock)
    const r = await mtaStageConnectSet({ config: config.data, update: { singleton: { description: "hi" } } })
    expect(r.success).toBe(true)
    expect(sent[0]?.methodCalls[0]).toEqual([
      "x:MtaStageConnect/set",
      { update: { singleton: { description: "hi" } } },
      "c1",
    ])
  })

  test('mtaStageDataGet fills in ids: ["singleton"] for the MtaStageData singleton', async () => {
    const { mock, sent } = mockFor({
      "x:MtaStageData/get": { accountId: "a1", list: [{ id: "singleton" }], notFound: [] },
    })
    mockHandle(mock)
    const r = await mtaStageDataGet({ config: config.data })
    expect(r.success).toBe(true)
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual(["x:MtaStageData/get", { ids: ["singleton"] }, "c1"])
  })

  test("mtaStageDataSet updates the MtaStageData singleton", async () => {
    const { mock, sent } = mockFor({ "x:MtaStageData/set": { accountId: "a1", updated: { singleton: null } } })
    mockHandle(mock)
    const r = await mtaStageDataSet({ config: config.data, update: { singleton: { description: "hi" } } })
    expect(r.success).toBe(true)
    expect(sent[0]?.methodCalls[0]).toEqual([
      "x:MtaStageData/set",
      { update: { singleton: { description: "hi" } } },
      "c1",
    ])
  })

  test('mtaStageEhloGet fills in ids: ["singleton"] for the MtaStageEhlo singleton', async () => {
    const { mock, sent } = mockFor({
      "x:MtaStageEhlo/get": { accountId: "a1", list: [{ id: "singleton" }], notFound: [] },
    })
    mockHandle(mock)
    const r = await mtaStageEhloGet({ config: config.data })
    expect(r.success).toBe(true)
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual(["x:MtaStageEhlo/get", { ids: ["singleton"] }, "c1"])
  })

  test("mtaStageEhloSet updates the MtaStageEhlo singleton", async () => {
    const { mock, sent } = mockFor({ "x:MtaStageEhlo/set": { accountId: "a1", updated: { singleton: null } } })
    mockHandle(mock)
    const r = await mtaStageEhloSet({ config: config.data, update: { singleton: { description: "hi" } } })
    expect(r.success).toBe(true)
    expect(sent[0]?.methodCalls[0]).toEqual([
      "x:MtaStageEhlo/set",
      { update: { singleton: { description: "hi" } } },
      "c1",
    ])
  })

  test('mtaStageMailGet fills in ids: ["singleton"] for the MtaStageMail singleton', async () => {
    const { mock, sent } = mockFor({
      "x:MtaStageMail/get": { accountId: "a1", list: [{ id: "singleton" }], notFound: [] },
    })
    mockHandle(mock)
    const r = await mtaStageMailGet({ config: config.data })
    expect(r.success).toBe(true)
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual(["x:MtaStageMail/get", { ids: ["singleton"] }, "c1"])
  })

  test("mtaStageMailSet updates the MtaStageMail singleton", async () => {
    const { mock, sent } = mockFor({ "x:MtaStageMail/set": { accountId: "a1", updated: { singleton: null } } })
    mockHandle(mock)
    const r = await mtaStageMailSet({ config: config.data, update: { singleton: { description: "hi" } } })
    expect(r.success).toBe(true)
    expect(sent[0]?.methodCalls[0]).toEqual([
      "x:MtaStageMail/set",
      { update: { singleton: { description: "hi" } } },
      "c1",
    ])
  })

  test('mtaStageRcptGet fills in ids: ["singleton"] for the MtaStageRcpt singleton', async () => {
    const { mock, sent } = mockFor({
      "x:MtaStageRcpt/get": { accountId: "a1", list: [{ id: "singleton" }], notFound: [] },
    })
    mockHandle(mock)
    const r = await mtaStageRcptGet({ config: config.data })
    expect(r.success).toBe(true)
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual(["x:MtaStageRcpt/get", { ids: ["singleton"] }, "c1"])
  })

  test("mtaStageRcptSet updates the MtaStageRcpt singleton", async () => {
    const { mock, sent } = mockFor({ "x:MtaStageRcpt/set": { accountId: "a1", updated: { singleton: null } } })
    mockHandle(mock)
    const r = await mtaStageRcptSet({ config: config.data, update: { singleton: { description: "hi" } } })
    expect(r.success).toBe(true)
    expect(sent[0]?.methodCalls[0]).toEqual([
      "x:MtaStageRcpt/set",
      { update: { singleton: { description: "hi" } } },
      "c1",
    ])
  })

  test('mtaStsGet fills in ids: ["singleton"] for the MtaSts singleton', async () => {
    const { mock, sent } = mockFor({ "x:MtaSts/get": { accountId: "a1", list: [{ id: "singleton" }], notFound: [] } })
    mockHandle(mock)
    const r = await mtaStsGet({ config: config.data })
    expect(r.success).toBe(true)
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual(["x:MtaSts/get", { ids: ["singleton"] }, "c1"])
  })

  test("mtaStsSet updates the MtaSts singleton", async () => {
    const { mock, sent } = mockFor({ "x:MtaSts/set": { accountId: "a1", updated: { singleton: null } } })
    mockHandle(mock)
    const r = await mtaStsSet({ config: config.data, update: { singleton: { description: "hi" } } })
    expect(r.success).toBe(true)
    expect(sent[0]?.methodCalls[0]).toEqual(["x:MtaSts/set", { update: { singleton: { description: "hi" } } }, "c1"])
  })
})

describe("domain conveniences", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("domainCreate sends the name and returns the created id", async () => {
    const { mock: m, sent } = mockFor({ "x:Domain/set": { accountId: "a1", created: { d1: { id: "c" } } } })
    mock = m
    const r = await domainCreate({ config: config.data, name: "e2e.test" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.id).toBe("c")
    expect(sent[0]?.methodCalls[0]).toEqual(["x:Domain/set", { create: { d1: { name: "e2e.test" } } }, "c1"])
  })

  test("domainCreate merges extra fields and reports an empty created map", async () => {
    const first = mockFor({ "x:Domain/set": { accountId: "a1", created: { d1: { id: "c" } } } })
    mock = first.mock
    const ok = await domainCreate({ config: config.data, name: "e2e.test", domain: { description: "hi" } })
    expect(ok.success).toBe(true)
    expect(first.sent[0]?.methodCalls[0]).toEqual([
      "x:Domain/set",
      { create: { d1: { description: "hi", name: "e2e.test" } } },
      "c1",
    ])
    mock?.restore()
    const second = mockFor({ "x:Domain/set": { accountId: "a1", created: {} } })
    mock = second.mock
    const empty = await domainCreate({ config: config.data, name: "e2e.test" })
    expect(empty.success).toBe(false)
    if (!empty.success) expect(empty.op).toBe("domainCreate")
  })

  test("domainDestroy removes linked DKIM signatures before the domain", async () => {
    const seen: string[] = []
    const m = fetchMockCreate((request) => {
      if (new URL(request.url).pathname === "/jmap/session") return fetchMockJson(jmapTestSessionCreate())
      const body = JSON.parse(String(request.body)) as {
        methodCalls: [string, Record<string, unknown>, string][]
      }
      seen.push(body.methodCalls[0]?.[0] ?? "")
      const name = body.methodCalls[0]?.[0]
      if (name === "x:DkimSignature/query")
        return fetchMockJson({ methodResponses: [[name, { ids: ["s1", "s2"] }, "c1"]], sessionState: "1" })
      if (name === "x:DkimSignature/set")
        return fetchMockJson({ methodResponses: [[name, { destroyed: ["s1", "s2"] }, "c1"]], sessionState: "1" })
      return fetchMockJson({ methodResponses: [[name, { destroyed: ["d9"] }, "c1"]], sessionState: "1" })
    })
    mock = m
    const r = await domainDestroy({ config: config.data, id: "d9" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual({ destroyed: "d9", destroyedSignatures: ["s1", "s2"] })
    expect(seen).toEqual(["x:DkimSignature/query", "x:DkimSignature/set", "x:Domain/set"])
  })

  test("domainDestroy skips the signature step when none are linked", async () => {
    const seen: string[] = []
    const m = fetchMockCreate((request) => {
      if (new URL(request.url).pathname === "/jmap/session") return fetchMockJson(jmapTestSessionCreate())
      const body = JSON.parse(String(request.body)) as {
        methodCalls: [string, Record<string, unknown>, string][]
      }
      seen.push(body.methodCalls[0]?.[0] ?? "")
      const name = body.methodCalls[0]?.[0]
      if (name === "x:DkimSignature/query")
        return fetchMockJson({ methodResponses: [[name, { ids: [] }, "c1"]], sessionState: "1" })
      return fetchMockJson({ methodResponses: [[name, { destroyed: ["d9"] }, "c1"]], sessionState: "1" })
    })
    mock = m
    const r = await domainDestroy({ config: config.data, id: "d9" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.destroyedSignatures).toEqual([])
    expect(seen).toEqual(["x:DkimSignature/query", "x:Domain/set"])
  })

  test("domainZoneFile reads the dnsZoneFile property", async () => {
    const { mock: m, sent } = mockFor({
      "x:Domain/get": {
        accountId: "a1",
        list: [{ id: "b", dnsZoneFile: 'example.test. IN TXT "v=spf1"' }],
        notFound: [],
      },
    })
    mock = m
    const r = await domainZoneFile({ config: config.data, id: "b" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toContain("v=spf1")
    expect(sent[0]?.methodCalls[0]).toEqual(["x:Domain/get", { ids: ["b"], properties: ["dnsZoneFile"] }, "c1"])
  })

  test("domainZoneFile reports a missing domain", async () => {
    const { mock: m } = mockFor({ "x:Domain/get": { accountId: "a1", list: [], notFound: ["b"] } })
    mock = m
    const r = await domainZoneFile({ config: config.data, id: "b" })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("domainZoneFile")
  })
})

describe("dkimSignatureCreate covers each algorithm", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  for (const algorithm of dkimSignatureAlgorithms) {
    test(`creates a ${algorithm} signature with a Text secret`, async () => {
      const { mock: m, sent } = mockFor({ "x:DkimSignature/set": { accountId: "a1", created: { k1: { id: "s9" } } } })
      mock = m
      const r = await dkimSignatureCreate({
        config: config.data,
        domainId: "d1",
        selector: "s1",
        privateKey: "PEM",
        algorithm,
      })
      expect(r.success).toBe(true)
      if (r.success) expect(r.data.id).toBe("s9")
      const args = sent[0]?.methodCalls[0]?.[1] as { create: Record<string, Record<string, unknown>> }
      expect(args.create.k1?.["@type"]).toBe(algorithm)
      expect(args.create.k1?.privateKey).toEqual({ "@type": "Text", secret: "PEM" })
      if (algorithm.startsWith("Dkim2")) expect(args.create.k1?.flags).toEqual({})
      else expect(args.create.k1?.flags).toBeUndefined()
    })
  }

  test("rejects an unknown algorithm without sending a request", async () => {
    const { mock: m, sent } = mockFor({})
    mock = m
    const r = await dkimSignatureCreate({
      config: config.data,
      domainId: "d1",
      selector: "s1",
      privateKey: "PEM",
      algorithm: "Rsa0" as never,
    })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("dkimSignatureCreate")
    expect(sent).toHaveLength(0)
  })
})

describe("queued message conveniences", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("queuedMessageRetry patches nextRetry (defaults to now)", async () => {
    const first = mockFor({ "x:QueuedMessage/set": { accountId: "a1", updated: { q1: null } } })
    mock = first.mock
    const before = new Date().toISOString()
    const r = await queuedMessageRetry({ config: config.data, id: "q1" })
    expect(r.success).toBe(true)
    const update = first.sent[0]?.methodCalls[0]?.[1] as { update: Record<string, { nextRetry: string }> }
    expect(typeof update.update.q1?.nextRetry).toBe("string")
    expect((update.update.q1?.nextRetry ?? "") >= before).toBe(true)
    mock?.restore()
    const second = mockFor({ "x:QueuedMessage/set": { accountId: "a1", updated: { q1: null } } })
    mock = second.mock
    const explicit = await queuedMessageRetry({ config: config.data, id: "q1", nextRetry: "2030-01-01T00:00:00Z" })
    expect(explicit.success).toBe(true)
    expect(second.sent[0]?.methodCalls[0]?.[1]).toEqual({ update: { q1: { nextRetry: "2030-01-01T00:00:00Z" } } })
  })

  test("queuedMessageCancel destroys the queued message", async () => {
    const { mock: m, sent } = mockFor({ "x:QueuedMessage/set": { accountId: "a1", destroyed: ["q1"] } })
    mock = m
    const r = await queuedMessageCancel({ config: config.data, id: "q1" })
    expect(r.success).toBe(true)
    expect(sent[0]?.methodCalls[0]).toEqual(["x:QueuedMessage/set", { destroy: ["q1"] }, "c1"])
  })

  test("queuedMessageContents gets the blob and downloads it", async () => {
    const m = fetchMockCreate((request) => {
      const url = new URL(request.url)
      if (url.pathname === "/jmap/session") return fetchMockJson(jmapTestSessionCreate())
      if (url.pathname.startsWith("/jmap/download/"))
        return new Response("Subject: hi\n\nbody here", { status: 200, headers: { "Content-Type": "text/plain" } })
      return fetchMockJson({
        methodResponses: [
          ["x:QueuedMessage/get", { accountId: "a1", list: [{ id: "q1", blobId: "blob9" }], notFound: [] }, "c1"],
        ],
        sessionState: "1",
      })
    })
    mock = m
    const r = await queuedMessageContents({ config: config.data, id: "q1" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toContain("body here")
  })

  test("queuedMessageContents reports a missing message", async () => {
    const { mock: m } = mockFor({ "x:QueuedMessage/get": { accountId: "a1", list: [], notFound: ["q1"] } })
    mock = m
    const r = await queuedMessageContents({ config: config.data, id: "q1" })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("queuedMessageContents")
  })
})

describe("set errors and invalid options", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("domainSet turns notDestroyed into a ResultErr", async () => {
    const { mock: m } = mockFor({
      "x:Domain/set": {
        accountId: "a1",
        notDestroyed: { b: { type: "objectIsLinked", description: "linked DKIM signature" } },
      },
    })
    mock = m
    const r = await domainSet({ config: config.data, destroy: ["b"] })
    expect(r.success).toBe(false)
    if (!r.success) {
      // The thin wrapper passes registrySet's error through, so the op names the detecting layer.
      expect(r.op).toBe("registrySet")
      expect(r.errorMessage).toContain("objectIsLinked")
      expect(JSON.parse(r.errorData ?? "{}").notDestroyed.b.type).toBe("objectIsLinked")
    }
  })

  test("dkimSignatureSet turns notCreated into a ResultErr", async () => {
    const { mock: m } = mockFor({
      "x:DkimSignature/set": {
        accountId: "a1",
        notCreated: { k1: { type: "invalidProperties", description: "bad key" } },
      },
    })
    mock = m
    const r = await dkimSignatureSet({ config: config.data, create: { k1: { selector: "s1" } } })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.errorMessage).toContain("invalidProperties")
  })

  test("mtaRouteSet turns notUpdated into a ResultErr", async () => {
    const { mock: m } = mockFor({
      "x:MtaRoute/set": { accountId: "a1", notUpdated: { r1: { type: "notFound", description: "no such route" } } },
    })
    mock = m
    const r = await mtaRouteSet({ config: config.data, update: { r1: { description: "x" } } })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.errorMessage).toContain("notFound")
  })

  test("queuedMessageSet turns notDestroyed into a ResultErr", async () => {
    const { mock: m } = mockFor({
      "x:QueuedMessage/set": { accountId: "a1", notDestroyed: { q1: { type: "notFound", description: "gone" } } },
    })
    mock = m
    const r = await queuedMessageSet({ config: config.data, destroy: ["q1"] })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.errorMessage).toContain("notFound")
  })

  test("invalid options are a ResultErr with the op name", async () => {
    const { mock: m, sent } = mockFor({})
    mock = m
    const bad = { config: { baseUrl: "" } } as never
    for (const [label, run] of [
      ["domainGet", () => domainGet(bad)],
      ["domainQuery", () => domainQuery(bad)],
      ["domainCreate", () => domainCreate(bad)],
      ["domainDestroy", () => domainDestroy(bad)],
      ["dkimSignatureCreate", () => dkimSignatureCreate(bad)],
      ["mtaRouteGet", () => mtaRouteGet(bad)],
      ["mtaRouteQuery", () => mtaRouteQuery(bad)],
      ["queuedMessageRetry", () => queuedMessageRetry(bad)],
      ["queuedMessageCancel", () => queuedMessageCancel(bad)],
      ["queuedMessageContents", () => queuedMessageContents(bad)],
      ["dnsResolverSet", () => dnsResolverSet(bad)],
      ["mtaStsGet", () => mtaStsGet(bad)],
    ] as const) {
      const r = await run()
      expect(r.success).toBe(false)
      if (!r.success) expect(r.op).toBe(label)
    }
    expect(sent).toHaveLength(0)
  })
})

describe("CLI route maps smoke test", () => {
  type RouteTarget = {
    getAllEntries?: () => readonly { name: { original: string }; target: RouteTarget }[]
    loader?: () => Promise<unknown>
  }

  async function reachableCommands(routeMap: RouteTarget, path: string[] = []): Promise<string[]> {
    const commands: string[] = []
    for (const entry of routeMap.getAllEntries?.() ?? []) {
      const entryPath = [...path, entry.name.original]
      if (entry.target.loader !== undefined) {
        await entry.target.loader()
        commands.push(entryPath.join(" "))
        continue
      }
      commands.push(...(await reachableCommands(entry.target, entryPath)))
    }
    return commands
  }

  test("throwaway application exposes all 80 op commands", async () => {
    const app = buildApplication(
      buildRouteMap({
        routes: { domains: domainsCommands, mta: mtaCommands },
        docs: { brief: "smoke" },
      }),
      { name: "smoke", versionInfo: { currentVersion: "0.0.0" } },
    )
    const paths = await reachableCommands(app.root as unknown as RouteTarget)
    expect(paths).toHaveLength(80)
    for (const expected of [
      "domains domain get",
      "domains domain create",
      "domains domain destroy",
      "domains domain zone-file",
      "domains dkim-signature create",
      "domains certificate query",
      "domains acme-provider set",
      "domains dns-server get",
      "domains dns-resolver set",
      "mta mta-route query",
      "mta queued-message retry",
      "mta queued-message cancel",
      "mta queued-message contents",
      "mta network-listener query",
      "mta mta-sts set",
      "mta mta-stage-rcpt get",
    ]) {
      expect(paths).toContain(expected)
    }
  })
})
