import { afterEach, describe, expect, test } from "bun:test"
import { stalwartClientConfig } from "../src/client/stalwartClientConfig.js"
import { emailChanges } from "../src/emails/emailChanges.js"
import { emailCopy } from "../src/emails/emailCopy.js"
import { emailGet } from "../src/emails/emailGet.js"
import { emailHeaderProperty } from "../src/emails/emailHeaderProperty.js"
import { emailImport } from "../src/emails/emailImport.js"
import { emailImportRaw } from "../src/emails/emailImportRaw.js"
import { emailParse } from "../src/emails/emailParse.js"
import { emailQuery } from "../src/emails/emailQuery.js"
import { emailQueryChanges } from "../src/emails/emailQueryChanges.js"
import { emailSend } from "../src/emails/emailSend.js"
import { emailSet } from "../src/emails/emailSet.js"
import { emailSubmissionChanges } from "../src/emailSubmissions/emailSubmissionChanges.js"
import { emailSubmissionGet } from "../src/emailSubmissions/emailSubmissionGet.js"
import { emailSubmissionQuery } from "../src/emailSubmissions/emailSubmissionQuery.js"
import { emailSubmissionQueryChanges } from "../src/emailSubmissions/emailSubmissionQueryChanges.js"
import { emailSubmissionSet } from "../src/emailSubmissions/emailSubmissionSet.js"
import { identityChanges } from "../src/identities/identityChanges.js"
import { identityGet } from "../src/identities/identityGet.js"
import { identitySet } from "../src/identities/identitySet.js"
import { mailAccountIdResolve } from "../src/mailboxes/mailAccountIdResolve.js"
import { mailboxByRole } from "../src/mailboxes/mailboxByRole.js"
import { mailboxChanges } from "../src/mailboxes/mailboxChanges.js"
import { mailboxGet } from "../src/mailboxes/mailboxGet.js"
import { mailboxQuery } from "../src/mailboxes/mailboxQuery.js"
import { mailboxQueryChanges } from "../src/mailboxes/mailboxQueryChanges.js"
import { mailboxSet } from "../src/mailboxes/mailboxSet.js"
import { searchSnippetGet } from "../src/searchSnippets/searchSnippetGet.js"
import { threadChanges } from "../src/threads/threadChanges.js"
import { threadGet } from "../src/threads/threadGet.js"
import { vacationResponseGet } from "../src/vacationResponses/vacationResponseGet.js"
import { vacationResponseSet } from "../src/vacationResponses/vacationResponseSet.js"
import { fetchMockCreate, fetchMockJson } from "./fetchMock.js"
import { jmapTestSessionCreate } from "./jmapTestSession.js"

const config = stalwartClientConfig({
  baseUrl: "https://mail.example.com",
  username: "alice",
  password: "pw",
  accountId: "a1",
})
if (!config.success) throw new Error("fixture config invalid")

const configNoAccount = stalwartClientConfig({ baseUrl: "https://mail.example.com", username: "alice", password: "pw" })
if (!configNoAccount.success) throw new Error("fixture config invalid")

type SentCall = { using: string[]; methodCalls: [string, Record<string, unknown>, string][] }

/** Route mocked method calls by method name; always serves the session fixture. */
function mailMockCreate(routes: Record<string, Record<string, unknown>>, upload?: Record<string, unknown>) {
  const sent: SentCall[] = []
  const requests: string[] = []
  const mock = fetchMockCreate((request) => {
    const url = new URL(request.url)
    requests.push(`${request.method} ${url.pathname}`)
    if (url.pathname === "/jmap/session") return fetchMockJson(jmapTestSessionCreate())
    if (url.pathname.startsWith("/jmap/upload/") && upload !== undefined) return fetchMockJson(upload)
    const body = JSON.parse(String(request.body)) as SentCall
    sent.push(body)
    const [methodName] = body.methodCalls[0] ?? []
    const payload = routes[String(methodName)] ?? {}
    const callId = body.methodCalls[0]?.[2] ?? "c1"
    if (Array.isArray(body.methodCalls) && body.methodCalls.length > 1) {
      return fetchMockJson({
        methodResponses: body.methodCalls.map(([name, , id]) => [name, routes[name] ?? {}, id]),
        sessionState: "1",
      })
    }
    return fetchMockJson({ methodResponses: [[methodName, payload, callId]], sessionState: "1" })
  })
  return { mock, sent, requests }
}

