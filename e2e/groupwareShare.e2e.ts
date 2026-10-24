import { afterAll, beforeAll, describe, expect, test } from "bun:test"
import { addressBookChanges } from "../src/addressBooks/addressBookChanges.js"
import { addressBookGet } from "../src/addressBooks/addressBookGet.js"
import { addressBookQuery } from "../src/addressBooks/addressBookQuery.js"
import { addressBookSet } from "../src/addressBooks/addressBookSet.js"
import { blobCopy } from "../src/blobs/blobCopy.js"
import { blobDownload } from "../src/blobs/blobDownload.js"
import { blobGet } from "../src/blobs/blobGet.js"
import { blobHttpUpload } from "../src/blobs/blobHttpUpload.js"
import { blobLookup } from "../src/blobs/blobLookup.js"
import { blobUpload } from "../src/blobs/blobUpload.js"
import { stalwartClientConfig } from "../src/client/stalwartClientConfig.js"
import type { StalwartClientConfig } from "../src/client/stalwartClientConfigSchema.js"
import type { Result, ResultOk } from "#result"
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
import { pushSubscriptionGet } from "../src/pushSubscriptions/pushSubscriptionGet.js"
import { pushSubscriptionSet } from "../src/pushSubscriptions/pushSubscriptionSet.js"
import { quotaChanges } from "../src/quotas/quotaChanges.js"
import { quotaGet } from "../src/quotas/quotaGet.js"
import { quotaQuery } from "../src/quotas/quotaQuery.js"
import { quotaQueryChanges } from "../src/quotas/quotaQueryChanges.js"
import { shareNotificationChanges } from "../src/shareNotifications/shareNotificationChanges.js"
import { shareNotificationGet } from "../src/shareNotifications/shareNotificationGet.js"
import { shareNotificationQuery } from "../src/shareNotifications/shareNotificationQuery.js"
import { shareNotificationQueryChanges } from "../src/shareNotifications/shareNotificationQueryChanges.js"
import { shareNotificationSet } from "../src/shareNotifications/shareNotificationSet.js"
import { sieveScriptActivate } from "../src/sieveScripts/sieveScriptActivate.js"
import { sieveScriptGet } from "../src/sieveScripts/sieveScriptGet.js"
import { sieveScriptQuery } from "../src/sieveScripts/sieveScriptQuery.js"
import { sieveScriptSet } from "../src/sieveScripts/sieveScriptSet.js"
import { sieveScriptValidate } from "../src/sieveScripts/sieveScriptValidate.js"
import { e2eRunId } from "./e2eRunId.js"
import { stalwartE2eSetup } from "./e2eSetup.js"

let alice: StalwartClientConfig
let bob: StalwartClientConfig
let aliceAccountId: string
let bobAccountId: string
const runId = e2eRunId()

const created: {
  scriptBlobId?: string
  badScriptBlobId?: string
  scriptId?: string
  blobId?: string
  textBlobId?: string
  bookId?: string
  cardId?: string
  cardCopyId?: string
  fileId?: string
  fileCopyId?: string
  notificationIds?: string[]
} = {}

/** Same overlay parsing as e2eSetup.ts, for the user-scoped configs. */
async function groupwareEnv(): Promise<Record<string, string | undefined>> {
  const target = process.env.STALWART_E2E_TARGET ?? "live"
  if (target !== "local") return process.env
  const localFile = Bun.file(new URL("../ops/local-stalwart/.env.local", import.meta.url))
  if (!(await localFile.exists())) {
    throw new Error("STALWART_E2E_TARGET=local requires ops/local-stalwart/.env.local")
  }
  const overlay: Record<string, string> = {}
  for (const line of (await localFile.text()).split("\n")) {
    const trimmed = line.trim()
    if (trimmed === "" || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq < 0) continue
    overlay[trimmed.slice(0, eq)] = trimmed.slice(eq + 1)
  }
  return { ...process.env, ...overlay }
}

