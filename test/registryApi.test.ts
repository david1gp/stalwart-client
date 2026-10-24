import { afterEach, describe, expect, test } from "bun:test"
import { stalwartClientConfig } from "../src/client/stalwartClientConfig.js"
import { registryGet } from "../src/registry/registryGet.js"
import { registryQuery } from "../src/registry/registryQuery.js"
import { registrySet } from "../src/registry/registrySet.js"
import { fetchMockCreate, fetchMockJson } from "./fetchMock.js"
import { jmapTestSessionCreate } from "./jmapTestSession.js"

const config = stalwartClientConfig({ baseUrl: "https://mail.example.com", username: "admin", password: "pw" })
if (!config.success) throw new Error("fixture config invalid")

type SentCall = { using: string[]; methodCalls: [string, Record<string, unknown>, string][] }

function registryMockCreate(methodResponse: [string, Record<string, unknown>]) {
  const sent: SentCall[] = []
  const mock = fetchMockCreate((request) => {
    if (new URL(request.url).pathname === "/jmap/session") return fetchMockJson(jmapTestSessionCreate())
    sent.push(JSON.parse(String(request.body)) as SentCall)
    return fetchMockJson({ methodResponses: [[...methodResponse, "c1"]], sessionState: "1" })
  })
  return { mock, sent }
}

describe("registryGet fetches management objects", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("sends x:Domain/get with the stalwart capability and ids: null when no ids are given", async () => {
    const m = registryMockCreate(["x:Domain/get", { list: [{ id: "b", name: "example.com" }], notFound: [] }])
    mock = m.mock
    const r = await registryGet({ config: config.data, objectType: "Domain" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.list[0]?.name).toBe("example.com")
    expect(m.sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(m.sent[0]?.methodCalls[0]).toEqual(["x:Domain/get", { ids: null }, "c1"])
  })

  test('fills in ids: ["singleton"] for singleton objects such as Imap', async () => {
    const m = registryMockCreate(["x:Imap/get", { list: [{ id: "singleton", timeoutIdle: 1800000 }], notFound: [] }])
    mock = m.mock
    const r = await registryGet({ config: config.data, objectType: "Imap", properties: ["timeoutIdle"] })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({ ids: ["singleton"], properties: ["timeoutIdle"] })
  })

  test("rejects an unknown object type without sending a request", async () => {
    const m = registryMockCreate(["x:Nope/get", {}])
    mock = m.mock
    const r = await registryGet({ config: config.data, objectType: "Nope" as "Domain" })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("registryGet")
    expect(m.sent).toHaveLength(0)
  })
})

describe("registryQuery lists management object ids", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("passes filter, sort and limit through and drops undefined arguments", async () => {
    const m = registryMockCreate(["x:Domain/query", { ids: ["b"], position: 0, queryState: "n" }])
    mock = m.mock
    const r = await registryQuery({
      config: config.data,
      objectType: "Domain",
      filter: { name: "example.com" },
      sort: [{ property: "name" }],
      limit: 10,
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.ids).toEqual(["b"])
    expect(m.sent[0]?.methodCalls[0]).toEqual([
      "x:Domain/query",
      { filter: { name: "example.com" }, sort: [{ property: "name" }], limit: 10 },
      "c1",
    ])
  })

  test("refuses /query on a singleton without sending a request", async () => {
    const m = registryMockCreate(["x:Imap/query", {}])
    mock = m.mock
    const r = await registryQuery({ config: config.data, objectType: "Imap" })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.errorMessage).toContain("singleton")
    expect(m.sent).toHaveLength(0)
  })
})

describe("registrySet creates, updates and destroys management objects", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("returns created ids on success", async () => {
    const m = registryMockCreate(["x:Domain/set", { created: { d1: { id: "c" } } }])
    mock = m.mock
    const r = await registrySet({ config: config.data, objectType: "Domain", create: { d1: { name: "e2e.test" } } })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.created?.d1?.id).toBe("c")
    expect(m.sent[0]?.methodCalls[0]).toEqual(["x:Domain/set", { create: { d1: { name: "e2e.test" } } }, "c1"])
  })

  test("turns a notDestroyed entry into a ResultErr that carries the set response", async () => {
    const m = registryMockCreate([
      "x:Domain/set",
      { notDestroyed: { b: { type: "objectIsLinked", description: "linked DKIM signature" } } },
    ])
    mock = m.mock
    const r = await registrySet({ config: config.data, objectType: "Domain", destroy: ["b"] })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.errorMessage).toContain("objectIsLinked")
      expect(JSON.parse(r.errorData ?? "{}").notDestroyed.b.type).toBe("objectIsLinked")
    }
  })

  test("requires at least one of create, update or destroy", async () => {
    const m = registryMockCreate(["x:Domain/set", {}])
    mock = m.mock
    const r = await registrySet({ config: config.data, objectType: "Domain" })
    expect(r.success).toBe(false)
    expect(m.sent).toHaveLength(0)
  })
})
