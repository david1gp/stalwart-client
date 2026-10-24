import { afterEach, describe, expect, test } from "bun:test"
import { addressBookAccountIdResolve } from "../src/addressBooks/addressBookAccountIdResolve.js"
import { blobAccountIdResolve } from "../src/blobs/blobAccountIdResolve.js"
import { blobCopy } from "../src/blobs/blobCopy.js"
import { blobDownload } from "../src/blobs/blobDownload.js"
import { blobGet } from "../src/blobs/blobGet.js"
import { blobHttpUpload } from "../src/blobs/blobHttpUpload.js"
import { blobLookup } from "../src/blobs/blobLookup.js"
import { blobUpload } from "../src/blobs/blobUpload.js"
import { stalwartClientConfig } from "../src/client/stalwartClientConfig.js"
import { pushSubscriptionGet } from "../src/pushSubscriptions/pushSubscriptionGet.js"
import { pushSubscriptionSet } from "../src/pushSubscriptions/pushSubscriptionSet.js"
import { quotaChanges } from "../src/quotas/quotaChanges.js"
import { quotaGet } from "../src/quotas/quotaGet.js"
import { quotaQuery } from "../src/quotas/quotaQuery.js"
import { quotaQueryChanges } from "../src/quotas/quotaQueryChanges.js"
import { sieveScriptAccountIdResolve } from "../src/sieveScripts/sieveScriptAccountIdResolve.js"
import { sieveScriptActivate } from "../src/sieveScripts/sieveScriptActivate.js"
import { sieveScriptGet } from "../src/sieveScripts/sieveScriptGet.js"
import { sieveScriptQuery } from "../src/sieveScripts/sieveScriptQuery.js"
import { sieveScriptSet } from "../src/sieveScripts/sieveScriptSet.js"
import { sieveScriptValidate } from "../src/sieveScripts/sieveScriptValidate.js"
import { fetchMockCreate, fetchMockJson } from "./fetchMock.js"
import { jmapTestSessionCreate } from "./jmapTestSession.js"

const config = stalwartClientConfig({ baseUrl: "https://mail.example.com", username: "admin", password: "pw" })
if (!config.success) throw new Error("fixture config invalid")

type SentCall = { using: string[]; methodCalls: [string, Record<string, unknown>, string][] }

/** Mock the session GET plus one JMAP POST; capture the POST body. */
function mockMethod(method: string, responseArgs: Record<string, unknown>) {
  const sent: SentCall[] = []
  const mock = fetchMockCreate((request) => {
    if (new URL(request.url).pathname === "/jmap/session") return fetchMockJson(jmapTestSessionCreate())
    sent.push(JSON.parse(String(request.body)) as SentCall)
    return fetchMockJson({ methodResponses: [[method, responseArgs, "c1"]], sessionState: "s1" })
  })
  return { mock, sent }
}