function mustSuccess<T>(r: Result<T>, what: string): asserts r is ResultOk<T> {
  if (!r.success) {
    throw new Error(`${what} failed: ${r.errorMessage} ${r.errorData ?? ""}`)
  }
}

beforeAll(async () => {
  await stalwartE2eSetup()
  const env = await groupwareEnv()
  const baseUrl = env.STALWART_BASE_URL
  const a = stalwartClientConfig({
    baseUrl: baseUrl as string,
    username: env.STALWART_USER_A,
    password: env.STALWART_USER_A_PASSWORD,
  })
  const b = stalwartClientConfig({
    baseUrl: baseUrl as string,
    username: env.STALWART_USER_B,
    password: env.STALWART_USER_B_PASSWORD,
  })
  if (!a.success) throw new Error(`alice config invalid: ${a.errorMessage}`)
  if (!b.success) throw new Error(`bob config invalid: ${b.errorMessage}`)
  alice = a.data
  bob = b.data
  aliceAccountId = env.STALWART_USER_A_ACCOUNT_ID as string
  bobAccountId = env.STALWART_USER_B_ACCOUNT_ID as string
})

afterAll(async () => {
  // Strict reverse-order, best-effort teardown of run-scoped objects only.
  if (created.cardCopyId !== undefined) {
    const r = await contactCardSet({ config: alice, destroy: [created.cardCopyId] })
    if (!r.success) console.warn(`teardown: contact copy not removed: ${r.errorMessage}`)
  }
  if (created.cardId !== undefined) {
    const r = await contactCardSet({ config: alice, destroy: [created.cardId] })
    if (!r.success) console.warn(`teardown: contact card not removed: ${r.errorMessage}`)
  }
  if (created.fileCopyId !== undefined) {
    const r = await fileNodeSet({ config: alice, destroy: [created.fileCopyId] })
    if (!r.success) console.warn(`teardown: file copy not removed: ${r.errorMessage}`)
  }
  if (created.fileId !== undefined) {
    const r = await fileNodeSet({ config: alice, destroy: [created.fileId] })
    if (!r.success) console.warn(`teardown: file node not removed: ${r.errorMessage}`)
  }
  if (created.bookId !== undefined) {
    const r = await addressBookSet({ config: alice, destroy: [created.bookId] })
    if (!r.success) console.warn(`teardown: address book not removed: ${r.errorMessage}`)
    // Destroying a shared book notifies again: sweep every notification about it.
    const nq = await shareNotificationQuery({ config: bob })
    if (nq.success) {
      const mine = nq.data.ids.map(String).filter((id) => id !== undefined)
      const ng = await shareNotificationGet({ config: bob, ids: mine })
      if (ng.success) {
        const about = ng.data.list.filter((n) => n.objectId === created.bookId).map((n) => String(n.id))
        for (const id of about) {
          const d = await shareNotificationSet({ config: bob, destroy: [id] })
          if (!d.success) console.warn(`teardown: notification ${id} not removed: ${d.errorMessage}`)
        }
      }
    }
  }
  if (created.scriptId !== undefined) {
    const r = await sieveScriptSet({ config: alice, destroy: [created.scriptId] })
    if (!r.success) console.warn(`teardown: sieve script not removed: ${r.errorMessage}`)
  }
})