describe("mailAccountIdResolve prefers explicit, config, then session primary", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("explicit accountId wins without any fetch", async () => {
    const m = mailMockCreate({})
    mock = m.mock
    const r = await mailAccountIdResolve({
      config: config.data,
      accountId: "z9",
      capability: "urn:ietf:params:jmap:mail",
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.accountId).toBe("z9")
    expect(m.requests).toHaveLength(0)
  })

  test("config accountId is used without any fetch", async () => {
    const m = mailMockCreate({})
    mock = m.mock
    const r = await mailAccountIdResolve({ config: config.data, capability: "urn:ietf:params:jmap:mail" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.accountId).toBe("a1")
    expect(m.requests).toHaveLength(0)
  })

  test("session primary account fills in when neither is given", async () => {
    const m = mailMockCreate({})
    mock = m.mock
    const r = await mailAccountIdResolve({
      config: configNoAccount.data,
      capability: "urn:ietf:params:jmap:mail",
    })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.accountId).toBe("a1")
      expect(r.data.session?.username).toBe("admin@example.com")
    }
  })

  test("unknown capability without accountId is a ResultErr from the core resolver", async () => {
    const m = mailMockCreate({})
    mock = m.mock
    const r = await mailAccountIdResolve({ config: configNoAccount.data, capability: "urn:ietf:params:jmap:nope" })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("jmapAccountIdForCapability")
  })
})

describe("mailboxGet fetches mailboxes", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("sends Mailbox/get with core+mail using and the accountId", async () => {
    const m = mailMockCreate({
      "Mailbox/get": { accountId: "a1", state: "s1", list: [{ id: "a", name: "Inbox" }], notFound: [] },
    })
    mock = m.mock
    const r = await mailboxGet({ config: config.data, properties: ["id", "name"] })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.list[0]).toEqual({ id: "a", name: "Inbox" })
    expect(m.sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:ietf:params:jmap:mail"])
    expect(m.sent[0]?.methodCalls[0]).toEqual(["Mailbox/get", { accountId: "a1", properties: ["id", "name"] }, "c1"])
  })

  test("resolves the accountId from the session when omitted", async () => {
    const m = mailMockCreate({ "Mailbox/get": { list: [], notFound: [] } })
    mock = m.mock
    const r = await mailboxGet({ config: configNoAccount.data })
    expect(r.success).toBe(true)
    const args = m.sent[0]?.methodCalls[0]?.[1] as Record<string, unknown>
    expect(args.accountId).toBe("a1")
    expect(args.ids).toBeUndefined()
  })

  test("invalid options are a ResultErr with op", async () => {
    const m = mailMockCreate({})
    mock = m.mock
    const r = await mailboxGet({ config: { baseUrl: "" } })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("mailboxGet")
    expect(m.sent).toHaveLength(0)
  })
})

describe("mailboxQuery lists mailbox ids", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("passes filter, sort, limit and tree flags through", async () => {
    const m = mailMockCreate({ "Mailbox/query": { accountId: "a1", queryState: "q", ids: ["a"], position: 0 } })
    mock = m.mock
    const r = await mailboxQuery({
      config: config.data,
      filter: { name: "Inbox" },
      sort: [{ property: "name" }],
      limit: 10,
      sortAsTree: true,
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.ids).toEqual(["a"])
    expect(m.sent[0]?.methodCalls[0]).toEqual([
      "Mailbox/query",
      {
        accountId: "a1",
        filter: { name: "Inbox" },
        sort: [{ property: "name" }],
        limit: 10,
        sortAsTree: true,
      },
      "c1",
    ])
  })
})

describe("mailboxChanges and mailboxQueryChanges track state", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("Mailbox/changes sends sinceState", async () => {
    const m = mailMockCreate({
      "Mailbox/changes": {
        accountId: "a1",
        oldState: "s1",
        newState: "s2",
        hasMoreChanges: false,
        created: ["b"],
        updated: [],
        destroyed: [],
      },
    })
    mock = m.mock
    const r = await mailboxChanges({ config: config.data, sinceState: "s1" })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.created).toEqual(["b"])
      expect(r.data.newState).toBe("s2")
    }
    expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({ accountId: "a1", sinceState: "s1" })
  })

  test("Mailbox/queryChanges sends sinceQueryState", async () => {
    const m = mailMockCreate({
      "Mailbox/queryChanges": {
        accountId: "a1",
        oldQueryState: "q1",
        newQueryState: "q2",
        removed: [],
        added: [{ id: "b", index: 0 }],
      },
    })
    mock = m.mock
    const r = await mailboxQueryChanges({ config: config.data, sinceQueryState: "q1" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.added).toEqual([{ id: "b", index: 0 }])
    expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({ accountId: "a1", sinceQueryState: "q1" })
  })
})

