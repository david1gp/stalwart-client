import { afterEach, describe, expect, test } from "bun:test"
import { stalwartClientConfig } from "../src/client/stalwartClientConfig.js"
import type { JmapSession } from "../src/jmap/jmapSession.js"
import { calendarChanges } from "../src/calendars/calendarChanges.js"
import { calendarGet } from "../src/calendars/calendarGet.js"
import { calendarQuery } from "../src/calendars/calendarQuery.js"
import { calendarSet } from "../src/calendars/calendarSet.js"
import { fetchMockCreate, fetchMockJson } from "./fetchMock.js"
import { jmapTestSessionCreate } from "./jmapTestSession.js"

const config = stalwartClientConfig({ baseUrl: "https://mail.example.com", token: "API_x" })
if (!config.success) throw new Error("fixture config invalid")

function groupwareSessionCreate(): JmapSession {
  const base = jmapTestSessionCreate()
  return {
    ...base,
    primaryAccounts: { ...base.primaryAccounts, "urn:ietf:params:jmap:calendars": "a1" },
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

describe("groupwareCal calendars ops", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("calendarGet sends ids and properties with the calendars capability", async () => {
    const m = mockMethodResponse("Calendar/get", { list: [{ id: "c1", name: "Personal" }], notFound: [] })
    mock = m.mock
    const r = await calendarGet({ config: config.data, accountId: "a1", ids: ["c1"], properties: ["name"] })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.list[0]?.name).toBe("Personal")
    expect(m.sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:ietf:params:jmap:calendars"])
    expect(m.sent[0]?.methodCalls[0]).toEqual([
      "Calendar/get",
      { accountId: "a1", ids: ["c1"], properties: ["name"] },
      "c1",
    ])
  })

  test("calendarGet resolves the accountId from the session when omitted", async () => {
    const m = mockMethodResponse("Calendar/get", { list: [], notFound: [] })
    mock = m.mock
    const r = await calendarGet({ config: config.data })
    expect(r.success).toBe(true)
    expect(m.requests[0]).toBe("GET /jmap/session")
    expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({ accountId: "a1" })
  })

  test("calendarQuery sends the limit and calculateTotal", async () => {
    const m = mockMethodResponse("Calendar/query", { ids: ["c1"], queryState: "s1", position: 0, total: 1 })
    mock = m.mock
    const r = await calendarQuery({ config: config.data, accountId: "a1", limit: 10, calculateTotal: true })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.total).toBe(1)
    expect(m.sent[0]?.methodCalls[0]).toEqual([
      "Calendar/query",
      { accountId: "a1", limit: 10, calculateTotal: true },
      "c1",
    ])
  })

  test("calendarChanges sends sinceState and maxChanges", async () => {
    const m = mockMethodResponse("Calendar/changes", {
      oldState: "s0",
      newState: "s1",
      hasMoreChanges: false,
      created: ["c2"],
      updated: [],
      destroyed: [],
    })
    mock = m.mock
    const r = await calendarChanges({ config: config.data, accountId: "a1", sinceState: "s0", maxChanges: 5 })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.created).toEqual(["c2"])
    expect(m.sent[0]?.methodCalls[0]).toEqual([
      "Calendar/changes",
      { accountId: "a1", sinceState: "s0", maxChanges: 5 },
      "c1",
    ])
  })

  test("calendarSet sends create and the set-only arguments", async () => {
    const m = mockMethodResponse("Calendar/set", { created: { k1: { id: "c9" } } })
    mock = m.mock
    const r = await calendarSet({
      config: config.data,
      accountId: "a1",
      create: { k1: { name: "Work" } },
      onDestroyRemoveEvents: true,
      onSuccessSetIsDefault: "#k1",
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.created?.k1?.id).toBe("c9")
    expect(m.sent[0]?.methodCalls[0]).toEqual([
      "Calendar/set",
      {
        accountId: "a1",
        create: { k1: { name: "Work" } },
        onDestroyRemoveEvents: true,
        onSuccessSetIsDefault: "#k1",
      },
      "c1",
    ])
  })

  test("calendarSet turns a notDestroyed entry into a ResultErr", async () => {
    const m = mockMethodResponse("Calendar/set", {
      destroyed: [],
      notDestroyed: { c1: { type: "calendarHasEvents", description: "still has events" } },
    })
    mock = m.mock
    const r = await calendarSet({ config: config.data, accountId: "a1", destroy: ["c1"] })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.op).toBe("calendarSet")
      expect(r.errorMessage).toContain("calendarHasEvents")
    }
  })

  test("invalid options are a ResultErr with the op name", async () => {
    const m = mockMethodResponse("Calendar/get", {})
    mock = m.mock
    const r = await calendarGet({ config: { baseUrl: "" } })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("calendarGet")
    expect(m.sent).toHaveLength(0)
  })
})
