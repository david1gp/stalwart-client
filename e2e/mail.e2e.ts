import { afterAll, beforeAll, describe, expect, test } from "bun:test"
import type { PromiseResult } from "#result"
import type { StalwartClientConfig } from "../src/client/stalwartClientConfigSchema.js"
import { stalwartClientConfig } from "../src/client/stalwartClientConfig.js"
import { emailChanges } from "../src/emails/emailChanges.js"
import { emailCopy } from "../src/emails/emailCopy.js"
import { emailGet } from "../src/emails/emailGet.js"
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
import { identityGet } from "../src/identities/identityGet.js"
import { identitySet } from "../src/identities/identitySet.js"
import { jmapUpload } from "../src/jmap/jmapUpload.js"
import { mailboxByRole } from "../src/mailboxes/mailboxByRole.js"
import { mailboxGet } from "../src/mailboxes/mailboxGet.js"
import { mailboxSet } from "../src/mailboxes/mailboxSet.js"
import { searchSnippetGet } from "../src/searchSnippets/searchSnippetGet.js"
import { threadGet } from "../src/threads/threadGet.js"
import { vacationResponseGet } from "../src/vacationResponses/vacationResponseGet.js"
import { vacationResponseSet } from "../src/vacationResponses/vacationResponseSet.js"
import { e2eRunId } from "./e2eRunId.js"
import { stalwartE2eSetup } from "./e2eSetup.js"

const runId = e2eRunId()
const subject = `e2e mail ${runId}`

let alice: StalwartClientConfig
let bob: StalwartClientConfig

/** Build an alice/bob user config from the local harness overlay (mirrors e2eSetup.ts parsing). */
async function mailE2eUserConfig(user: "A" | "B"): Promise<StalwartClientConfig> {
  const localFile = Bun.file(new URL("../ops/local-stalwart/.env.local", import.meta.url))
  const overlay: Record<string, string> = {}
  for (const line of (await localFile.text()).split("\n")) {
    const trimmed = line.trim()
    if (trimmed === "" || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq < 0) continue
    overlay[trimmed.slice(0, eq)] = trimmed.slice(eq + 1)
  }
  const parsed = stalwartClientConfig({
    baseUrl: overlay.STALWART_BASE_URL ?? "",
    username: overlay[`STALWART_USER_${user}`],
    password: overlay[`STALWART_USER_${user}_PASSWORD`],
    accountId: overlay[`STALWART_USER_${user}_ACCOUNT_ID`],
  })
  if (!parsed.success) throw new Error(`mail e2e user ${user} config invalid: ${parsed.errorMessage}`)
  return parsed.data
}

function requireSuccess<T>(result: PromiseResult<T>, label: string): T {
  if (!result.success) throw new Error(`${label} failed: ${result.errorMessage} ${result.errorData ?? ""}`)
  return result.data
}

const created = {
  mailboxId: undefined as string | undefined,
  sentEmailId: undefined as string | undefined,
  receivedEmailId: undefined as string | undefined,
  importedEmailId: undefined as string | undefined,
  identityId: undefined as string | undefined,
  bobInboxId: undefined as string | undefined,
  vacationWasEnabled: undefined as boolean | undefined,
}

beforeAll(async () => {
  await stalwartE2eSetup()
  alice = await mailE2eUserConfig("A")
  bob = await mailE2eUserConfig("B")
  created.bobInboxId = requireSuccess(await mailboxByRole({ config: bob, role: "inbox" }), "mailboxByRole inbox")
})

afterAll(async () => {
  // Strict reverse-order, best-effort teardown of run-scoped objects only.
  // Drafts left by a failed send (Email/set succeeds, submission fails).
  const draftsBox = await mailboxByRole({ config: alice, role: "drafts" })
  if (draftsBox.success) {
    const drafts = await emailQuery({ config: alice, filter: { inMailbox: draftsBox.data, subject } })
    if (drafts.success && drafts.data.ids.length > 0) {
      const removed = await emailSet({ config: alice, destroy: drafts.data.ids.map(String) })
      if (!removed.success) console.warn(`teardown: draft leftovers not removed: ${removed.errorMessage}`)
    }
  }
  if (created.importedEmailId !== undefined) {
    const r = await emailSet({ config: alice, destroy: [created.importedEmailId] })
    if (!r.success) console.warn(`teardown: imported email not removed: ${r.errorMessage}`)
  }
  if (created.receivedEmailId !== undefined) {
    const r = await emailSet({ config: bob, destroy: [created.receivedEmailId] })
    if (!r.success) console.warn(`teardown: received email not removed: ${r.errorMessage}`)
  }
  if (created.sentEmailId !== undefined) {
    const r = await emailSet({ config: alice, destroy: [created.sentEmailId] })
    if (!r.success) console.warn(`teardown: sent email not removed: ${r.errorMessage}`)
  }
  if (created.identityId !== undefined) {
    const r = await identitySet({ config: alice, destroy: [created.identityId] })
    if (!r.success) console.warn(`teardown: identity not removed: ${r.errorMessage}`)
  }
  if (created.mailboxId !== undefined) {
    const r = await mailboxSet({ config: alice, destroy: [created.mailboxId] })
    if (!r.success) console.warn(`teardown: mailbox not removed: ${r.errorMessage}`)
  }
})