describe("mailboxSet creates and destroys mailboxes", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("creates a mailbox and returns its id", async () => {
    const m = mailMockCreate({ "Mailbox/set": { accountId: "a1", created: { m1: { id: "b" } } } })
    mock = m.mock
    const r = await mailboxSet({ config: config.data, create: { m1: { name: "Archive 2024" } } })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.created?.m1?.id).toBe("b")
    expect(m.sent[0]?.methodCalls[0]).toEqual([
      "Mailbox/set",
      { accountId: "a1", create: { m1: { name: "Archive 2024" } } },
      "c1",
    ])
  })

  test("a notDestroyed entry becomes a ResultErr carrying the set response", async () => {
    const m = mailMockCreate({
      "Mailbox/set": { notDestroyed: { b: { type: "mailboxHasChild", description: "has a child" } } },
    })
    mock = m.mock
    const r = await mailboxSet({ config: config.data, destroy: ["b"] })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.errorMessage).toContain("mailboxHasChild")
      expect(JSON.parse(r.errorData ?? "{}").notDestroyed.b.type).toBe("mailboxHasChild")
    }
  })

  test("requires at least one of create, update or destroy", async () => {
    const m = mailMockCreate({})
    mock = m.mock
    const r = await mailboxSet({ config: config.data })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("mailboxSet")
    expect(m.sent).toHaveLength(0)
  })
})

describe("mailboxByRole finds mailboxes by special-use role", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("returns the id of the mailbox with the requested role", async () => {
    const m = mailMockCreate({
      "Mailbox/get": {
        list: [
          { id: "a", role: "inbox" },
          { id: "e", role: "sent" },
        ],
        notFound: [],
      },
    })
    mock = m.mock
    const r = await mailboxByRole({ config: config.data, role: "sent" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toBe("e")
  })

  test("no mailbox with the role is a ResultErr", async () => {
    const m = mailMockCreate({ "Mailbox/get": { list: [{ id: "a", role: "inbox" }], notFound: [] } })
    mock = m.mock
    const r = await mailboxByRole({ config: config.data, role: "archive" })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.errorMessage).toContain("archive")
  })
})

describe("threadGet and threadChanges read threads", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("Thread/get sends the mail capability and returns email ids", async () => {
    const m = mailMockCreate({ "Thread/get": { list: [{ id: "t1", emailIds: ["m1", "m2"] }], notFound: [] } })
    mock = m.mock
    const r = await threadGet({ config: config.data, ids: ["t1"] })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.list[0]?.emailIds).toEqual(["m1", "m2"])
    expect(m.sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:ietf:params:jmap:mail"])
    expect(m.sent[0]?.methodCalls[0]?.[0]).toBe("Thread/get")
  })

  test("Thread/changes sends sinceState", async () => {
    const m = mailMockCreate({
      "Thread/changes": {
        accountId: "a1",
        oldState: "s1",
        newState: "s2",
        hasMoreChanges: false,
        created: [],
        updated: ["t1"],
        destroyed: [],
      },
    })
    mock = m.mock
    const r = await threadChanges({ config: config.data, sinceState: "s1" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.updated).toEqual(["t1"])
  })
})

describe("emailGet fetches emails with body values", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("passes ids, properties and body fetch flags through", async () => {
    const m = mailMockCreate({
      "Email/get": {
        list: [{ id: "m1", subject: "Hi", bodyValues: { t1: { value: "hello" } } }],
        notFound: [],
      },
    })
    mock = m.mock
    const r = await emailGet({
      config: config.data,
      ids: ["m1"],
      properties: ["id", "subject"],
      bodyProperties: ["textBody"],
      fetchTextBodyValues: true,
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.list[0]?.subject).toBe("Hi")
    expect(m.sent[0]?.methodCalls[0]).toEqual([
      "Email/get",
      {
        accountId: "a1",
        ids: ["m1"],
        properties: ["id", "subject"],
        bodyProperties: ["textBody"],
        fetchTextBodyValues: true,
      },
      "c1",
    ])
  })

  test("invalid options are a ResultErr with op", async () => {
    const m = mailMockCreate({})
    mock = m.mock
    const r = await emailGet({ config: { baseUrl: "" } })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("emailGet")
  })
})