describe("e2e groupware-share: sieve round trip as alice", () => {
  test(
    "blobHttpUpload stores the script source and validate accepts it",
    async () => {
      const up = await blobHttpUpload({ config: alice, data: "keep;\n", contentType: "text/plain" })
      mustSuccess(up, "script upload")
      created.scriptBlobId = up.data.blobId
      expect(created.scriptBlobId).toBeString()
      const v = await sieveScriptValidate({ config: alice, blobId: created.scriptBlobId })
      mustSuccess(v, "sieve validate")
      expect(v.data.error ?? null).toBeNull()
    },
    { timeout: 30_000 },
  )

  test(
    "validate reports an error for a broken script",
    async () => {
      const up = await blobHttpUpload({ config: alice, data: "this is {{{ not sieve", contentType: "text/plain" })
      mustSuccess(up, "bad script upload")
      created.badScriptBlobId = up.data.blobId
      const v = await sieveScriptValidate({ config: alice, blobId: created.badScriptBlobId })
      mustSuccess(v, "bad sieve validate")
      expect(v.data.error).toBeDefined()
    },
    { timeout: 30_000 },
  )

  test(
    "sieveScriptSet creates the script and activate enables it",
    async () => {
      const s = await sieveScriptSet({
        config: alice,
        create: { e2e: { name: `e2e-${runId}`, blobId: created.scriptBlobId as string } },
      })
      mustSuccess(s, "script create")
      created.scriptId = s.data.created?.e2e?.id as string
      expect(created.scriptId).toBeString()
      const g = await sieveScriptGet({ config: alice, ids: [created.scriptId as string] })
      mustSuccess(g, "script get")
      expect(g.data.list[0]?.name).toBe(`e2e-${runId}`)
      const q = await sieveScriptQuery({ config: alice, filter: { name: `e2e-${runId}` } })
      mustSuccess(q, "script query")
      expect(q.data.ids.map(String)).toEqual([created.scriptId as string])
      const a = await sieveScriptActivate({ config: alice, id: created.scriptId as string })
      mustSuccess(a, "script activate")
      const g2 = await sieveScriptGet({ config: alice, ids: [created.scriptId as string] })
      mustSuccess(g2, "script get after activate")
      expect(g2.data.list[0]?.isActive).toBe(true)
      const d = await sieveScriptSet({ config: alice, onSuccessDeactivateScript: true })
      mustSuccess(d, "script deactivate")
      const g3 = await sieveScriptGet({ config: alice, ids: [created.scriptId as string] })
      mustSuccess(g3, "script get after deactivate")
      expect(g3.data.list[0]?.isActive ?? false).toBe(false)
    },
    { timeout: 60_000 },
  )
})

describe("e2e groupware-share: blob method ops as alice", () => {
  test(
    "method-form upload, get, lookup and download round-trip bytes",
    async () => {
      const u = await blobUpload({ config: alice, create: { t1: { data: [{ "data:asText": `e2e-${runId}` }] } } })
      mustSuccess(u, "blob upload")
      created.blobId = u.data.created?.t1?.id as string
      expect(created.blobId).toBeString()
      const g = await blobGet({ config: alice, ids: [created.blobId as string] })
      mustSuccess(g, "blob get")
      expect(g.data.list).toHaveLength(1)
      const l = await blobLookup({ config: alice, typeNames: ["Mailbox"], ids: [created.blobId as string] })
      mustSuccess(l, "blob lookup")
      expect(l.data.list[0]?.id).toBe(created.blobId)
      expect(l.data.notFound).toEqual([])
      const dl = await blobDownload({ config: alice, blobId: created.blobId as string, name: "note.txt" })
      mustSuccess(dl, "blob download")
      expect(new TextDecoder().decode(dl.data)).toBe(`e2e-${runId}`)
    },
    { timeout: 60_000 },
  )

  test(
    "blobCopy duplicates the blob within the account",
    async () => {
      const c = await blobCopy({ config: alice, blobIds: [created.blobId as string] })
      mustSuccess(c, "blob copy")
      created.textBlobId = c.data.copied?.[created.blobId as string] as string
      expect(created.textBlobId).toBeString()
      const g = await blobGet({ config: alice, ids: [created.textBlobId as string] })
      mustSuccess(g, "copied blob get")
      expect(g.data.list).toHaveLength(1)
    },
    { timeout: 30_000 },
  )
})

