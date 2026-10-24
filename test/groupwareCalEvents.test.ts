import { afterEach, describe, expect, test } from "bun:test"
import { stalwartClientConfig } from "../src/client/stalwartClientConfig.js"
import type { JmapSession } from "../src/jmap/jmapSession.js"
import { calendarEventChanges } from "../src/calendarEvents/calendarEventChanges.js"
import { calendarEventCopy } from "../src/calendarEvents/calendarEventCopy.js"
import { calendarEventGet } from "../src/calendarEvents/calendarEventGet.js"
import { calendarEventParse } from "../src/calendarEvents/calendarEventParse.js"
import { calendarEventQuery } from "../src/calendarEvents/calendarEventQuery.js"
import { calendarEventQueryChanges } from "../src/calendarEvents/calendarEventQueryChanges.js"
import { calendarEventSet } from "../src/calendarEvents/calendarEventSet.js"
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

describe("groupwareCal calendar event ops", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("calendarEventGet sends ids plus the get-only arguments", async () => {
    const m = mockMethodResponse("CalendarEvent/get", { list: [{ id: "e1", title: "Standup" }], notFound: [] })
    mock = m.mock
    const r = await calendarEventGet({
      config: config.data,
      accountId: "a1",
      ids: ["e1"],
      reduceParticipants: true,
      timeZone: "Europe/Berlin",
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.list[0]?.title).toBe("Standup")
    expect(m.sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:ietf:params:jmap:calendars"])
    expect(m.sent[0]?.methodCalls[0]).toEqual([
      "CalendarEvent/get",
      { accountId: "a1", ids: ["e1"], reduceParticipants: true, timeZone: "Europe/Berlin" },
      "c1",
    ])
  })

  test("calendarEventQuery sends the filter and query-only arguments", async () => {
    const m = mockMethodResponse("CalendarEvent/query", { ids: ["e1"], queryState: "s1", position: 0 })
    mock = m.mock
    const r = await calendarEventQuery({
      config: config.data,
      accountId: "a1",
      filter: { inCalendar: "c1" },
      sort: [{ property: "start" }],
      expandRecurrences: true,
    })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.methodCalls[0]).toEqual([
      "CalendarEvent/query",
      { accountId: "a1", filter: { inCalendar: "c1" }, sort: [{ property: "start" }], expandRecurrences: true },
      "c1",
    ])
  })

  test("calendarEventChanges sends sinceState", async () => {
    const m = mockMethodResponse("CalendarEvent/changes", {
      oldState: "s0",
      newState: "s1",
      hasMoreChanges: false,
      created: ["e2"],
      updated: [],
      destroyed: [],
    })
    mock = m.mock
    const r = await calendarEventChanges({ config: config.data, accountId: "a1", sinceState: "s0" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.created).toEqual(["e2"])
    expect(m.sent[0]?.methodCalls[0]?.[0]).toBe("CalendarEvent/changes")
  })

  test("calendarEventQueryChanges sends sinceQueryState", async () => {
    const m = mockMethodResponse("CalendarEvent/queryChanges", {
      oldQueryState: "q0",
      newQueryState: "q1",
      removed: [],
      added: [],
    })
    mock = m.mock
    const r = await calendarEventQueryChanges({ config: config.data, accountId: "a1", sinceQueryState: "q0" })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({ accountId: "a1", sinceQueryState: "q0" })
  })

  test("calendarEventSet sends create with sendSchedulingMessages", async () => {
    const m = mockMethodResponse("CalendarEvent/set", { created: { k1: { id: "e9" } } })
    mock = m.mock
    const r = await calendarEventSet({
      config: config.data,
      accountId: "a1",
      create: { k1: { calendarIds: { c1: true }, title: "Lunch" } },
      sendSchedulingMessages: false,
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.created?.k1?.id).toBe("e9")
    expect(m.sent[0]?.methodCalls[0]).toEqual([
      "CalendarEvent/set",
      {
        accountId: "a1",
        create: { k1: { calendarIds: { c1: true }, title: "Lunch" } },
        sendSchedulingMessages: false,
      },
      "c1",
    ])
  })

  test("calendarEventSet turns a notUpdated entry into a ResultErr", async () => {
    const m = mockMethodResponse("CalendarEvent/set", {
      updated: {},
      notUpdated: { e1: { type: "stateMismatch", description: "stale state" } },
    })
    mock = m.mock
    const r = await calendarEventSet({ config: config.data, accountId: "a1", update: { e1: { title: "X" } } })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.op).toBe("calendarEventSet")
      expect(r.errorMessage).toContain("stateMismatch")
    }
  })

  test("calendarEventCopy sends both account ids and create", async () => {
    const m = mockMethodResponse("CalendarEvent/copy", {
      fromAccountId: "a2",
      accountId: "a1",
      oldState: "s0",
      newState: "s1",
      created: { e1: { id: "e9" } },
    })
    mock = m.mock
    const r = await calendarEventCopy({
      config: config.data,
      fromAccountId: "a2",
      accountId: "a1",
      create: { e1: { calendarIds: { c1: true } } },
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.created?.e1?.id).toBe("e9")
    expect(m.sent[0]?.methodCalls[0]).toEqual([
      "CalendarEvent/copy",
      { fromAccountId: "a2", accountId: "a1", create: { e1: { calendarIds: { c1: true } } } },
      "c1",
    ])
  })

  test("calendarEventCopy turns a notCreated entry into a ResultErr", async () => {
    const m = mockMethodResponse("CalendarEvent/copy", {
      fromAccountId: "a2",
      accountId: "a1",
      oldState: "s0",
      newState: "s0",
      notCreated: { e1: { type: "notFound", description: "Item e1 not found in account a2." } },
    })
    mock = m.mock
    const r = await calendarEventCopy({ config: config.data, fromAccountId: "a2", accountId: "a1", create: { e1: {} } })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.op).toBe("calendarEventCopy")
      expect(r.errorMessage).toContain("notFound")
    }
  })

  test("calendarEventParse sends blobIds with the parse capability", async () => {
    const m = mockMethodResponse("CalendarEvent/parse", {
      accountId: "a1",
      parsed: { b1: [{ id: "e1", title: "Imported" }] },
    })
    mock = m.mock
    const r = await calendarEventParse({ config: config.data, accountId: "a1", blobIds: ["b1"] })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.parsed?.b1?.[0]?.title).toBe("Imported")
    expect(m.sent[0]?.using).toEqual([
      "urn:ietf:params:jmap:core",
      "urn:ietf:params:jmap:calendars",
      "urn:ietf:params:jmap:calendars:parse",
    ])
    expect(m.sent[0]?.methodCalls[0]).toEqual(["CalendarEvent/parse", { accountId: "a1", blobIds: ["b1"] }, "c1"])
  })

  test("invalid options are a ResultErr with the op name", async () => {
    const m = mockMethodResponse("CalendarEvent/get", {})
    mock = m.mock
    const r = await calendarEventGet({ config: { baseUrl: "" } })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("calendarEventGet")
    expect(m.sent).toHaveLength(0)
  })
})
