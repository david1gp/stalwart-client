import { afterAll, beforeAll, describe, expect, test } from "bun:test"
import { calendarChanges } from "../src/calendars/calendarChanges.js"
import { calendarGet } from "../src/calendars/calendarGet.js"
import { calendarQuery } from "../src/calendars/calendarQuery.js"
import { calendarSet } from "../src/calendars/calendarSet.js"
import { calendarEventChanges } from "../src/calendarEvents/calendarEventChanges.js"
import { calendarEventCopy } from "../src/calendarEvents/calendarEventCopy.js"
import { calendarEventGet } from "../src/calendarEvents/calendarEventGet.js"
import { calendarEventParse } from "../src/calendarEvents/calendarEventParse.js"
import { calendarEventQuery } from "../src/calendarEvents/calendarEventQuery.js"
import { calendarEventQueryChanges } from "../src/calendarEvents/calendarEventQueryChanges.js"
import { calendarEventSet } from "../src/calendarEvents/calendarEventSet.js"
import { calendarEventNotificationChanges } from "../src/calendarEventNotifications/calendarEventNotificationChanges.js"
import { calendarEventNotificationGet } from "../src/calendarEventNotifications/calendarEventNotificationGet.js"
import { calendarEventNotificationQuery } from "../src/calendarEventNotifications/calendarEventNotificationQuery.js"
import { calendarEventNotificationQueryChanges } from "../src/calendarEventNotifications/calendarEventNotificationQueryChanges.js"
import { calendarEventNotificationSet } from "../src/calendarEventNotifications/calendarEventNotificationSet.js"
import { participantIdentityChanges } from "../src/participantIdentities/participantIdentityChanges.js"
import { participantIdentityGet } from "../src/participantIdentities/participantIdentityGet.js"
import { participantIdentitySet } from "../src/participantIdentities/participantIdentitySet.js"
import { principalChanges } from "../src/principals/principalChanges.js"
import { principalGet } from "../src/principals/principalGet.js"
import { principalGetAvailability } from "../src/principals/principalGetAvailability.js"
import { principalQuery } from "../src/principals/principalQuery.js"
import { principalQueryChanges } from "../src/principals/principalQueryChanges.js"
import { principalSet } from "../src/principals/principalSet.js"
import { stalwartClientConfig } from "../src/client/stalwartClientConfig.js"
import type { StalwartClientConfig } from "../src/client/stalwartClientConfigSchema.js"
import { e2eRunId } from "./e2eRunId.js"
import { stalwartE2eSetup } from "./e2eSetup.js"

const runId = e2eRunId()
const calendarName = `e2e-${runId}`

let alice: StalwartClientConfig
let aliceAccountId = ""
let aliceEmail = ""
let bobEmail = ""
const created: { calendarId?: string; eventId?: string; notificationIds: string[] } = { notificationIds: [] }
let bobPrincipalId = ""

/** Same overlay parsing as `e2eSetup.ts` (kept local — `e2eSetup.ts` is off-limits). */
async function groupwareCalOverlayEnv(): Promise<Record<string, string | undefined>> {
  const target = process.env.STALWART_E2E_TARGET ?? "live"
  let env: Record<string, string | undefined> = process.env
  if (target === "local") {
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
    env = { ...process.env, ...overlay }
  }
  return env
}

