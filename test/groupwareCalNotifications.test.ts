import { afterEach, describe, expect, test } from "bun:test"
import { stalwartClientConfig } from "../src/client/stalwartClientConfig.js"
import type { JmapSession } from "../src/jmap/jmapSession.js"
import { calendarEventNotificationChanges } from "../src/calendarEventNotifications/calendarEventNotificationChanges.js"
import { calendarEventNotificationGet } from "../src/calendarEventNotifications/calendarEventNotificationGet.js"
import { calendarEventNotificationQuery } from "../src/calendarEventNotifications/calendarEventNotificationQuery.js"
import { calendarEventNotificationQueryChanges } from "../src/calendarEventNotifications/calendarEventNotificationQueryChanges.js"
import { calendarEventNotificationSet } from "../src/calendarEventNotifications/calendarEventNotificationSet.js"
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

describe("groupwareCal calendar event notification ops", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("calendarEventNotificationGet sends ids with the calendars capability", async () => {
    const m = mockMethodResponse("CalendarEventNotification/get", {
      list: [{ id: "n1", type: "created" }],
      notFound: [],
    })
    mock = m.mock
    const r = await calendarEventNotificationGet({ config: config.data, accountId: "a1", ids: ["n1"] })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.list[0]?.type).toBe("created")
    expect(m.sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:ietf:params:jmap:calendars"])
    expect(m.sent[0]?.methodCalls[0]).toEqual(["CalendarEventNotification/get", { accountId: "a1", ids: ["n1"] }, "c1"])
  })

  test("calendarEventNotificationQuery sends the type filter", async () => {
    const m = mockMethodResponse("CalendarEventNotification/query", { ids: ["n1"], queryState: "s1", position: 0 })
    mock = m.mock
    const r = await calendarEventNotificationQuery({
      config: config.data,
      accountId: "a1",
      filter: { type: "created" },
    })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.methodCalls[0]).toEqual([
      "CalendarEventNotification/query",
      { accountId: "a1", filter: { type: "created" } },
      "c1",
    ])
  })

  test("calendarEventNotificationChanges sends sinceState", async () => {
    const m = mockMethodResponse("CalendarEventNotification/changes", {
      oldState: "s0",
      newState: "s1",
      hasMoreChanges: false,
      created: ["n1"],
      updated: [],
      destroyed: [],
    })
    mock = m.mock
    const r = await calendarEventNotificationChanges({ config: config.data, accountId: "a1", sinceState: "s0" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.created).toEqual(["n1"])
    expect(m.sent[0]?.methodCalls[0]?.[0]).toBe("CalendarEventNotification/changes")
  })

  test("calendarEventNotificationQueryChanges sends sinceQueryState", async () => {
    const m = mockMethodResponse("CalendarEventNotification/queryChanges", {
      oldQueryState: "q0",
      newQueryState: "q1",
      removed: [],
      added: [],
    })
    mock = m.mock
    const r = await calendarEventNotificationQueryChanges({
      config: config.data,
      accountId: "a1",
      sinceQueryState: "q0",
    })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({ accountId: "a1", sinceQueryState: "q0" })
  })

  test("calendarEventNotificationSet sends destroy to acknowledge", async () => {
    const m = mockMethodResponse("CalendarEventNotification/set", { destroyed: ["n1"] })
    mock = m.mock
    const r = await calendarEventNotificationSet({ config: config.data, accountId: "a1", destroy: ["n1"] })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.destroyed).toEqual(["n1"])
    expect(m.sent[0]?.methodCalls[0]).toEqual([
      "CalendarEventNotification/set",
      { accountId: "a1", destroy: ["n1"] },
      "c1",
    ])
  })

  test("calendarEventNotificationSet turns a notDestroyed entry into a ResultErr", async () => {
    const m = mockMethodResponse("CalendarEventNotification/set", {
      notDestroyed: { n1: { type: "notFound", description: "unknown notification" } },
    })
    mock = m.mock
    const r = await calendarEventNotificationSet({ config: config.data, accountId: "a1", destroy: ["n1"] })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("calendarEventNotificationSet")
  })

  test("invalid options are a ResultErr with the op name", async () => {
    const m = mockMethodResponse("CalendarEventNotification/get", {})
    mock = m.mock
    const r = await calendarEventNotificationGet({ config: { baseUrl: "" } })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("calendarEventNotificationGet")
    expect(m.sent).toHaveLength(0)
  })
})
