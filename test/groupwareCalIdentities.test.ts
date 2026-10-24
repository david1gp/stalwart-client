import { afterEach, describe, expect, test } from "bun:test"
import { stalwartClientConfig } from "../src/client/stalwartClientConfig.js"
import type { JmapSession } from "../src/jmap/jmapSession.js"
import { participantIdentityChanges } from "../src/participantIdentities/participantIdentityChanges.js"
import { participantIdentityGet } from "../src/participantIdentities/participantIdentityGet.js"
import { participantIdentitySet } from "../src/participantIdentities/participantIdentitySet.js"
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
  const mock = fetchMockCreate((request) => {
    if (new URL(request.url).pathname === "/jmap/session") return fetchMockJson(groupwareSessionCreate())
    sent.push(JSON.parse(String(request.body)) as SentCall)
    return fetchMockJson({ methodResponses: [[name, args, "c1"]], sessionState: "1" })
  })
  return { mock, sent }
}

describe("groupwareCal participant identity ops", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("participantIdentityGet sends ids with the calendars capability", async () => {
    const m = mockMethodResponse("ParticipantIdentity/get", {
      list: [{ id: "i1", name: "Alice", calendarAddress: "mailto:alice@example.test" }],
      notFound: [],
    })
    mock = m.mock
    const r = await participantIdentityGet({ config: config.data, accountId: "a1", ids: ["i1"] })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.list[0]?.calendarAddress).toBe("mailto:alice@example.test")
    expect(m.sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:ietf:params:jmap:calendars"])
    expect(m.sent[0]?.methodCalls[0]).toEqual(["ParticipantIdentity/get", { accountId: "a1", ids: ["i1"] }, "c1"])
  })

  test("participantIdentityChanges sends sinceState", async () => {
    const m = mockMethodResponse("ParticipantIdentity/changes", {
      oldState: "s0",
      newState: "s1",
      hasMoreChanges: false,
      created: [],
      updated: [],
      destroyed: [],
    })
    mock = m.mock
    const r = await participantIdentityChanges({ config: config.data, accountId: "a1", sinceState: "s0" })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.methodCalls[0]).toEqual([
      "ParticipantIdentity/changes",
      { accountId: "a1", sinceState: "s0" },
      "c1",
    ])
  })

  test("participantIdentitySet sends create and the set-only argument", async () => {
    const m = mockMethodResponse("ParticipantIdentity/set", { created: { k1: { id: "i9" } } })
    mock = m.mock
    const r = await participantIdentitySet({
      config: config.data,
      accountId: "a1",
      create: { k1: { name: "Conf Room", calendarAddress: "mailto:room@example.test" } },
      onSuccessSetIsDefault: "#k1",
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.created?.k1?.id).toBe("i9")
    expect(m.sent[0]?.methodCalls[0]).toEqual([
      "ParticipantIdentity/set",
      {
        accountId: "a1",
        create: { k1: { name: "Conf Room", calendarAddress: "mailto:room@example.test" } },
        onSuccessSetIsDefault: "#k1",
      },
      "c1",
    ])
  })

  test("participantIdentitySet turns a notCreated entry into a ResultErr", async () => {
    const m = mockMethodResponse("ParticipantIdentity/set", {
      notCreated: { k1: { type: "invalidProperties", description: "bad address" } },
    })
    mock = m.mock
    const r = await participantIdentitySet({ config: config.data, accountId: "a1", create: { k1: {} } })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("participantIdentitySet")
  })

  test("invalid options are a ResultErr with the op name", async () => {
    const m = mockMethodResponse("ParticipantIdentity/get", {})
    mock = m.mock
    const r = await participantIdentityGet({ config: { baseUrl: "" } })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("participantIdentityGet")
    expect(m.sent).toHaveLength(0)
  })
})