describe("sieveScript ops send the sieve capability and resolved accountId", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("sieveScriptGet fetches scripts by id", async () => {
    const m = mockMethod("SieveScript/get", { list: [{ id: "s1", name: "default", isActive: true }] })
    mock = m.mock
    const r = await sieveScriptGet({ config: config.data, accountId: "a1", ids: ["s1"] })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.list[0]?.name).toBe("default")
    expect(m.sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:ietf:params:jmap:sieve"])
    expect(m.sent[0]?.methodCalls[0]).toEqual(["SieveScript/get", { accountId: "a1", ids: ["s1"] }, "c1"])
  })

  test("sieveScriptSet creates a script and activates it", async () => {
    const m = mockMethod("SieveScript/set", { created: { c1: { id: "s2" } } })
    mock = m.mock
    const r = await sieveScriptSet({
      config: config.data,
      accountId: "a1",
      create: { c1: { name: "work", blobId: "b1" } },
      onSuccessActivateScript: "s2",
    })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.methodCalls[0]).toEqual([
      "SieveScript/set",
      { accountId: "a1", create: { c1: { name: "work", blobId: "b1" } }, onSuccessActivateScript: "s2" },
      "c1",
    ])
  })

  test("sieveScriptSet turns a notCreated entry into a ResultErr", async () => {
    const m = mockMethod("SieveScript/set", {
      notCreated: { c1: { type: "invalidScript", description: "line 1: unknown command" } },
    })
    mock = m.mock
    const r = await sieveScriptSet({ config: config.data, accountId: "a1", create: { c1: { name: "bad" } } })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.op).toBe("sieveScriptSet")
      expect(r.errorMessage).toContain("invalidScript")
      expect(JSON.parse(r.errorData ?? "{}").notCreated.c1.type).toBe("invalidScript")
    }
  })

  test("sieveScriptQuery lists script ids with filter", async () => {
    const m = mockMethod("SieveScript/query", { ids: ["s1"], queryState: "q1" })
    mock = m.mock
    const r = await sieveScriptQuery({ config: config.data, accountId: "a1", filter: { isActive: true }, limit: 10 })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.ids).toEqual(["s1"])
    expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({
      accountId: "a1",
      filter: { isActive: true },
      limit: 10,
    })
  })

  test("sieveScriptValidate returns the envelope with a null error for valid scripts", async () => {
    const m = mockMethod("SieveScript/validate", { accountId: "a1", error: null })
    mock = m.mock
    const r = await sieveScriptValidate({ config: config.data, accountId: "a1", blobId: "b1" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.error).toBeNull()
    expect(m.sent[0]?.methodCalls[0]).toEqual(["SieveScript/validate", { accountId: "a1", blobId: "b1" }, "c1"])
  })

  test("sieveScriptActivate sends only onSuccessActivateScript", async () => {
    const m = mockMethod("SieveScript/set", { newState: "st2" })
    mock = m.mock
    const r = await sieveScriptActivate({ config: config.data, accountId: "a1", id: "s1" })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:ietf:params:jmap:sieve"])
    expect(m.sent[0]?.methodCalls[0]).toEqual([
      "SieveScript/set",
      { accountId: "a1", onSuccessActivateScript: "s1" },
      "c1",
    ])
  })

  test("sieveScriptGet rejects invalid options without sending", async () => {
    const m = mockMethod("SieveScript/get", {})
    mock = m.mock
    const r = await sieveScriptGet({ config: { baseUrl: "" } })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("sieveScriptGet")
    expect(m.sent).toHaveLength(0)
  })
})

describe("blob method-form ops", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("blobGet requests inline data with the blob capability", async () => {
    const m = mockMethod("Blob/get", { list: [{ id: "b1", size: 5 }] })
    mock = m.mock
    const r = await blobGet({ config: config.data, accountId: "a1", ids: ["b1"] })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:ietf:params:jmap:blob"])
    expect(m.sent[0]?.methodCalls[0]).toEqual(["Blob/get", { accountId: "a1", ids: ["b1"] }, "c1"])
  })

  test("blobUpload sends inline data and returns created ids", async () => {
    const m = mockMethod("Blob/upload", { created: { u1: { id: "b9", size: 11 } } })
    mock = m.mock
    const r = await blobUpload({
      config: config.data,
      accountId: "a1",
      create: { u1: { data: [{ "data:asText": "hello world" }] } },
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.created?.u1?.id).toBe("b9")
    expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({
      accountId: "a1",
      create: { u1: { data: [{ "data:asText": "hello world" }] } },
    })
  })

  test("blobUpload turns a notCreated entry into a ResultErr", async () => {
    const m = mockMethod("Blob/upload", { notCreated: { u1: { type: "tooLarge" } } })
    mock = m.mock
    const r = await blobUpload({ config: config.data, accountId: "a1", create: { u1: {} } })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.errorMessage).toContain("tooLarge")
  })

  test("blobCopy maps old blob ids to new ones", async () => {
    const m = mockMethod("Blob/copy", { fromAccountId: "a1", accountId: "a1", copied: { b1: "b2" } })
    mock = m.mock
    const r = await blobCopy({ config: config.data, accountId: "a1", blobIds: ["b1"] })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.copied?.b1).toBe("b2")
    expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({ accountId: "a1", fromAccountId: "a1", blobIds: ["b1"] })
  })

  test("blobCopy turns notCopied into a ResultErr", async () => {
    const m = mockMethod("Blob/copy", { notCopied: { b9: { type: "notFound" } } })
    mock = m.mock
    const r = await blobCopy({ config: config.data, accountId: "a1", blobIds: ["b9"] })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.errorMessage).toContain("notFound")
  })

  test("blobLookup sends type names and ids", async () => {
    const m = mockMethod("Blob/lookup", { list: [{ id: "b1", matchedIds: {} }], notFound: [] })
    mock = m.mock
    const r = await blobLookup({ config: config.data, accountId: "a1", typeNames: ["Mailbox"], ids: ["b1"] })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.list[0]?.id).toBe("b1")
    expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({ accountId: "a1", typeNames: ["Mailbox"], ids: ["b1"] })
  })

  test("blobGet rejects invalid options without sending", async () => {
    const m = mockMethod("Blob/get", {})
    mock = m.mock
    const r = await blobGet({ config: { baseUrl: "" } })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("blobGet")
    expect(m.sent).toHaveLength(0)
  })
})