describe("emailQuery, emailChanges and emailQueryChanges track mail", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("Email/query sends filter and collapseThreads", async () => {
    const m = mailMockCreate({
      "Email/query": { accountId: "a1", queryState: "q1", canCalculateChanges: true, position: 0, ids: ["m1"] },
    })
    mock = m.mock
    const r = await emailQuery({ config: config.data, filter: { inMailbox: "a" }, collapseThreads: true, limit: 5 })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.ids).toEqual(["m1"])
    expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({
      accountId: "a1",
      filter: { inMailbox: "a" },
      collapseThreads: true,
      limit: 5,
    })
  })

  test("Email/changes sends sinceState", async () => {
    const m = mailMockCreate({
      "Email/changes": {
        accountId: "a1",
        oldState: "s1",
        newState: "s2",
        hasMoreChanges: false,
        created: ["m1"],
        updated: [],
        destroyed: [],
      },
    })
    mock = m.mock
    const r = await emailChanges({ config: config.data, sinceState: "s1" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.created).toEqual(["m1"])
  })

  test("Email/queryChanges sends sinceQueryState", async () => {
    const m = mailMockCreate({
      "Email/queryChanges": {
        accountId: "a1",
        oldQueryState: "q1",
        newQueryState: "q2",
        removed: [],
        added: [{ id: "m1", index: 0 }],
      },
    })
    mock = m.mock
    const r = await emailQueryChanges({ config: config.data, sinceQueryState: "q1" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.newQueryState).toBe("q2")
  })
})

describe("emailSet creates mail with set-error checking", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("creates an email and returns its id", async () => {
    const m = mailMockCreate({ "Email/set": { accountId: "a1", created: { e1: { id: "m1" } } } })
    mock = m.mock
    const r = await emailSet({ config: config.data, create: { e1: { mailboxIds: { d: true } } } })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.created?.e1?.id).toBe("m1")
  })

  test("a notCreated entry becomes a ResultErr carrying the set response", async () => {
    const m = mailMockCreate({
      "Email/set": { notCreated: { e1: { type: "invalidProperties", description: "bad mailbox" } } },
    })
    mock = m.mock
    const r = await emailSet({ config: config.data, create: { e1: { mailboxIds: { nope: true } } } })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.op).toBe("emailSet")
      expect(JSON.parse(r.errorData ?? "{}").notCreated.e1.type).toBe("invalidProperties")
    }
  })

  test("requires at least one of create, update or destroy", async () => {
    const m = mailMockCreate({})
    mock = m.mock
    const r = await emailSet({ config: config.data })
    expect(r.success).toBe(false)
    expect(m.sent).toHaveLength(0)
  })
})

describe("emailCopy duplicates mail between accounts", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("sends the Stalwart create map with both account ids", async () => {
    const m = mailMockCreate({
      "Email/copy": { fromAccountId: "a1", accountId: "a2", created: { c1: { id: "m2" } }, notCreated: {} },
    })
    mock = m.mock
    const r = await emailCopy({
      config: { ...config.data, accountId: "a2" },
      fromAccountId: "a1",
      create: { c1: { id: "m1", mailboxIds: { b: true } } },
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.created?.c1?.id).toBe("m2")
    expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({
      accountId: "a2",
      fromAccountId: "a1",
      create: { c1: { id: "m1", mailboxIds: { b: true } } },
    })
  })

  test("a notCreated entry becomes a ResultErr", async () => {
    const m = mailMockCreate({
      "Email/copy": { notCreated: { c1: { type: "invalidProperties", description: "no access" } } },
    })
    mock = m.mock
    const r = await emailCopy({ config: config.data, create: { c1: { id: "m1", mailboxIds: { b: true } } } })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.errorMessage).toContain("invalidProperties")
  })

  test("missing create is an invalid-options ResultErr", async () => {
    const m = mailMockCreate({})
    mock = m.mock
    const r = await emailCopy({ config: config.data, create: undefined as never })
    expect(r.success).toBe(false)
    expect(m.sent).toHaveLength(0)
  })
})

