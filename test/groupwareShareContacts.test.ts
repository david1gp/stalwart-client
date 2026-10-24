import { afterEach, describe, expect, test } from "bun:test"
import { addressBookChanges } from "../src/addressBooks/addressBookChanges.js"
import { addressBookGet } from "../src/addressBooks/addressBookGet.js"
import { addressBookQuery } from "../src/addressBooks/addressBookQuery.js"
import { addressBookSet } from "../src/addressBooks/addressBookSet.js"
import { stalwartClientConfig } from "../src/client/stalwartClientConfig.js"
import { contactCardChanges } from "../src/contactCards/contactCardChanges.js"
import { contactCardCopy } from "../src/contactCards/contactCardCopy.js"
import { contactCardGet } from "../src/contactCards/contactCardGet.js"
import { contactCardParse } from "../src/contactCards/contactCardParse.js"
import { contactCardQuery } from "../src/contactCards/contactCardQuery.js"
import { contactCardQueryChanges } from "../src/contactCards/contactCardQueryChanges.js"
import { contactCardSet } from "../src/contactCards/contactCardSet.js"
import { fileNodeChanges } from "../src/fileNodes/fileNodeChanges.js"
import { fileNodeCopy } from "../src/fileNodes/fileNodeCopy.js"
import { fileNodeGet } from "../src/fileNodes/fileNodeGet.js"
import { fileNodeQuery } from "../src/fileNodes/fileNodeQuery.js"
import { fileNodeQueryChanges } from "../src/fileNodes/fileNodeQueryChanges.js"
import { fileNodeSet } from "../src/fileNodes/fileNodeSet.js"
import { shareNotificationChanges } from "../src/shareNotifications/shareNotificationChanges.js"
import { shareNotificationGet } from "../src/shareNotifications/shareNotificationGet.js"
import { shareNotificationQuery } from "../src/shareNotifications/shareNotificationQuery.js"
import { shareNotificationQueryChanges } from "../src/shareNotifications/shareNotificationQueryChanges.js"
import { shareNotificationSet } from "../src/shareNotifications/shareNotificationSet.js"
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

const CONTACTS_USING = ["urn:ietf:params:jmap:core", "urn:ietf:params:jmap:contacts"]
const FILENODE_USING = ["urn:ietf:params:jmap:core", "urn:ietf:params:jmap:filenode"]
const PRINCIPALS_USING = ["urn:ietf:params:jmap:core", "urn:ietf:params:jmap:principals"]

describe("addressBook ops", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("addressBookGet fetches books with the contacts capability", async () => {
    const m = mockMethod("AddressBook/get", { list: [{ id: "ab1", name: "Personal" }] })
    mock = m.mock
    const r = await addressBookGet({ config: config.data, accountId: "a1", ids: ["ab1"] })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.list[0]?.name).toBe("Personal")
    expect(m.sent[0]?.using).toEqual(CONTACTS_USING)
    expect(m.sent[0]?.methodCalls[0]).toEqual(["AddressBook/get", { accountId: "a1", ids: ["ab1"] }, "c1"])
  })

  test("addressBookSet creates a book and shares it", async () => {
    const m = mockMethod("AddressBook/set", { created: { b1: { id: "ab2" } } })
    mock = m.mock
    const r = await addressBookSet({
      config: config.data,
      accountId: "a1",
      create: { b1: { name: "Shared" } },
      update: { ab1: { shareWith: { d: { mayRead: true } } } },
    })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({
      accountId: "a1",
      create: { b1: { name: "Shared" } },
      update: { ab1: { shareWith: { d: { mayRead: true } } } },
    })
  })

  test("addressBookSet turns a notDestroyed entry into a ResultErr", async () => {
    const m = mockMethod("AddressBook/set", { notDestroyed: { ab1: { type: "notFound" } } })
    mock = m.mock
    const r = await addressBookSet({ config: config.data, accountId: "a1", destroy: ["ab1"] })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.op).toBe("addressBookSet")
      expect(r.errorMessage).toContain("notDestroyed")
    }
  })

  test("addressBookQuery lists book ids", async () => {
    const m = mockMethod("AddressBook/query", { ids: ["ab1"], queryState: "q1" })
    mock = m.mock
    const r = await addressBookQuery({ config: config.data, accountId: "a1" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.ids).toEqual(["ab1"])
    expect(m.sent[0]?.methodCalls[0]).toEqual(["AddressBook/query", { accountId: "a1" }, "c1"])
  })

  test("addressBookChanges sends sinceState", async () => {
    const m = mockMethod("AddressBook/changes", {
      oldState: "s0",
      newState: "s1",
      created: ["ab2"],
      updated: [],
      destroyed: [],
    })
    mock = m.mock
    const r = await addressBookChanges({ config: config.data, accountId: "a1", sinceState: "s0" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.created).toEqual(["ab2"])
    expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({ accountId: "a1", sinceState: "s0" })
  })

  test("addressBookGet rejects invalid options without sending", async () => {
    const m = mockMethod("AddressBook/get", {})
    mock = m.mock
    const r = await addressBookGet({ config: { baseUrl: "" } })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("addressBookGet")
    expect(m.sent).toHaveLength(0)
  })
})