describe("e2e mail: run-scoped mailbox lifecycle", () => {
  test(
    "mailboxSet creates and renames a throwaway mailbox",
    async () => {
      const name = `e2e-${runId}`
      const createdBox = requireSuccess(
        await mailboxSet({ config: alice, create: { m1: { name } } }),
        "mailboxSet create",
      )
      created.mailboxId = createdBox.created?.m1?.id
      expect(created.mailboxId).toBeString()

      const listed = requireSuccess(
        await mailboxGet({ config: alice, ids: [created.mailboxId as string], properties: ["id", "name"] }),
        "mailboxGet",
      )
      expect(listed.list[0]?.name).toBe(name)

      requireSuccess(
        await mailboxSet({ config: alice, update: { [created.mailboxId as string]: { name: `${name}-renamed` } } }),
        "mailboxSet rename",
      )
      const again = requireSuccess(
        await mailboxGet({ config: alice, ids: [created.mailboxId as string], properties: ["name"] }),
        "mailboxGet renamed",
      )
      expect(again.list[0]?.name).toBe(`${name}-renamed`)
    },
    { timeout: 30_000 },
  )
})

describe("e2e mail: alice sends to bob, both sides read it back", () => {
  test(
    "emailSend delivers alice→bob and bob polls it within 10 s",
    async () => {
      // Capture changes/queryChanges cursors before the send.
      const beforeQueryState = requireSuccess(
        await emailQuery({ config: bob, filter: { inMailbox: created.bobInboxId }, limit: 1 }),
        "emailQuery before",
      ).queryState
      const beforeState = requireSuccess(await emailGet({ config: bob, properties: ["id"] }), "emailGet before").state
      expect(beforeState).toBeString()

      const sentData = requireSuccess(
        await emailSend({
          config: alice,
          from: "alice@example.test",
          to: ["bob@example.test"],
          subject,
          text: `Hello Bob, run ${runId}`,
        }),
        "emailSend",
      )
      created.sentEmailId = sentData.email.created?.e1?.id
      expect(created.sentEmailId).toBeString()

      const deadline = Date.now() + 10_000
      let found: string | undefined
      while (Date.now() < deadline && found === undefined) {
        const polled = requireSuccess(
          await emailQuery({ config: bob, filter: { inMailbox: created.bobInboxId, subject } }),
          "bob poll",
        )
        if (polled.ids.length > 0) found = String(polled.ids[0])
        else await Bun.sleep(500)
      }
      expect(found).toBeString()
      created.receivedEmailId = found

      // Body values round trip on bob's side.
      const bobMail = requireSuccess(
        await emailGet({
          config: bob,
          ids: [found as string],
          properties: ["id", "from", "to", "subject", "bodyValues"],
          bodyProperties: ["textBody"],
          fetchTextBodyValues: true,
        }),
        "bob emailGet",
      )
      expect(bobMail.list[0]?.subject).toBe(subject)
      expect(Object.values(bobMail.list[0]?.bodyValues ?? {})[0]?.value).toContain(runId)

      // Sorted, filtered query on alice's Sent.
      const sentBox = requireSuccess(await mailboxByRole({ config: alice, role: "sent" }), "sent mailbox")
      const aliceMail = requireSuccess(
        await emailQuery({
          config: alice,
          filter: { inMailbox: sentBox, subject },
          sort: [{ property: "receivedAt", isAscending: false }],
        }),
        "alice emailQuery",
      )
      expect(aliceMail.ids).toHaveLength(1)

      // Changes + queryChanges against the pre-send cursors.
      const changes = requireSuccess(
        await emailChanges({ config: bob, sinceState: beforeState as string }),
        "emailChanges",
      )
      expect(changes.created.map(String)).toContain(found as string)
      const queryChanged = requireSuccess(
        await emailQueryChanges({
          config: bob,
          filter: { inMailbox: created.bobInboxId },
          sinceQueryState: beforeQueryState,
        }),
        "emailQueryChanges",
      )
      expect(queryChanged.added.map((entry) => String(entry.id))).toContain(found as string)

      // Thread + snippet for the new mail.
      const withThread = requireSuccess(
        await emailGet({ config: bob, ids: [found as string], properties: ["id", "threadId"] }),
        "threadId get",
      )
      const threadId = withThread.list[0]?.threadId
      expect(threadId).toBeString()
      const thread = requireSuccess(await threadGet({ config: bob, ids: [threadId as string] }), "threadGet")
      expect(thread.list[0]?.emailIds?.map(String)).toContain(found as string)
      const snippet = requireSuccess(
        await searchSnippetGet({ config: bob, emailIds: [found as string], filter: { subject } }),
        "searchSnippetGet",
      )
      expect(snippet.list[0]?.subject).toContain(runId)
    },
    { timeout: 60_000 },
  )

  test(
    "Email/copy between accounts without sharing is forbidden",
    async () => {
      const copied = await emailCopy({
        config: bob,
        fromAccountId: alice.accountId,
        create: { x1: { id: created.receivedEmailId as string, mailboxIds: { [created.bobInboxId as string]: true } } },
      })
      expect(copied.success).toBe(false)
      if (!copied.success) expect(copied.errorMessage).toContain("forbidden")
    },
    { timeout: 30_000 },
  )
})