describe("emailImport and emailParse move blobs into mail", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("Email/import sends the emails map and returns the created id", async () => {
    const m = mailMockCreate({ "Email/import": { accountId: "a1", created: { m1: { id: "m9" } } } })
    mock = m.mock
    const r = await emailImport({
      config: config.data,
      emails: { m1: { blobId: "b1", mailboxIds: { a: true } } },
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.created?.m1?.id).toBe("m9")
    expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({
      accountId: "a1",
      emails: { m1: { blobId: "b1", mailboxIds: { a: true } } },
    })
  })

  test("Email/parse returns parsed mail keyed by blob id", async () => {
    const m = mailMockCreate({
      "Email/parse": { accountId: "a1", parsed: { b1: { id: "m9", subject: "Parsed" } }, notParsable: [] },
    })
    mock = m.mock
    const r = await emailParse({ config: config.data, blobIds: ["b1"] })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.parsed?.b1?.subject).toBe("Parsed")
    expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({ accountId: "a1", blobIds: ["b1"] })
  })
})

describe("emailSend drafts, submits and moves to Sent in one batch", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("resolves identity and mailboxes, then sends one batched request", async () => {
    const m = mailMockCreate({
      "Identity/get": { list: [{ id: "i1", email: "alice@example.com" }], notFound: [] },
      "Mailbox/get": {
        list: [
          { id: "dr", role: "drafts" },
          { id: "sn", role: "sent" },
        ],
        notFound: [],
      },
      "Email/set": { accountId: "a1", created: { e1: { id: "m1", threadId: "t1" } } },
      "EmailSubmission/set": { accountId: "a1", created: { s1: { id: "sub1" } } },
    })
    mock = m.mock
    const r = await emailSend({
      config: config.data,
      from: "alice@example.com",
      to: ["bob@example.com"],
      subject: "Hi Bob",
      text: "Hello via JMAP",
    })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.email.created?.e1?.id).toBe("m1")
      expect(r.data.submission.created?.s1?.id).toBe("sub1")
    }
    const batch = m.sent[m.sent.length - 1]
    expect(batch?.using).toEqual([
      "urn:ietf:params:jmap:core",
      "urn:ietf:params:jmap:mail",
      "urn:ietf:params:jmap:submission",
    ])
    expect(batch?.methodCalls.map(([name]) => name)).toEqual(["Email/set", "EmailSubmission/set"])
    const emailArgs = batch?.methodCalls[0]?.[1] as Record<string, unknown>
    expect(emailArgs.create).toEqual({
      e1: {
        mailboxIds: { dr: true },
        from: [{ email: "alice@example.com" }],
        to: [{ email: "bob@example.com" }],
        subject: "Hi Bob",
        textBody: [{ partId: "t1", type: "text/plain" }],
        bodyValues: { t1: { value: "Hello via JMAP" } },
      },
    })
    const submissionArgs = batch?.methodCalls[1]?.[1] as Record<string, unknown>
    expect(submissionArgs.create).toEqual({
      s1: {
        emailId: "#e1",
        envelope: { mailFrom: { email: "alice@example.com" }, rcptTo: [{ email: "bob@example.com" }] },
        identityId: "i1",
      },
    })
    expect(submissionArgs.onSuccessUpdateEmail).toEqual({
      "#s1": { "mailboxIds/sn": true, "mailboxIds/dr": null, "keywords/$draft": null },
    })
  })

  test("needs at least one of text or html", async () => {
    const m = mailMockCreate({})
    mock = m.mock
    const r = await emailSend({ config: config.data, from: "alice@example.com", to: ["bob@example.com"] })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("emailSend")
    expect(m.sent).toHaveLength(0)
  })

  test("a method-level batch error becomes a ResultErr", async () => {
    const errorMock = fetchMockCreate((request) => {
      if (new URL(request.url).pathname === "/jmap/session") return fetchMockJson(jmapTestSessionCreate())
      const body = JSON.parse(String(request.body)) as SentCall
      if (body.methodCalls.length > 1) {
        return fetchMockJson({
          methodResponses: [
            ["Email/set", { accountId: "a1", created: { e1: { id: "m1" } } }, "m0"],
            ["error", { type: "invalidProperties", description: "Identity not found." }, "m1"],
          ],
          sessionState: "1",
        })
      }
      const [methodName] = body.methodCalls[0] ?? []
      const payloads: Record<string, Record<string, unknown>> = {
        "Identity/get": { list: [{ id: "nope", email: "alice@example.com" }], notFound: [] },
        "Mailbox/get": {
          list: [
            { id: "dr", role: "drafts" },
            { id: "sn", role: "sent" },
          ],
          notFound: [],
        },
      }
      return fetchMockJson({
        methodResponses: [[methodName, payloads[String(methodName)] ?? {}, "c1"]],
        sessionState: "1",
      })
    })
    mock = errorMock
    const r = await emailSend({
      config: config.data,
      from: "alice@example.com",
      to: ["bob@example.com"],
      text: "hi",
      identityId: "nope",
    })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.errorMessage).toContain("method-level error")
  })
})

