import { afterEach, describe, expect, test } from "bun:test"
import { stalwartClientConfig } from "../src/client/stalwartClientConfig.js"
import type { JmapSession } from "../src/jmap/jmapSession.js"
import type { Mdn } from "../src/mdn/Mdn.js"
import { mdnParse } from "../src/mdn/mdnParse.js"
import { mdnSend } from "../src/mdn/mdnSend.js"
import { fetchMockCreate, fetchMockJson } from "./fetchMock.js"
import { jmapTestSessionCreate } from "./jmapTestSession.js"

const config = stalwartClientConfig({
  baseUrl: "https://mail.example.com",
  username: "alice",
  password: "pw",
  accountId: "a1",
})
if (!config.success) throw new Error("fixture config invalid")

const configNoAccount = stalwartClientConfig({
  baseUrl: "https://mail.example.com",
  username: "alice",
  password: "pw",
})
if (!configNoAccount.success) throw new Error("fixture config invalid")

type SentCall = { using: string[]; methodCalls: [string, Record<string, unknown>, string][] }

/** Route mocked method calls by method name; serves the given session fixture. */
function mdnMockCreate(
  routes: Record<string, Record<string, unknown>>,
  session: JmapSession = jmapTestSessionCreate(),
) {
  const sent: SentCall[] = []
  const mock = fetchMockCreate((request) => {
    const url = new URL(request.url)
    if (url.pathname === "/jmap/session") return fetchMockJson(session)
    const body = JSON.parse(String(request.body)) as SentCall
    sent.push(body)
    const [methodName] = body.methodCalls[0] ?? []
    const payload = routes[String(methodName)] ?? {}
    const callId = body.methodCalls[0]?.[2] ?? "c1"
    return fetchMockJson({ methodResponses: [[methodName, payload, callId]], sessionState: "1" })
  })
  return { mock, sent }
}

const mdnBody: Mdn = {
  forEmailId: "e1",
  disposition: { actionMode: "manual-action", sendingMode: "mdn-sent-manually", type: "displayed" },
}

describe("mdnSend sends disposition notifications", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("MDN/send uses core+mdn+mail and returns sent MDNs", async () => {
    const m = mdnMockCreate({
      "MDN/send": { accountId: "a1", sent: { m1: mdnBody }, notSent: {} },
    })
    mock = m.mock
    const r = await mdnSend({ config: config.data, identityId: "i1", send: { m1: mdnBody } })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.sent?.m1?.forEmailId).toBe("e1")
    expect(m.sent[0]?.using).toEqual([
      "urn:ietf:params:jmap:core",
      "urn:ietf:params:jmap:mdn",
      "urn:ietf:params:jmap:mail",
    ])
    expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({ accountId: "a1", identityId: "i1", send: { m1: mdnBody } })
  })

  test("MDN/send forwards onSuccessUpdateEmail patches setting $mdnsent", async () => {
    const m = mdnMockCreate({ "MDN/send": { accountId: "a1", sent: { m1: mdnBody } } })
    mock = m.mock
    const onSuccessUpdateEmail = { "#m1": { "keywords/$mdnsent": true } }
    const r = await mdnSend({ config: config.data, identityId: "i1", send: { m1: mdnBody }, onSuccessUpdateEmail })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.methodCalls[0]?.[1]).toMatchObject({ onSuccessUpdateEmail })
  })

  test("MDN/send with a notSent entry is a ResultErr", async () => {
    const m = mdnMockCreate({
      "MDN/send": {
        accountId: "a1",
        notSent: { m1: { type: "mdnAlreadySent", description: "The $mdnsent keyword is already set." } },
      },
    })
    mock = m.mock
    const r = await mdnSend({ config: config.data, identityId: "i1", send: { m1: mdnBody } })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.op).toBe("mdnSend")
      expect(r.errorMessage).toContain("notSent: m1 (mdnAlreadySent")
    }
  })

  test("MDN/send with an empty send map is a ResultErr without any fetch", async () => {
    const m = mdnMockCreate({})
    mock = m.mock
    const r = await mdnSend({ config: config.data, identityId: "i1", send: {} })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("mdnSend")
    expect(m.sent).toHaveLength(0)
  })

  test("MDN/send without identityId is a ResultErr without any fetch", async () => {
    const m = mdnMockCreate({})
    mock = m.mock
    const r = await mdnSend({ config: config.data, identityId: "", send: { m1: mdnBody } })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("mdnSend")
    expect(m.sent).toHaveLength(0)
  })

  test("MDN/send forwards server-tolerated disposition casing without client rejection", async () => {
    const m = mdnMockCreate({ "MDN/send": { accountId: "a1", sent: { m1: mdnBody } } })
    mock = m.mock
    const tolerated = {
      forEmailId: "e1",
      disposition: { actionMode: "MANUAL-ACTION", sendingMode: "Mdn-Sent-Manually", type: "Displayed" },
    } as unknown as Mdn
    const r = await mdnSend({ config: config.data, identityId: "i1", send: { m1: tolerated } })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.methodCalls[0]?.[1]).toMatchObject({ send: { m1: tolerated } })
  })

  test("MDN/send with a non-object send value is a ResultErr without any fetch", async () => {
    const m = mdnMockCreate({})
    mock = m.mock
    const r = await mdnSend({
      config: config.data,
      identityId: "i1",
      send: { m1: "not-an-object" as unknown as Mdn },
    })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("mdnSend")
    expect(m.sent).toHaveLength(0)
  })

  test("MDN/send prefers the mdn primary account over mail", async () => {
    const base = jmapTestSessionCreate()
    const session: JmapSession = {
      ...base,
      primaryAccounts: {
        ...base.primaryAccounts,
        "urn:ietf:params:jmap:mdn": "mdn1",
        "urn:ietf:params:jmap:mail": "mail1",
      },
    }
    const m = mdnMockCreate({ "MDN/send": { accountId: "mdn1", sent: { m1: mdnBody } } }, session)
    mock = m.mock
    const r = await mdnSend({ config: configNoAccount.data, identityId: "i1", send: { m1: mdnBody } })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.methodCalls[0]?.[1]).toMatchObject({ accountId: "mdn1" })
  })

  test("MDN/send falls back to the mail primary account when mdn is missing", async () => {
    const base = jmapTestSessionCreate()
    const session: JmapSession = {
      ...base,
      primaryAccounts: {
        "urn:ietf:params:jmap:core": "a1",
        "urn:ietf:params:jmap:mail": "mail1",
      },
    }
    const m = mdnMockCreate({ "MDN/send": { accountId: "mail1", sent: { m1: mdnBody } } }, session)
    mock = m.mock
    const r = await mdnSend({ config: configNoAccount.data, identityId: "i1", send: { m1: mdnBody } })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.methodCalls[0]?.[1]).toMatchObject({ accountId: "mail1" })
  })
})