describe("e2e mail: import, parse, submission and identity lifecycle", () => {
  const rawMessage = [
    "From: alice@example.test",
    "To: alice@example.test",
    `Subject: ${subject} import`,
    "Content-Type: text/plain; charset=utf-8",
    "",
    `imported body ${runId}`,
    "",
  ].join("\r\n")

  test(
    "Email/parse previews and Email/import stores an uploaded message",
    async () => {
      const blobId = requireSuccess(
        await jmapUpload({
          config: alice,
          accountId: alice.accountId as string,
          data: rawMessage,
          contentType: "message/rfc822",
        }),
        "jmapUpload",
      ).blobId

      const parsed = requireSuccess(
        await emailParse({ config: alice, blobIds: [blobId], properties: ["subject"] }),
        "emailParse",
      )
      expect(parsed.parsed?.[blobId]?.subject).toBe(`${subject} import`)

      const inbox = requireSuccess(await mailboxByRole({ config: alice, role: "inbox" }), "inbox")
      created.importedEmailId = requireSuccess(
        await emailImport({ config: alice, emails: { m1: { blobId, mailboxIds: { [inbox]: true } } } }),
        "emailImport",
      ).created?.m1?.id
      expect(created.importedEmailId).toBeString()
    },
    { timeout: 30_000 },
  )

  test(
    "emailImportRaw uploads and imports in one step, then cleans up",
    async () => {
      const inbox = requireSuccess(await mailboxByRole({ config: alice, role: "inbox" }), "inbox")
      const rawId = requireSuccess(
        await emailImportRaw({
          config: alice,
          mailboxIds: [inbox],
          raw: rawMessage.replace(`${subject} import`, `${subject} raw`),
        }),
        "emailImportRaw",
      ).created?.m1?.id
      expect(rawId).toBeString()
      requireSuccess(await emailSet({ config: alice, destroy: [rawId as string] }), "emailImportRaw cleanup")
    },
    { timeout: 30_000 },
  )

  test(
    "Identity/set creates and destroys a throwaway identity",
    async () => {
      created.identityId = requireSuccess(
        await identitySet({ config: alice, create: { t1: { name: `e2e ${runId}`, email: "alice@example.test" } } }),
        "identitySet create",
      ).created?.t1?.id
      expect(created.identityId).toBeString()
      const listed = requireSuccess(
        await identityGet({ config: alice, ids: [created.identityId as string] }),
        "identityGet",
      )
      expect(listed.list[0]?.email).toBe("alice@example.test")
    },
    { timeout: 30_000 },
  )

  test(
    "EmailSubmission get/query/changes see the sent submission",
    async () => {
      const list = requireSuccess(
        await emailSubmissionGet({ config: alice, properties: ["id", "emailId"] }),
        "emailSubmissionGet",
      ).list
      expect(list.length).toBeGreaterThan(0)
      const queried = requireSuccess(await emailSubmissionQuery({ config: alice, limit: 50 }), "emailSubmissionQuery")
      expect(queried.ids.length).toBeGreaterThan(0)
      const currentState = requireSuccess(
        await emailSubmissionGet({ config: alice, properties: ["id"] }),
        "submission state",
      ).state
      expect(currentState).toBeString()
      const changes = requireSuccess(
        await emailSubmissionChanges({ config: alice, sinceState: currentState as string }),
        "emailSubmissionChanges",
      )
      expect(changes.newState).toBeString()
    },
    { timeout: 30_000 },
  )

  test(
    "VacationResponse get, enable and restore",
    async () => {
      const vacation = requireSuccess(await vacationResponseGet({ config: alice }), "vacationResponseGet")
      expect(vacation.list).toHaveLength(1)
      created.vacationWasEnabled = vacation.list[0]?.isEnabled
      const vacationId = vacation.list[0]?.id as string
      requireSuccess(
        await vacationResponseSet({
          config: alice,
          update: { [vacationId]: { isEnabled: true, subject, textBody: `away ${runId}` } },
        }),
        "vacationResponseSet enable",
      )
      const check = requireSuccess(await vacationResponseGet({ config: alice }), "vacationResponseGet check")
      expect(check.list[0]?.isEnabled).toBe(true)
      requireSuccess(
        await vacationResponseSet({
          config: alice,
          update: { [vacationId]: { isEnabled: created.vacationWasEnabled ?? false } },
        }),
        "vacationResponseSet restore",
      )
    },
    { timeout: 30_000 },
  )
})