describe("emailImportRaw uploads bytes then imports", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("uploads as message/rfc822 and imports the returned blob", async () => {
    const m = mailMockCreate(
      { "Email/import": { accountId: "a1", created: { m1: { id: "m9" } } } },
      { accountId: "a1", blobId: "blob1", type: "message/rfc822", size: 120 },
    )
    mock = m.mock
    const r = await emailImportRaw({
      config: config.data,
      mailboxIds: ["a"],
      raw: "From: alice@example.com\r\nSubject: Raw\r\n\r\nbody",
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.created?.m1?.id).toBe("m9")
    expect(m.requests.some((line) => line.startsWith("POST /jmap/upload/"))).toBe(true)
    const importCall = m.sent[m.sent.length - 1]?.methodCalls[0]
    expect(importCall?.[0]).toBe("Email/import")
    expect(importCall?.[1]).toEqual({
      accountId: "a1",
      emails: { m1: { blobId: "blob1", mailboxIds: { a: true } } },
    })
  })
})

describe("searchSnippetGet returns snippets for email ids", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("sends SearchSnippet/get with email ids", async () => {
    const m = mailMockCreate({
      "SearchSnippet/get": { list: [{ emailId: "m1", subject: "Hi", preview: "Hello…" }], notFound: [] },
    })
    mock = m.mock
    const r = await searchSnippetGet({ config: config.data, emailIds: ["m1"] })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.list[0]?.preview).toBe("Hello…")
    expect(m.sent[0]?.methodCalls[0]).toEqual(["SearchSnippet/get", { accountId: "a1", emailIds: ["m1"] }, "c1"])
  })
})

describe("identityGet, identityChanges and identitySet manage sending identities", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("Identity/get uses the submission capability", async () => {
    const m = mailMockCreate({
      "Identity/get": { list: [{ id: "i1", email: "alice@example.com" }], notFound: [] },
    })
    mock = m.mock
    const r = await identityGet({ config: config.data })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.list[0]?.email).toBe("alice@example.com")
    expect(m.sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:ietf:params:jmap:submission"])
  })

  test("Identity/changes sends sinceState", async () => {
    const m = mailMockCreate({
      "Identity/changes": {
        accountId: "a1",
        oldState: "s1",
        newState: "s2",
        hasMoreChanges: false,
        created: ["i2"],
        updated: [],
        destroyed: [],
      },
    })
    mock = m.mock
    const r = await identityChanges({ config: config.data, sinceState: "s1" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.created).toEqual(["i2"])
  })

  test("Identity/set creates an identity", async () => {
    const m = mailMockCreate({ "Identity/set": { accountId: "a1", created: { i1: { id: "i9" } } } })
    mock = m.mock
    const r = await identitySet({
      config: config.data,
      create: { i1: { name: "Work", email: "alice@work.example" } },
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.created?.i1?.id).toBe("i9")
  })

  test("Identity/set surfaces notUpdated as a ResultErr", async () => {
    const m = mailMockCreate({
      "Identity/set": { notUpdated: { i1: { type: "notFound", description: "missing" } } },
    })
    mock = m.mock
    const r = await identitySet({ config: config.data, update: { i1: { name: "Renamed" } } })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.errorMessage).toContain("notFound")
  })
})