describe("contactCard ops", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("contactCardGet fetches cards", async () => {
    const m = mockMethod("ContactCard/get", { list: [{ id: "c1", uid: "u1" }] })
    mock = m.mock
    const r = await contactCardGet({ config: config.data, accountId: "a1", ids: ["c1"] })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.using).toEqual(CONTACTS_USING)
    expect(m.sent[0]?.methodCalls[0]).toEqual(["ContactCard/get", { accountId: "a1", ids: ["c1"] }, "c1"])
  })

  test("contactCardSet creates a card", async () => {
    const m = mockMethod("ContactCard/set", { created: { k1: { id: "c2" } } })
    mock = m.mock
    const r = await contactCardSet({
      config: config.data,
      accountId: "a1",
      create: { k1: { "@type": "Card", uid: "u2" } },
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.created?.k1?.id).toBe("c2")
  })

  test("contactCardSet turns a notCreated entry into a ResultErr", async () => {
    const m = mockMethod("ContactCard/set", { notCreated: { k1: { type: "invalidProperties" } } })
    mock = m.mock
    const r = await contactCardSet({ config: config.data, accountId: "a1", create: { k1: {} } })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.errorMessage).toContain("invalidProperties")
  })

  test("contactCardQuery lists card ids", async () => {
    const m = mockMethod("ContactCard/query", { ids: ["c1"], queryState: "q1" })
    mock = m.mock
    const r = await contactCardQuery({ config: config.data, accountId: "a1", filter: { uid: "u1" } })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({ accountId: "a1", filter: { uid: "u1" } })
  })

  test("contactCardChanges sends sinceState", async () => {
    const m = mockMethod("ContactCard/changes", {
      oldState: "s0",
      newState: "s1",
      created: [],
      updated: ["c1"],
      destroyed: [],
    })
    mock = m.mock
    const r = await contactCardChanges({ config: config.data, accountId: "a1", sinceState: "s0" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.updated).toEqual(["c1"])
  })

  test("contactCardQueryChanges sends sinceQueryState", async () => {
    const m = mockMethod("ContactCard/queryChanges", {
      oldQueryState: "q0",
      newQueryState: "q1",
      removed: [],
      added: [{ id: "c1", index: 0 }],
    })
    mock = m.mock
    const r = await contactCardQueryChanges({ config: config.data, accountId: "a1", sinceQueryState: "q0" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.added).toEqual([{ id: "c1", index: 0 }])
    expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({ accountId: "a1", sinceQueryState: "q0" })
  })

  test("contactCardCopy copies a card", async () => {
    const m = mockMethod("ContactCard/copy", { fromAccountId: "a1", accountId: "a1", created: { n1: { id: "c9" } } })
    mock = m.mock
    const r = await contactCardCopy({ config: config.data, accountId: "a1", create: { n1: { id: "c1" } } })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.created?.n1?.id).toBe("c9")
    expect(m.sent[0]?.methodCalls[0]?.[0]).toBe("ContactCard/copy")
  })

  test("contactCardParse sends blob ids", async () => {
    const m = mockMethod("ContactCard/parse", {
      parsed: { b1: { "@type": "Card", uid: "u1" } },
      notParsable: [],
      notFound: [],
    })
    mock = m.mock
    const r = await contactCardParse({ config: config.data, accountId: "a1", blobIds: ["b1"] })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.parsed?.b1?.uid).toBe("u1")
    expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({ accountId: "a1", blobIds: ["b1"] })
  })

  test("contactCardGet rejects invalid options without sending", async () => {
    const m = mockMethod("ContactCard/get", {})
    mock = m.mock
    const r = await contactCardGet({ config: { baseUrl: "" } })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("contactCardGet")
    expect(m.sent).toHaveLength(0)
  })
})