describe("blob HTTP transport ops", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("blobHttpUpload posts raw bytes to the session uploadUrl", async () => {
    mock = fetchMockCreate((request) => {
      const url = new URL(request.url)
      if (url.pathname === "/jmap/session") return fetchMockJson(jmapTestSessionCreate())
      expect(url.pathname).toBe("/jmap/upload/a1/")
      expect(request.method).toBe("POST")
      expect(request.headers["content-type"] ?? request.headers["Content-Type"]).toBe("text/plain")
      return fetchMockJson({ accountId: "a1", blobId: "b7", type: "text/plain", size: 5 })
    })
    const r = await blobHttpUpload({ config: config.data, accountId: "a1", data: "hello", contentType: "text/plain" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual({ accountId: "a1", blobId: "b7", type: "text/plain", size: 5 })
    mock?.restore()
    mock = undefined
  })

  test("blobDownload fetches raw bytes from the session downloadUrl", async () => {
    mock = fetchMockCreate((request) => {
      const url = new URL(request.url)
      if (url.pathname === "/jmap/session") return fetchMockJson(jmapTestSessionCreate())
      expect(request.method).toBe("GET")
      expect(url.pathname).toBe("/jmap/download/a1/b7/notes.txt")
      expect(request.headers.Authorization).toMatch(/^Basic /)
      return new Response("hello-bytes")
    })
    const r = await blobDownload({ config: config.data, accountId: "a1", blobId: "b7", name: "notes.txt" })
    expect(r.success).toBe(true)
    if (r.success) expect(new TextDecoder().decode(r.data)).toBe("hello-bytes")
    mock?.restore()
    mock = undefined
  })

  test("blobDownload rejects invalid options without sending", async () => {
    mock = fetchMockCreate(() => fetchMockJson({}))
    const r = await blobDownload({ config: { baseUrl: "" }, blobId: "b1" })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("blobDownload")
  })
})

describe("quota ops", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("quotaGet uses the quota capability", async () => {
    const m = mockMethod("Quota/get", { list: [] })
    mock = m.mock
    const r = await quotaGet({ config: config.data, accountId: "a1" })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:ietf:params:jmap:quota"])
    expect(m.sent[0]?.methodCalls[0]).toEqual(["Quota/get", { accountId: "a1" }, "c1"])
  })

  test("quotaChanges sends sinceState", async () => {
    const m = mockMethod("Quota/changes", { oldState: "s0", newState: "s1", created: [], updated: [], destroyed: [] })
    mock = m.mock
    const r = await quotaChanges({ config: config.data, accountId: "a1", sinceState: "s0" })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({ accountId: "a1", sinceState: "s0" })
  })

  test("quotaQuery passes filter and limit through", async () => {
    const m = mockMethod("Quota/query", { ids: [], queryState: "q1" })
    mock = m.mock
    const r = await quotaQuery({ config: config.data, accountId: "a1", limit: 5 })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({ accountId: "a1", limit: 5 })
  })

  test("quotaQueryChanges sends sinceQueryState", async () => {
    const m = mockMethod("Quota/queryChanges", { oldQueryState: "q0", newQueryState: "q1", removed: [], added: [] })
    mock = m.mock
    const r = await quotaQueryChanges({ config: config.data, accountId: "a1", sinceQueryState: "q0" })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({ accountId: "a1", sinceQueryState: "q0" })
  })

  test("quotaGet rejects invalid options without sending", async () => {
    const m = mockMethod("Quota/get", {})
    mock = m.mock
    const r = await quotaGet({ config: { baseUrl: "" } })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("quotaGet")
    expect(m.sent).toHaveLength(0)
  })
})