describe("emailSubmission ops track and submit mail", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("EmailSubmission/get uses the submission capability", async () => {
    const m = mailMockCreate({
      "EmailSubmission/get": { list: [{ id: "sub1", emailId: "m1", undoStatus: "final" }], notFound: [] },
    })
    mock = m.mock
    const r = await emailSubmissionGet({ config: config.data })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.list[0]?.undoStatus).toBe("final")
    expect(m.sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:ietf:params:jmap:submission"])
  })

  test("EmailSubmission/query sends filter and limit", async () => {
    const m = mailMockCreate({
      "EmailSubmission/query": { accountId: "a1", queryState: "q", ids: ["sub1"], position: 0 },
    })
    mock = m.mock
    const r = await emailSubmissionQuery({ config: config.data, limit: 10 })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.ids).toEqual(["sub1"])
  })

  test("EmailSubmission/changes sends sinceState", async () => {
    const m = mailMockCreate({
      "EmailSubmission/changes": {
        accountId: "a1",
        oldState: "s1",
        newState: "s2",
        hasMoreChanges: false,
        created: ["sub1"],
        updated: [],
        destroyed: [],
      },
    })
    mock = m.mock
    const r = await emailSubmissionChanges({ config: config.data, sinceState: "s1" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.created).toEqual(["sub1"])
  })

  test("EmailSubmission/queryChanges sends sinceQueryState", async () => {
    const m = mailMockCreate({
      "EmailSubmission/queryChanges": {
        accountId: "a1",
        oldQueryState: "q1",
        newQueryState: "q2",
        removed: [],
        added: [{ id: "sub1", index: 0 }],
      },
    })
    mock = m.mock
    const r = await emailSubmissionQueryChanges({ config: config.data, sinceQueryState: "q1" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.added).toEqual([{ id: "sub1", index: 0 }])
  })

  test("EmailSubmission/set sends onSuccessUpdateEmail through", async () => {
    const m = mailMockCreate({ "EmailSubmission/set": { accountId: "a1", created: { s1: { id: "sub1" } } } })
    mock = m.mock
    const r = await emailSubmissionSet({
      config: config.data,
      create: {
        s1: { emailId: "m1", envelope: { mailFrom: { email: "a@x" }, rcptTo: [{ email: "b@x" }] }, identityId: "i1" },
      },
      onSuccessUpdateEmail: { "#s1": { "mailboxIds/sn": true } },
    })
    expect(r.success).toBe(true)
    const args = m.sent[0]?.methodCalls[0]?.[1] as Record<string, unknown>
    expect(args.onSuccessUpdateEmail).toEqual({ "#s1": { "mailboxIds/sn": true } })
  })

  test("EmailSubmission/set surfaces notCreated as a ResultErr", async () => {
    const m = mailMockCreate({
      "EmailSubmission/set": { notCreated: { s1: { type: "invalidProperties", description: "bad identity" } } },
    })
    mock = m.mock
    const r = await emailSubmissionSet({ config: config.data, create: { s1: { emailId: "m1" } } })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.errorMessage).toContain("invalidProperties")
  })
})

describe("vacationResponseGet and vacationResponseSet manage auto-replies", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("VacationResponse/get uses the vacationresponse capability", async () => {
    const m = mailMockCreate({
      "VacationResponse/get": { list: [{ id: "singleton", isEnabled: false }], notFound: [] },
    })
    mock = m.mock
    const r = await vacationResponseGet({ config: config.data })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.list[0]?.isEnabled).toBe(false)
    expect(m.sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:ietf:params:jmap:vacationresponse"])
    expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({ accountId: "a1" })
  })

  test("VacationResponse/set updates the singleton", async () => {
    const m = mailMockCreate({ "VacationResponse/set": { accountId: "a1", updated: { singleton: null } } })
    mock = m.mock
    const r = await vacationResponseSet({
      config: config.data,
      update: { singleton: { isEnabled: true, subject: "Away", textBody: "Back soon" } },
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.updated?.singleton).toBeNull()
  })

  test("VacationResponse/set without an update map is a ResultErr", async () => {
    const m = mailMockCreate({})
    mock = m.mock
    const r = await vacationResponseSet({ config: config.data, update: undefined })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("vacationResponseSet")
    expect(m.sent).toHaveLength(0)
  })
})

describe("email header property selectors", () => {
  test("emailHeaderProperty builds raw and typed v1 header selectors", () => {
    expect(emailHeaderProperty("Subject")).toBe("header:Subject")
    expect(emailHeaderProperty("Subject", "asText")).toBe("header:Subject:asText")
    expect(emailHeaderProperty("From", "asAddresses")).toBe("header:From:asAddresses")
    expect(emailHeaderProperty("References", "asMessageIds")).toBe("header:References:asMessageIds")
    expect(emailHeaderProperty("Date", "asDate")).toBe("header:Date:asDate")
  })
})