describe("e2e groupware-share: quota and push as alice", () => {
  test(
    "quota get/query succeed; changes are not calculable without quota history",
    async () => {
      const g = await quotaGet({ config: alice })
      mustSuccess(g, "quota get")
      const q = await quotaQuery({ config: alice, limit: 10 })
      mustSuccess(q, "quota query")
      // No disk quota is configured, so the server keeps no quota changelog:
      // Quota/changes fails with cannotCalculateChanges on this instance.
      const c = await quotaChanges({ config: alice, sinceState: String(g.data.state ?? "n") })
      expect(c.success).toBe(false)
      if (!c.success) expect(c.errorMessage).toContain("cannotCalculateChanges")
    },
    { timeout: 30_000 },
  )

  test(
    "quota queryChanges is rejected by the community server",
    async () => {
      const q = await quotaQuery({ config: alice, limit: 1 })
      mustSuccess(q, "quota query for state")
      const qc = await quotaQueryChanges({ config: alice, sinceQueryState: q.data.queryState })
      expect(qc.success).toBe(false)
      if (!qc.success) expect(qc.errorMessage).toContain("cannotCalculateChanges")
    },
    { timeout: 30_000 },
  )

  test(
    "push get is empty and local-url subscriptions are rejected",
    async () => {
      const g = await pushSubscriptionGet({ config: alice })
      mustSuccess(g, "push get")
      expect(g.data.list).toEqual([])
      const s = await pushSubscriptionSet({
        config: alice,
        create: {
          p1: {
            deviceClientId: `e2e-${runId}`,
            url: "http://127.0.0.1:9/push",
            types: ["Mailbox"],
          },
        },
      })
      expect(s.success).toBe(false)
      if (!s.success) expect(s.errorMessage).toContain("Push subscription URLs must use the https scheme.")
    },
    { timeout: 30_000 },
  )
})