describe("pushSubscription ops", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("pushSubscriptionGet uses the core capability", async () => {
    const m = mockMethod("PushSubscription/get", { list: [] })
    mock = m.mock
    const r = await pushSubscriptionGet({ config: config.data, accountId: "a1" })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.using).toEqual(["urn:ietf:params:jmap:core"])
    expect(m.sent[0]?.methodCalls[0]).toEqual(["PushSubscription/get", { accountId: "a1" }, "c1"])
  })

  test("pushSubscriptionSet sends create and destroy", async () => {
    const m = mockMethod("PushSubscription/set", { created: { p1: { id: "p1" } }, destroyed: ["p0"] })
    mock = m.mock
    const r = await pushSubscriptionSet({
      config: config.data,
      accountId: "a1",
      create: { p1: { deviceClientId: "d1", url: "https://push.example.com/e", types: ["Mailbox"] } },
      destroy: ["p0"],
    })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({
      accountId: "a1",
      create: { p1: { deviceClientId: "d1", url: "https://push.example.com/e", types: ["Mailbox"] } },
      destroy: ["p0"],
    })
  })

  test("pushSubscriptionSet turns a notCreated entry into a ResultErr", async () => {
    const m = mockMethod("PushSubscription/set", {
      notCreated: { p1: { type: "invalidProperties", description: "local url" } },
    })
    mock = m.mock
    const r = await pushSubscriptionSet({ config: config.data, accountId: "a1", create: { p1: { url: "x" } } })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.op).toBe("pushSubscriptionSet")
      expect(r.errorMessage).toContain("invalidProperties")
    }
  })

  test("pushSubscriptionGet rejects invalid options without sending", async () => {
    const m = mockMethod("PushSubscription/get", {})
    mock = m.mock
    const r = await pushSubscriptionGet({ config: { baseUrl: "" } })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("pushSubscriptionGet")
    expect(m.sent).toHaveLength(0)
  })
})

describe("accountId resolution helpers", () => {
  test("explicit accountId wins without any fetch", async () => {
    const r = await sieveScriptAccountIdResolve({ config: config.data, accountId: "explicit" })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.accountId).toBe("explicit")
      expect(r.data.session).toBeUndefined()
    }
  })

  test("config.accountId is the fallback", async () => {
    const withAccount = stalwartClientConfig({ baseUrl: "https://mail.example.com", token: "t", accountId: "cfg" })
    if (!withAccount.success) throw new Error("fixture config invalid")
    const r = await blobAccountIdResolve({ config: withAccount.data })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.accountId).toBe("cfg")
  })

  test("session primary account resolves the capability", async () => {
    const session = { ...jmapTestSessionCreate(), primaryAccounts: { "urn:ietf:params:jmap:sieve": "sess" } }
    const r = await sieveScriptAccountIdResolve({ config: config.data, session })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.accountId).toBe("sess")
  })

  test("missing accountId without a matching primary account is a ResultErr", async () => {
    const r = await addressBookAccountIdResolve({ config: config.data, session: jmapTestSessionCreate() })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.errorMessage).toContain("urn:ietf:params:jmap:contacts")
  })
})