describe("mdnParse parses uploaded MDN blobs", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("MDN/parse uses core+mdn and returns parsed, notParsable and notFound", async () => {
    const m = mdnMockCreate({
      "MDN/parse": { accountId: "a1", parsed: { b1: mdnBody }, notParsable: ["b2"], notFound: ["b3"] },
    })
    mock = m.mock
    const r = await mdnParse({ config: config.data, blobIds: ["b1", "b2", "b3"] })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.parsed?.b1?.forEmailId).toBe("e1")
      expect(r.data.notParsable).toEqual(["b2"])
      expect(r.data.notFound).toEqual(["b3"])
    }
    expect(m.sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:ietf:params:jmap:mdn"])
    expect(m.sent[0]?.methodCalls[0]?.[0]).toBe("MDN/parse")
    expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({ accountId: "a1", blobIds: ["b1", "b2", "b3"] })
  })

  test("MDN/parse prefers the mdn primary account over mail", async () => {
    const base = jmapTestSessionCreate()
    const session: JmapSession = {
      ...base,
      primaryAccounts: {
        ...base.primaryAccounts,
        "urn:ietf:params:jmap:mdn": "mdn1",
        "urn:ietf:params:jmap:mail": "mail1",
      },
    }
    const m = mdnMockCreate({ "MDN/parse": { accountId: "mdn1", parsed: { b1: mdnBody } } }, session)
    mock = m.mock
    const r = await mdnParse({ config: configNoAccount.data, blobIds: ["b1"] })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.methodCalls[0]?.[1]).toMatchObject({ accountId: "mdn1" })
  })

  test("MDN/parse falls back to the mail primary account when mdn is missing", async () => {
    const base = jmapTestSessionCreate()
    const session: JmapSession = {
      ...base,
      primaryAccounts: {
        "urn:ietf:params:jmap:core": "a1",
        "urn:ietf:params:jmap:mail": "mail1",
      },
    }
    const m = mdnMockCreate({ "MDN/parse": { accountId: "mail1", parsed: { b1: mdnBody } } }, session)
    mock = m.mock
    const r = await mdnParse({ config: configNoAccount.data, blobIds: ["b1"] })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.methodCalls[0]?.[1]).toMatchObject({ accountId: "mail1" })
  })

  test("MDN/parse preserves non-string notFound entries as unknown JSON", async () => {
    const m = mdnMockCreate({
      "MDN/parse": { accountId: "a1", parsed: { b1: mdnBody }, notParsable: ["b2"], notFound: [123] },
    })
    mock = m.mock
    const r = await mdnParse({ config: config.data, blobIds: ["b1", "b2"] })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.notFound).toEqual([123])
  })
})