describe("e2e groupware-share: address book share alice to bob", () => {
  test(
    "create a book, share it, and observe the ShareNotification as bob",
    async () => {
      const s = await addressBookSet({ config: alice, create: { b1: { name: `e2e-${runId}` } } })
      mustSuccess(s, "book create")
      created.bookId = s.data.created?.b1?.id as string
      expect(created.bookId).toBeString()
      const g = await addressBookGet({ config: alice, ids: [created.bookId as string] })
      mustSuccess(g, "book get")
      expect(g.data.list[0]?.name).toBe(`e2e-${runId}`)
      const state = g.data.state as string
      const ch = await addressBookChanges({ config: alice, sinceState: state })
      mustSuccess(ch, "book changes")
      expect(ch.data.oldState).toBe(state)
      const sh = await addressBookSet({
        config: alice,
        update: { [created.bookId as string]: { shareWith: { [bobAccountId]: { mayRead: true } } } },
      })
      mustSuccess(sh, "book share")
      const g2 = await addressBookGet({ config: alice, ids: [created.bookId as string] })
      mustSuccess(g2, "book get after share")
      const nq = await shareNotificationQuery({ config: bob })
      mustSuccess(nq, "bob notification query")
      const mine = nq.data.ids.map(String)
      expect(mine.length).toBeGreaterThan(0)
      const ng = await shareNotificationGet({ config: bob, ids: mine })
      mustSuccess(ng, "bob notification get")
      const aboutBook = ng.data.list.find((n) => n.objectId === created.bookId)
      expect(aboutBook?.objectType).toBe("AddressBook")
      created.notificationIds = ng.data.list.filter((n) => n.objectId === created.bookId).map((n) => String(n.id))
      const nch = await shareNotificationChanges({ config: bob, sinceState: ng.data.state as string })
      mustSuccess(nch, "bob notification changes")
      const nqc = await shareNotificationQueryChanges({ config: bob, sinceQueryState: nq.data.queryState })
      mustSuccess(nqc, "bob notification queryChanges")
      expect(nqc.data.oldQueryState).toBe(nq.data.queryState)
      // A sharee reads shared books under the owner's accountId.
      const bobBook = await addressBookGet({ config: bob, accountId: aliceAccountId, ids: [created.bookId as string] })
      mustSuccess(bobBook, "bob shared book get")
      expect(bobBook.data.list[0]?.name).toBe(`e2e-${runId}`)
      expect(bobBook.data.list[0]?.myRights?.mayRead).toBe(true)
      const bobQuery = await addressBookQuery({ config: bob, accountId: aliceAccountId })
      mustSuccess(bobQuery, "bob shared book query")
      expect(bobQuery.data.ids.map(String)).toContain(created.bookId as string)
    },
    { timeout: 60_000 },
  )

  test(
    "contact card parse, create, query, copy and changes",
    async () => {
      const vcard = `BEGIN:VCARD\r\nVERSION:4.0\r\nFN:E2E ${runId}\r\nUID:e2e-${runId}\r\nEMAIL:e2e-${runId}@example.test\r\nEND:VCARD\r\n`
      const up = await blobHttpUpload({ config: alice, data: vcard, contentType: "text/vcard" })
      mustSuccess(up, "vcard upload")
      const p = await contactCardParse({ config: alice, blobIds: [up.data.blobId] })
      mustSuccess(p, "contact parse")
      const parsed = p.data.parsed?.[up.data.blobId] as Record<string, unknown>
      expect(parsed?.uid ?? parsed?.UID).toBeDefined()
      const s = await contactCardSet({
        config: alice,
        create: { k1: { ...parsed, addressBookIds: { [created.bookId as string]: true } } },
      })
      mustSuccess(s, "contact create")
      created.cardId = s.data.created?.k1?.id as string
      expect(created.cardId).toBeString()
      const g = await contactCardGet({ config: alice, ids: [created.cardId as string] })
      mustSuccess(g, "contact get")
      expect(g.data.list).toHaveLength(1)
      const q = await contactCardQuery({ config: alice })
      mustSuccess(q, "contact query")
      expect(q.data.ids.map(String)).toContain(created.cardId as string)
      const qch = await contactCardQueryChanges({ config: alice, sinceQueryState: q.data.queryState })
      mustSuccess(qch, "contact queryChanges")
      expect(qch.data.oldQueryState).toBe(q.data.queryState)
      const cch = await contactCardChanges({ config: alice, sinceState: g.data.state as string })
      mustSuccess(cch, "contact changes")
      // Same-account copies are rejected server-side; pin the error shape.
      const cp = await contactCardCopy({ config: alice, create: { k2: { id: created.cardId as string } } })
      expect(cp.success).toBe(false)
      if (!cp.success) expect(cp.errorMessage).toContain("From accountId is equal")
    },
    { timeout: 60_000 },
  )

  test(
    "file node create, query, copy and changes",
    async () => {
      const s = await fileNodeSet({
        config: alice,
        create: { f1: { name: `e2e-${runId}.txt`, blobId: created.blobId as string } },
      })
      mustSuccess(s, "file create")
      created.fileId = s.data.created?.f1?.id as string
      expect(created.fileId).toBeString()
      const g = await fileNodeGet({ config: alice, ids: [created.fileId as string] })
      mustSuccess(g, "file get")
      expect(g.data.list[0]?.name).toBe(`e2e-${runId}.txt`)
      const q = await fileNodeQuery({ config: alice })
      mustSuccess(q, "file query")
      expect(q.data.ids.map(String)).toContain(created.fileId as string)
      const qch = await fileNodeQueryChanges({ config: alice, sinceQueryState: q.data.queryState })
      mustSuccess(qch, "file queryChanges")
      const ch = await fileNodeChanges({ config: alice, sinceState: g.data.state as string })
      mustSuccess(ch, "file changes")
      // Same-account copies are rejected server-side; pin the error shape.
      const cp = await fileNodeCopy({ config: alice, create: { f2: { id: created.fileId as string } } })
      expect(cp.success).toBe(false)
      if (!cp.success) expect(cp.errorMessage).toContain("From accountId is equal")
    },
    { timeout: 60_000 },
  )
})
