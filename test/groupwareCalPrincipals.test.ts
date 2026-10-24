import { afterEach, describe, expect, test } from "bun:test"
import { stalwartClientConfig } from "../src/client/stalwartClientConfig.js"
import type { JmapSession } from "../src/jmap/jmapSession.js"
import { principalChanges } from "../src/principals/principalChanges.js"
import { principalGet } from "../src/principals/principalGet.js"
import { principalGetAvailability } from "../src/principals/principalGetAvailability.js"
import { principalQuery } from "../src/principals/principalQuery.js"
import { principalQueryChanges } from "../src/principals/principalQueryChanges.js"
import { principalSet } from "../src/principals/principalSet.js"
import { fetchMockCreate, fetchMockJson } from "./fetchMock.js"
import { jmapTestSessionCreate } from "./jmapTestSession.js"

const config = stalwartClientConfig({ baseUrl: "https://mail.example.com", token: "API_x" })
if (!config.success) throw new Error("fixture config invalid")

function groupwareSessionCreate(): JmapSession {
  const base = jmapTestSessionCreate()
  return {
    ...base,
    primaryAccounts: {
      ...base.primaryAccounts,
      "urn:ietf:params:jmap:principals": "a1",
      "urn:ietf:params:jmap:calendars": "a1",
    },
  }
}

type SentCall = { using: string[]; methodCalls: [string, Record<string, unknown>, string][] }

function mockMethodResponse(name: string, args: Record<string, unknown>) {
  const sent: SentCall[] = []
  const requests: string[] = []
  const mock = fetchMockCreate((request) => {
    const url = new URL(request.url)
    requests.push(`${request.method} ${url.pathname}`)
    if (url.pathname === "/jmap/session") return fetchMockJson(groupwareSessionCreate())
    sent.push(JSON.parse(String(request.body)) as SentCall)
    return fetchMockJson({ methodResponses: [[name, args, "c1"]], sessionState: "1" })
  })
  return { mock, sent, requests }
}

describe("groupwareCal principals ops", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("principalGet sends ids and properties with the principals capability", async () => {
    const m = mockMethodResponse("Principal/get", { list: [{ id: "p1", name: "Bob" }], notFound: [] })
    mock = m.mock
    const r = await principalGet({ config: config.data, accountId: "a1", ids: ["p1"], properties: ["name"] })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.list[0]?.name).toBe("Bob")
    expect(m.sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:ietf:params:jmap:principals"])
    expect(m.sent[0]?.methodCalls[0]).toEqual([
      "Principal/get",
      { accountId: "a1", ids: ["p1"], properties: ["name"] },
      "c1",
    ])
  })

  test("principalGet resolves the accountId from the session when omitted", async () => {
    const m = mockMethodResponse("Principal/get", { list: [], notFound: ["p9"] })
    mock = m.mock
    const r = await principalGet({ config: config.data, ids: ["p9"] })
    expect(r.success).toBe(true)
    expect(m.requests[0]).toBe("GET /jmap/session")
    expect(m.requests[1]).toBe("POST /jmap/")
    expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({ accountId: "a1", ids: ["p9"] })
  })

  test("principalQuery sends the filter, sort and limit", async () => {
    const m = mockMethodResponse("Principal/query", { ids: ["p1"], queryState: "s1", position: 0 })
    mock = m.mock
    const r = await principalQuery({
      config: config.data,
      accountId: "a1",
      filter: { email: "bob@example.test" },
      sort: [{ property: "name" }],
      limit: 10,
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.ids).toEqual(["p1"])
    expect(m.sent[0]?.methodCalls[0]).toEqual([
      "Principal/query",
      { accountId: "a1", filter: { email: "bob@example.test" }, sort: [{ property: "name" }], limit: 10 },
      "c1",
    ])
  })

  test("principalChanges sends sinceState", async () => {
    const m = mockMethodResponse("Principal/changes", {
      oldState: "s0",
      newState: "s1",
      hasMoreChanges: false,
      created: [],
      updated: ["p1"],
      destroyed: [],
    })
    mock = m.mock
    const r = await principalChanges({ config: config.data, accountId: "a1", sinceState: "s0" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.updated).toEqual(["p1"])
    expect(m.sent[0]?.methodCalls[0]).toEqual(["Principal/changes", { accountId: "a1", sinceState: "s0" }, "c1"])
  })

  test("principalQueryChanges sends sinceQueryState", async () => {
    const m = mockMethodResponse("Principal/queryChanges", {
      oldQueryState: "q0",
      newQueryState: "q1",
      removed: [],
      added: [{ id: "p1", index: 0 }],
    })
    mock = m.mock
    const r = await principalQueryChanges({ config: config.data, accountId: "a1", sinceQueryState: "q0" })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.methodCalls[0]?.[0]).toBe("Principal/queryChanges")
    expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({ accountId: "a1", sinceQueryState: "q0" })
  })

  test("principalSet sends create and maps a method-level rejection to a ResultErr", async () => {
    const sent: SentCall[] = []
    mock = fetchMockCreate((request) => {
      if (new URL(request.url).pathname === "/jmap/session") return fetchMockJson(groupwareSessionCreate())
      sent.push(JSON.parse(String(request.body)) as SentCall)
      return fetchMockJson({
        methodResponses: [["error", { type: "unknownMethod", description: "Invalid method" }, "c1"]],
        sessionState: "1",
      })
    })
    const r = await principalSet({ config: config.data, accountId: "a1", create: { c1: { name: "New" } } })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.errorMessage).toContain("unknownMethod")
    expect(sent[0]?.methodCalls[0]).toEqual([
      "Principal/set",
      { accountId: "a1", create: { c1: { name: "New" } } },
      "c1",
    ])
  })

  test("principalSet turns a notCreated entry into a ResultErr", async () => {
    const m = mockMethodResponse("Principal/set", {
      notCreated: { c1: { type: "invalidProperties", description: "bad patch" } },
    })
    mock = m.mock
    const r = await principalSet({ config: config.data, accountId: "a1", create: { c1: {} } })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.op).toBe("principalSet")
      expect(JSON.parse(r.errorData ?? "{}").notCreated.c1.type).toBe("invalidProperties")
    }
  })

  test("principalGetAvailability sends id and range with the availability capability", async () => {
    const m = mockMethodResponse("Principal/getAvailability", { list: [] })
    mock = m.mock
    const r = await principalGetAvailability({
      config: config.data,
      accountId: "a1",
      id: "p1",
      utcStart: "2026-10-26T00:00:00Z",
      utcEnd: "2026-10-27T00:00:00Z",
    })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.using).toEqual([
      "urn:ietf:params:jmap:core",
      "urn:ietf:params:jmap:principals",
      "urn:ietf:params:jmap:principals:availability",
    ])
    expect(m.sent[0]?.methodCalls[0]).toEqual([
      "Principal/getAvailability",
      { accountId: "a1", id: "p1", utcStart: "2026-10-26T00:00:00Z", utcEnd: "2026-10-27T00:00:00Z" },
      "c1",
    ])
  })

  test("invalid options are a ResultErr with the op name", async () => {
    const m = mockMethodResponse("Principal/query", {})
    mock = m.mock
    const r = await principalQuery({ config: { baseUrl: "" } })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("principalQuery")
    expect(m.sent).toHaveLength(0)
  })
})