/** Raw `POST /jmap/upload/{accountId}/` (`request.rs:179`) — keeps this e2e independent of the blobs package. */
async function groupwareCalUploadText(
  config: StalwartClientConfig,
  username: string,
  password: string,
): Promise<string> {
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//stalwart-client e2e-${runId}//EN`,
    "BEGIN:VEVENT",
    `UID:e2e-${runId}@example.test`,
    "DTSTAMP:20261024T000000Z",
    "DTSTART:20261026T100000Z",
    "DURATION:PT1H",
    "SUMMARY:E2E parsed event",
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n")
  const url = `${config.baseUrl}/jmap/upload/${encodeURIComponent(aliceAccountId)}/`
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "text/calendar",
      Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`,
    },
    body: ics,
  })
  if (!response.ok) throw new Error(`upload failed: ${response.status} ${await response.text()}`)
  const body = (await response.json()) as { blobId?: string }
  if (typeof body.blobId !== "string") throw new Error(`upload returned no blobId: ${JSON.stringify(body)}`)
  return body.blobId
}

beforeAll(async () => {
  const admin = await stalwartE2eSetup()
  const env = await groupwareCalOverlayEnv()
  const username = env.STALWART_USER_A
  const password = env.STALWART_USER_A_PASSWORD
  if (username === undefined || password === undefined) throw new Error("missing STALWART_USER_A credentials")
  bobEmail = env.STALWART_USER_B ?? ""
  aliceEmail = username
  if (env.STALWART_USER_A_ACCOUNT_ID !== undefined) aliceAccountId = env.STALWART_USER_A_ACCOUNT_ID
  const configured = stalwartClientConfig({ baseUrl: admin.baseUrl, username, password })
  if (!configured.success) throw new Error(`Unable to build the alice config: ${configured.errorMessage}`)
  alice = configured.data
})

afterAll(async () => {
  // Strict reverse-order, best-effort teardown of run-scoped objects only.
  for (const notificationId of created.notificationIds) {
    const removed = await calendarEventNotificationSet({ config: alice, destroy: [notificationId] })
    if (!removed.success) console.warn(`teardown: notification ${notificationId} not removed: ${removed.errorMessage}`)
  }
  if (created.eventId !== undefined) {
    const removed = await calendarEventSet({ config: alice, destroy: [created.eventId] })
    if (!removed.success) console.warn(`teardown: event not removed: ${removed.errorMessage}`)
  }
  if (created.calendarId !== undefined) {
    const removed = await calendarSet({ config: alice, destroy: [created.calendarId] })
    if (!removed.success) console.warn(`teardown: calendar ${calendarName} not removed: ${removed.errorMessage}`)
  }
})

describe("e2e groupwareCal: principals, calendars, events, notifications, identities", () => {
  test(
    "Principal/query finds bob and Principal/get reads him back",
    async () => {
      const q = await principalQuery({ config: alice, filter: { email: bobEmail } })
      if (!q.success) throw new Error(q.errorMessage)
      expect(q.data.ids.length).toBeGreaterThan(0)
      bobPrincipalId = String(q.data.ids[0])
      const g = await principalGet({ config: alice, ids: [bobPrincipalId] })
      if (!g.success) throw new Error(g.errorMessage)
      expect(g.data.list[0]?.email).toBe(bobEmail)
      expect(g.data.notFound).toEqual([])
    },
    { timeout: 30_000 },
  )

  test(
    "Principal/changes and Principal/queryChanges report cannotCalculateChanges",
    async () => {
      // Principals carry no changelog server-side: even the fresh state from
      // Principal/get cannot be diffed (verified against crates/jmap/src/api/request.rs changes path).
      const c = await principalChanges({ config: alice, sinceState: "n" })
      expect(c.success).toBe(false)
      if (!c.success) expect(c.errorMessage).toContain("cannotCalculateChanges")
      const q = await principalQuery({ config: alice, filter: { email: bobEmail } })
      if (!q.success) throw new Error(q.errorMessage)
      const qc = await principalQueryChanges({ config: alice, sinceQueryState: q.data.queryState })
      expect(qc.success).toBe(false)
      if (!qc.success) expect(qc.errorMessage).toContain("cannotCalculateChanges")
    },
    { timeout: 30_000 },
  )

  test(
    "Principal/getAvailability returns a busy-period list for bob",
    async () => {
      const r = await principalGetAvailability({
        config: alice,
        id: bobPrincipalId,
        utcStart: "2026-10-26T00:00:00Z",
        utcEnd: "2026-10-27T00:00:00Z",
      })
      if (!r.success) throw new Error(r.errorMessage)
      expect(Array.isArray(r.data.list)).toBe(true)
    },
    { timeout: 30_000 },
  )

  test(
    "Principal/set is rejected by the server (no Set handler)",
    async () => {
      const r = await principalSet({ config: alice, update: { [bobPrincipalId]: { description: "e2e" } } })
      expect(r.success).toBe(false)
      if (!r.success) expect(JSON.stringify(r)).toContain("notRequest")
    },
    { timeout: 30_000 },
  )

  test(
    "Calendar/set creates a run-scoped calendar",
    async () => {
      const r = await calendarSet({ config: alice, create: { k1: { name: calendarName } } })
      if (!r.success) throw new Error(`create failed: ${r.errorMessage} ${r.errorData ?? ""}`)
      created.calendarId = r.data.created?.k1?.id
      expect(created.calendarId).toBeString()
    },
    { timeout: 30_000 },
  )

  test(
    "Calendar/query finds it and Calendar/get reads it back",
    async () => {
      const q = await calendarQuery({ config: alice })
      if (!q.success) throw new Error(q.errorMessage)
      expect(q.data.ids.map(String)).toContain(created.calendarId as string)
      const g = await calendarGet({ config: alice, ids: [created.calendarId as string] })
      if (!g.success) throw new Error(g.errorMessage)
      expect(g.data.list[0]?.name).toBe(calendarName)
    },
    { timeout: 30_000 },
  )

  test(
    "CalendarEvent/set creates an event with a participant",
    async () => {
      const r = await calendarEventSet({
        config: alice,
        create: {
          e1: {
            calendarIds: { [created.calendarId as string]: true },
            title: `e2e ${runId}`,
            start: "2026-10-26T10:00:00",
            timeZone: "Europe/Berlin",
            duration: "PT1H",
            participants: { p1: { email: `mailto:${bobEmail}` } },
          },
        },
      })
      if (!r.success) throw new Error(`create failed: ${r.errorMessage} ${r.errorData ?? ""}`)
      created.eventId = r.data.created?.e1?.id
      expect(created.eventId).toBeString()
    },
    { timeout: 30_000 },
  )

  test(
    "CalendarEvent/query, queryChanges and changes see the event",
    async () => {
      const q = await calendarEventQuery({ config: alice, filter: { inCalendar: created.calendarId } })
      if (!q.success) throw new Error(q.errorMessage)
      expect(q.data.ids.map(String)).toContain(created.eventId as string)
      const qc = await calendarEventQueryChanges({ config: alice, sinceQueryState: q.data.queryState })
      if (!qc.success) throw new Error(qc.errorMessage)
      expect(typeof qc.data.newQueryState).toBe("string")
      const g = await calendarEventGet({ config: alice, ids: [created.eventId as string] })
      if (!g.success) throw new Error(g.errorMessage)
      expect(g.data.list[0]?.title).toBe(`e2e ${runId}`)
      const state = g.data.state
      if (typeof state !== "string") throw new Error("CalendarEvent/get returned no state")
      const c = await calendarEventChanges({ config: alice, sinceState: state })
      if (!c.success) throw new Error(c.errorMessage)
      expect(c.data.hasMoreChanges).toBe(false)
    },
    { timeout: 30_000 },
  )

  test(
    "CalendarEvent/set renames the event",
    async () => {
      const u = await calendarEventSet({
        config: alice,
        update: { [created.eventId as string]: { title: `e2e ${runId} v2` } },
      })
      if (!u.success) throw new Error(u.errorMessage)
      const g = await calendarEventGet({ config: alice, ids: [created.eventId as string], properties: ["title"] })
      if (!g.success) throw new Error(g.errorMessage)
      expect(g.data.list[0]?.title).toBe(`e2e ${runId} v2`)
    },
    { timeout: 30_000 },
  )

  test(
    "CalendarEvent/parse parses an uploaded .ics blob",
    async () => {
      const env = await groupwareCalOverlayEnv()
      const blobId = await groupwareCalUploadText(alice, env.STALWART_USER_A ?? "", env.STALWART_USER_A_PASSWORD ?? "")
      const r = await calendarEventParse({ config: alice, blobIds: [blobId] })
      if (!r.success) throw new Error(r.errorMessage)
      const entries = r.data.parsed?.[blobId]
      if (entries === undefined) throw new Error(`no parsed entries for blob ${blobId}`)
      expect(entries.length).toBeGreaterThan(0)
      expect(entries[0]?.title).toBe("E2E parsed event")
    },
    { timeout: 30_000 },
  )

  test(
    "CalendarEvent/copy within one account is refused",
    async () => {
      const r = await calendarEventCopy({
        config: alice,
        accountId: aliceAccountId,
        fromAccountId: aliceAccountId,
        create: { [created.eventId as string]: {} },
      })
      expect(r.success).toBe(false)
      if (!r.success) expect(r.errorMessage).toContain("From accountId is equal to fromAccountId")
    },
    { timeout: 30_000 },
  )

  test(
    "CalendarEventNotification/query, get and changes run",
    async () => {
      const q = await calendarEventNotificationQuery({ config: alice })
      if (!q.success) throw new Error(q.errorMessage)
      expect(Array.isArray(q.data.ids)).toBe(true)
      const g = await calendarEventNotificationGet({ config: alice, ids: q.data.ids.map(String) })
      if (!g.success) throw new Error(g.errorMessage)
      for (const notification of g.data.list) {
        if (notification.calendarEventId === created.eventId && !created.notificationIds.includes(notification.id)) {
          created.notificationIds.push(notification.id)
        }
      }
      const state = g.data.state
      if (typeof state !== "string") throw new Error("CalendarEventNotification/get returned no state")
      const c = await calendarEventNotificationChanges({ config: alice, sinceState: state })
      if (!c.success) throw new Error(c.errorMessage)
      expect(c.data.hasMoreChanges).toBe(false)
      const qc = await calendarEventNotificationQueryChanges({ config: alice, sinceQueryState: q.data.queryState })
      if (!qc.success) throw new Error(qc.errorMessage)
      expect(typeof qc.data.newQueryState).toBe("string")
    },
    { timeout: 30_000 },
  )

  test(
    "ParticipantIdentity/get reads the default identity; set/changes pin server limits",
    async () => {
      const g = await participantIdentityGet({ config: alice })
      if (!g.success) throw new Error(g.errorMessage)
      expect(g.data.list.length).toBeGreaterThan(0)
      expect(g.data.list[0]?.calendarAddress).toBe(`mailto:${aliceEmail}`)
      // A new address must belong to the account (set.rs validate_identity_value),
      // and alice has no spare address, so creating a throwaway identity fails.
      const s = await participantIdentitySet({
        config: alice,
        create: { k1: { name: `e2e-${runId}`, calendarAddress: `mailto:e2e-${runId}@example.test` } },
      })
      expect(s.success).toBe(false)
      if (!s.success) expect(s.errorMessage).toContain("Calendar address not configured for this account.")
      // ParticipantIdentity/get carries no state and the store has no changelog.
      const c = await participantIdentityChanges({ config: alice, sinceState: "n" })
      expect(c.success).toBe(false)
      if (!c.success) expect(c.errorMessage).toContain("cannotCalculateChanges")
    },
    { timeout: 30_000 },
  )
})