describe("fileNode ops", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("fileNodeGet fetches nodes with the filenode capability", async () => {
    const m = mockMethod("FileNode/get", { list: [{ id: "f1", name: "notes.txt" }] })
    mock = m.mock
    const r = await fileNodeGet({ config: config.data, accountId: "a1", ids: ["f1"] })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.using).toEqual(FILENODE_USING)
    expect(m.sent[0]?.methodCalls[0]).toEqual(["FileNode/get", { accountId: "a1", ids: ["f1"] }, "c1"])
  })

  test("fileNodeSet creates a node", async () => {
    const m = mockMethod("FileNode/set", { created: { n1: { id: "f2" } } })
    mock = m.mock
    const r = await fileNodeSet({
      config: config.data,
      accountId: "a1",
      create: { n1: { name: "notes.txt", blobId: "b1" } },
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.created?.n1?.id).toBe("f2")
  })

  test("fileNodeSet turns a notUpdated entry into a ResultErr", async () => {
    const m = mockMethod("FileNode/set", { notUpdated: { f1: { type: "notFound" } } })
    mock = m.mock
    const r = await fileNodeSet({ config: config.data, accountId: "a1", update: { f1: { name: "x" } } })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.errorMessage).toContain("notFound")
  })

  test("fileNodeQuery lists node ids", async () => {
    const m = mockMethod("FileNode/query", { ids: ["f1"], queryState: "q1" })
    mock = m.mock
    const r = await fileNodeQuery({ config: config.data, accountId: "a1" })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.methodCalls[0]).toEqual(["FileNode/query", { accountId: "a1" }, "c1"])
  })

  test("fileNodeChanges sends sinceState", async () => {
    const m = mockMethod("FileNode/changes", {
      oldState: "s0",
      newState: "s1",
      created: ["f2"],
      updated: [],
      destroyed: [],
    })
    mock = m.mock
    const r = await fileNodeChanges({ config: config.data, accountId: "a1", sinceState: "s0" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.created).toEqual(["f2"])
  })

  test("fileNodeQueryChanges sends sinceQueryState", async () => {
    const m = mockMethod("FileNode/queryChanges", {
      oldQueryState: "q0",
      newQueryState: "q1",
      removed: [],
      added: [],
    })
    mock = m.mock
    const r = await fileNodeQueryChanges({ config: config.data, accountId: "a1", sinceQueryState: "q0" })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({ accountId: "a1", sinceQueryState: "q0" })
  })

  test("fileNodeCopy copies a node", async () => {
    const m = mockMethod("FileNode/copy", { fromAccountId: "a1", accountId: "a1", created: { n1: { id: "f9" } } })
    mock = m.mock
    const r = await fileNodeCopy({ config: config.data, accountId: "a1", create: { n1: { id: "f1" } } })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.created?.n1?.id).toBe("f9")
  })

  test("fileNodeGet rejects invalid options without sending", async () => {
    const m = mockMethod("FileNode/get", {})
    mock = m.mock
    const r = await fileNodeGet({ config: { baseUrl: "" } })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("fileNodeGet")
    expect(m.sent).toHaveLength(0)
  })
})

describe("shareNotification ops", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("shareNotificationGet fetches notifications with the principals capability", async () => {
    const m = mockMethod("ShareNotification/get", { list: [{ id: "n1", objectType: "AddressBook" }] })
    mock = m.mock
    const r = await shareNotificationGet({ config: config.data, accountId: "a1" })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.using).toEqual(PRINCIPALS_USING)
    expect(m.sent[0]?.methodCalls[0]).toEqual(["ShareNotification/get", { accountId: "a1" }, "c1"])
  })

  test("shareNotificationSet destroys (acknowledges) a notification", async () => {
    const m = mockMethod("ShareNotification/set", { destroyed: ["n1"] })
    mock = m.mock
    const r = await shareNotificationSet({ config: config.data, accountId: "a1", destroy: ["n1"] })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.destroyed).toEqual(["n1"])
    expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({ accountId: "a1", destroy: ["n1"] })
  })

  test("shareNotificationSet surfaces the forbidden create error", async () => {
    const m = mockMethod("ShareNotification/set", {
      notCreated: { k1: { type: "forbidden", description: "Cannot create share notifications." } },
    })
    mock = m.mock
    const r = await shareNotificationSet({ config: config.data, accountId: "a1", create: { k1: {} } })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.op).toBe("shareNotificationSet")
      expect(r.errorMessage).toContain("forbidden")
    }
  })

  test("shareNotificationQuery lists notification ids", async () => {
    const m = mockMethod("ShareNotification/query", { ids: ["n1"], queryState: "q1" })
    mock = m.mock
    const r = await shareNotificationQuery({ config: config.data, accountId: "a1" })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.methodCalls[0]).toEqual(["ShareNotification/query", { accountId: "a1" }, "c1"])
  })

  test("shareNotificationChanges sends sinceState", async () => {
    const m = mockMethod("ShareNotification/changes", {
      oldState: "s0",
      newState: "s1",
      created: ["n1"],
      updated: [],
      destroyed: [],
    })
    mock = m.mock
    const r = await shareNotificationChanges({ config: config.data, accountId: "a1", sinceState: "s0" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.created).toEqual(["n1"])
  })

  test("shareNotificationQueryChanges sends sinceQueryState", async () => {
    const m = mockMethod("ShareNotification/queryChanges", {
      oldQueryState: "q0",
      newQueryState: "q1",
      removed: [],
      added: [{ id: "n1", index: 0 }],
    })
    mock = m.mock
    const r = await shareNotificationQueryChanges({ config: config.data, accountId: "a1", sinceQueryState: "q0" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.added).toEqual([{ id: "n1", index: 0 }])
  })

  test("shareNotificationGet rejects invalid options without sending", async () => {
    const m = mockMethod("ShareNotification/get", {})
    mock = m.mock
    const r = await shareNotificationGet({ config: { baseUrl: "" } })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("shareNotificationGet")
    expect(m.sent).toHaveLength(0)
  })
})
