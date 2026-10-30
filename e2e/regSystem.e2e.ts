import { afterAll, beforeAll, describe, expect, test } from "bun:test"
import { stalwartClientFromEnv } from "../src/client/stalwartClientFromEnv.js"
import type { StalwartClientConfig } from "../src/client/stalwartClientConfigSchema.js"
import type { PromiseResult } from "#result"
import { actionInvalidateCaches } from "../src/registry/actions/actionInvalidateCaches.js"
import { actionInvalidateNegativeCaches } from "../src/registry/actions/actionInvalidateNegativeCaches.js"
import { actionReloadBlockedIps } from "../src/registry/actions/actionReloadBlockedIps.js"
import { actionReloadSettings } from "../src/registry/actions/actionReloadSettings.js"
import { actionTroubleshootDmarc } from "../src/registry/actions/actionTroubleshootDmarc.js"
import { aiModelQuery } from "../src/registry/system/aiModelQuery.js"
import { aiModelSet } from "../src/registry/system/aiModelSet.js"
import { allowedIpAdd } from "../src/registry/system/allowedIpAdd.js"
import { allowedIpGet } from "../src/registry/system/allowedIpGet.js"
import { allowedIpQuery } from "../src/registry/system/allowedIpQuery.js"
import { allowedIpRemove } from "../src/registry/system/allowedIpRemove.js"
import { applicationGet } from "../src/registry/system/applicationGet.js"
import { applicationQuery } from "../src/registry/system/applicationQuery.js"
import { applicationSet } from "../src/registry/system/applicationSet.js"
import { blockedIpAdd } from "../src/registry/system/blockedIpAdd.js"
import { blockedIpGet } from "../src/registry/system/blockedIpGet.js"
import { blockedIpQuery } from "../src/registry/system/blockedIpQuery.js"
import { blockedIpRemove } from "../src/registry/system/blockedIpRemove.js"
import { bootstrapGet } from "../src/registry/system/bootstrapGet.js"
import { calendarAlarmGet } from "../src/registry/sysGroupware/calendarAlarmGet.js"
import { calendarAlarmSet } from "../src/registry/sysGroupware/calendarAlarmSet.js"
import { calendarSchedulingGet } from "../src/registry/sysGroupware/calendarSchedulingGet.js"
import { calendarSchedulingSet } from "../src/registry/sysGroupware/calendarSchedulingSet.js"
import { clusterNodeGet } from "../src/registry/cluster/clusterNodeGet.js"
import { clusterNodeQuery } from "../src/registry/cluster/clusterNodeQuery.js"
import { clusterRoleGet } from "../src/registry/cluster/clusterRoleGet.js"
import { clusterRoleQuery } from "../src/registry/cluster/clusterRoleQuery.js"
import { coordinatorGet } from "../src/registry/cluster/coordinatorGet.js"
import { enterpriseGet } from "../src/registry/system/enterpriseGet.js"
import { httpFormGet } from "../src/registry/system/httpFormGet.js"
import { httpFormSet } from "../src/registry/system/httpFormSet.js"
import { httpGet } from "../src/registry/system/httpGet.js"
import { imapGet } from "../src/registry/system/imapGet.js"
import { imapSet } from "../src/registry/system/imapSet.js"
import { jmapGet } from "../src/registry/system/jmapGet.js"
import { jmapSet } from "../src/registry/system/jmapSet.js"
import { securityGet } from "../src/registry/system/securityGet.js"
import { sharingGet } from "../src/registry/system/sharingGet.js"
import { sharingSet } from "../src/registry/system/sharingSet.js"
import { sysAddressBookGet } from "../src/registry/sysGroupware/sysAddressBookGet.js"
import { sysAddressBookSet } from "../src/registry/sysGroupware/sysAddressBookSet.js"
import { sysCalendarGet } from "../src/registry/sysGroupware/sysCalendarGet.js"
import { sysCalendarSet } from "../src/registry/sysGroupware/sysCalendarSet.js"
import { sysEmailGet } from "../src/registry/sysGroupware/sysEmailGet.js"
import { sysEmailSet } from "../src/registry/sysGroupware/sysEmailSet.js"
import { systemSettingsGet } from "../src/registry/system/systemSettingsGet.js"
import { taskFailedQuery } from "../src/registry/tasks/taskFailedQuery.js"
import { taskGet } from "../src/registry/tasks/taskGet.js"
import { taskManagerGet } from "../src/registry/tasks/taskManagerGet.js"
import { taskQuery } from "../src/registry/tasks/taskQuery.js"
import { webDavGet } from "../src/registry/system/webDavGet.js"
import { webDavSet } from "../src/registry/system/webDavSet.js"
import { e2eRunId } from "./e2eRunId.js"

/** Same overlay parsing as e2eSetup (copied: e2eSetup.ts must stay untouched). */
async function regSystemE2eSetup(): Promise<StalwartClientConfig> {
  let env: Record<string, string | undefined> = process.env
  if ((process.env.STALWART_E2E_TARGET ?? "live") === "local") {
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
  const configured = stalwartClientFromEnv(env)
  if (!configured.success) throw new Error(`Unable to initialize the e2e config: ${configured.errorMessage}`)
  return configured.data
}

let config: StalwartClientConfig
const runId = e2eRunId()
const allowedAddress = "192.0.2.231"
const blockedAddress = "198.51.100.231"
const appPrefix = `/e2e-${runId}`
const created: { allowedIpId?: string; blockedIpId?: string; applicationId?: string; aiModelId?: string } = {}

function unwrap<T>(label: string, r: PromiseResult<T>): T {
  if (!r.success) throw new Error(`${label} failed: ${r.errorMessage} ${r.errorData ?? ""}`)
  return r.data
}

async function destroyByAddress(
  label: string,
  query: (options: {
    config: StalwartClientConfig
    filter: Record<string, string>
  }) => PromiseResult<{ ids: readonly unknown[] }>,
  remove: (options: { config: StalwartClientConfig; id: string }) => PromiseResult<unknown>,
  address: string,
): Promise<void> {
  const q = await query({ config, filter: { address } })
  if (!q.success) {
    console.warn(`teardown: ${label} query for ${address} failed: ${q.errorMessage}`)
    return
  }
  for (const id of q.data.ids) {
    const r = await remove({ config, id: String(id) })
    if (!r.success) console.warn(`teardown: ${label} ${String(id)} not removed: ${r.errorMessage}`)
  }
}

beforeAll(async () => {
  config = await regSystemE2eSetup()
  // Idempotent re-runs: drop leftovers from an interrupted run first.
  await destroyByAddress("AllowedIp", allowedIpQuery, allowedIpRemove, allowedAddress)
  await destroyByAddress("BlockedIp", blockedIpQuery, blockedIpRemove, blockedAddress)
})

afterAll(async () => {
  // Strict reverse-order, best-effort teardown of run-scoped objects only.
  if (created.aiModelId !== undefined) {
    const r = await aiModelSet({ config, destroy: [created.aiModelId] })
    if (!r.success) console.warn(`teardown: AiModel ${created.aiModelId} not removed: ${r.errorMessage}`)
  }
  if (created.applicationId !== undefined) {
    const r = await applicationSet({ config, destroy: [created.applicationId] })
    if (!r.success) console.warn(`teardown: Application ${created.applicationId} not removed: ${r.errorMessage}`)
  }
  if (created.blockedIpId !== undefined) {
    const r = await blockedIpRemove({ config, id: created.blockedIpId })
    if (!r.success) console.warn(`teardown: BlockedIp ${created.blockedIpId} not removed: ${r.errorMessage}`)
  }
  if (created.allowedIpId !== undefined) {
    const r = await allowedIpRemove({ config, id: created.allowedIpId })
    if (!r.success) console.warn(`teardown: AllowedIp ${created.allowedIpId} not removed: ${r.errorMessage}`)
  }
  await destroyByAddress("AllowedIp", allowedIpQuery, allowedIpRemove, allowedAddress)
  await destroyByAddress("BlockedIp", blockedIpQuery, blockedIpRemove, blockedAddress)
})

async function singletonRoundTrip(
  label: string,
  get: (options: { config: StalwartClientConfig }) => PromiseResult<{ list: readonly unknown[] }>,
  set: (options: { config: StalwartClientConfig; patch: Record<string, unknown> }) => PromiseResult<unknown>,
  field: string,
  next: (current: unknown) => unknown,
): Promise<void> {
  const before = unwrap(`${label} get`, await get({ config }))
  expect(before.list).toHaveLength(1)
  const current = (before.list[0] as Record<string, unknown>)[field]
  const updated = next(current)
  expect(updated).not.toEqual(current)
  unwrap(`${label} set`, await set({ config, patch: { [field]: updated } }))
  const mid = unwrap(`${label} re-get`, await get({ config }))
  expect((mid.list[0] as Record<string, unknown>)[field]).toEqual(updated)
  unwrap(`${label} restore`, await set({ config, patch: { [field]: current } }))
  const after = unwrap(`${label} final get`, await get({ config }))
  expect((after.list[0] as Record<string, unknown>)[field]).toEqual(current)
}

describe("e2e regSystem: read-only singletons", () => {
  test(
    "reads SystemSettings, Http, Security and TaskManager singletons",
    async () => {
      const settings = unwrap("systemSettingsGet", await systemSettingsGet({ config }))
      expect(settings.list[0]?.id).toBe("singleton")
      expect(settings.list[0]?.defaultHostname).toBeString()
      const http = unwrap("httpGet", await httpGet({ config }))
      expect(http.list[0]?.id).toBe("singleton")
      const security = unwrap("securityGet", await securityGet({ config }))
      expect(security.list[0]?.id).toBe("singleton")
      const manager = unwrap("taskManagerGet", await taskManagerGet({ config }))
      expect(manager.list[0]?.id).toBe("singleton")
      expect(manager.list[0]?.alertAfter).toBeNumber()
    },
    { timeout: 30_000 },
  )

  test(
    "reads Bootstrap as notFound and Enterprise plus Coordinator",
    async () => {
      const bootstrap = unwrap("bootstrapGet", await bootstrapGet({ config }))
      expect(bootstrap.list).toHaveLength(0)
      expect(bootstrap.notFound).toEqual(["singleton"])
      const enterprise = unwrap("enterpriseGet", await enterpriseGet({ config }))
      expect(enterprise.list[0]?.id).toBe("singleton")
      const coordinator = unwrap("coordinatorGet", await coordinatorGet({ config }))
      expect(coordinator.list[0]?.id).toBe("singleton")
    },
    { timeout: 30_000 },
  )
})

describe("e2e regSystem: reversible singleton updates", () => {
  test(
    "patches Imap, Jmap, WebDav and Sharing and restores them",
    async () => {
      await singletonRoundTrip("imapSet", imapGet, imapSet, "idleTimeout", () => 1200000)
      await singletonRoundTrip("jmapSet", jmapGet, jmapSet, "maxRequestSize", (v) => (v as number) + 1024)
      await singletonRoundTrip("webDavSet", webDavGet, webDavSet, "maxResults", (v) => (v as number) + 1)
      await singletonRoundTrip("sharingSet", sharingGet, sharingSet, "maxShares", (v) => (v as number) + 1)
    },
    { timeout: 60_000 },
  )

  test(
    "patches groupware and form singletons and restores them",
    async () => {
      const alarm = unwrap("calendarAlarmGet", await calendarAlarmGet({ config }))
      await singletonRoundTrip("calendarAlarmSet", calendarAlarmGet, calendarAlarmSet, "enable", (v) => !(v as boolean))
      expect(alarm.list[0]?.fromName).toBeString()
      await singletonRoundTrip(
        "calendarSchedulingSet",
        calendarSchedulingGet,
        calendarSchedulingSet,
        "maxRecipients",
        (v) => (v as number) + 1,
      )
      await singletonRoundTrip("sysEmailSet", sysEmailGet, sysEmailSet, "maxMessageSize", (v) => (v as number) + 1024)
      await singletonRoundTrip(
        "sysCalendarSet",
        sysCalendarGet,
        sysCalendarSet,
        "maxAttendees",
        (v) => (v as number) + 1,
      )
      await singletonRoundTrip(
        "sysAddressBookSet",
        sysAddressBookGet,
        sysAddressBookSet,
        "maxVCardSize",
        (v) => (v as number) + 1024,
      )
      await singletonRoundTrip("httpFormSet", httpFormGet, httpFormSet, "validateDomain", (v) => !(v as boolean))
    },
    { timeout: 90_000 },
  )
})

describe("e2e regSystem: allowed and blocked IPs", () => {
  test(
    "adds, queries, reads and removes a documentation-range AllowedIp",
    async () => {
      created.allowedIpId = unwrap(
        "allowedIpAdd",
        await allowedIpAdd({ config, address: allowedAddress, reason: `e2e ${runId}` }),
      )
      const q = unwrap("allowedIpQuery", await allowedIpQuery({ config, filter: { address: allowedAddress } }))
      expect(q.ids.map(String)).toContain(created.allowedIpId)
      const g = unwrap("allowedIpGet", await allowedIpGet({ config, ids: [created.allowedIpId] }))
      expect(g.list[0]?.address).toBe(allowedAddress)
      unwrap("allowedIpRemove", await allowedIpRemove({ config, id: created.allowedIpId }))
      created.allowedIpId = undefined
      const gone = unwrap("allowedIpQuery", await allowedIpQuery({ config, filter: { address: allowedAddress } }))
      expect(gone.ids).toHaveLength(0)
    },
    { timeout: 30_000 },
  )

  test(
    "adds, queries, reads and removes a documentation-range BlockedIp",
    async () => {
      created.blockedIpId = unwrap(
        "blockedIpAdd",
        await blockedIpAdd({ config, address: blockedAddress, reason: "manual" }),
      )
      const q = unwrap("blockedIpQuery", await blockedIpQuery({ config, filter: { address: blockedAddress } }))
      expect(q.ids.map(String)).toContain(created.blockedIpId)
      const g = unwrap("blockedIpGet", await blockedIpGet({ config, ids: [created.blockedIpId] }))
      expect(g.list[0]?.address).toBe(blockedAddress)
      unwrap("blockedIpRemove", await blockedIpRemove({ config, id: created.blockedIpId }))
      created.blockedIpId = undefined
      const gone = unwrap("blockedIpQuery", await blockedIpQuery({ config, filter: { address: blockedAddress } }))
      expect(gone.ids).toHaveLength(0)
    },
    { timeout: 30_000 },
  )
})

describe("e2e regSystem: safe actions", () => {
  test(
    "runs ReloadSettings, InvalidateCaches, InvalidateNegativeCaches and ReloadBlockedIps",
    async () => {
      for (const [label, run] of [
        ["ReloadSettings", actionReloadSettings],
        ["InvalidateCaches", actionInvalidateCaches],
        ["InvalidateNegativeCaches", actionInvalidateNegativeCaches],
        ["ReloadBlockedIps", actionReloadBlockedIps],
      ] as const) {
        const id = unwrap(label, await run({ config }))
        expect(id).toBeString()
      }
    },
    { timeout: 30_000 },
  )

  test(
    "troubleshoots DMARC for a local domain",
    async () => {
      const result = unwrap(
        "TroubleshootDmarc",
        await actionTroubleshootDmarc({
          config,
          ehloDomain: "mail.example.test",
          mailFrom: "alice@example.test",
          remoteIp: "127.0.0.1",
          spfEhloDomain: "example.test",
          spfMailFromDomain: "example.test",
          rcptTo: { "alice@example.test": true },
        }),
      )
      expect(result.dmarcPolicy).toBeString()
      expect(result.elapsed).toBeNumber()
    },
    { timeout: 30_000 },
  )
})

describe("e2e regSystem: tasks and cluster", () => {
  test(
    "queries and reads tasks including the failed view",
    async () => {
      const q = unwrap("taskQuery", await taskQuery({ config, limit: 10 }))
      expect(Array.isArray(q.ids)).toBe(true)
      if (q.ids.length > 0) {
        const g = unwrap("taskGet", await taskGet({ config, ids: [String(q.ids[0])] }))
        expect(g.list[0]?.id).toBe(String(q.ids[0]))
      }
      const failed = unwrap("taskFailedQuery", await taskFailedQuery({ config, limit: 10 }))
      expect(Array.isArray(failed.ids)).toBe(true)
    },
    { timeout: 30_000 },
  )

  test(
    "queries and reads cluster nodes and roles",
    async () => {
      const nodes = unwrap("clusterNodeQuery", await clusterNodeQuery({ config, limit: 10 }))
      expect(nodes.ids.length).toBeGreaterThan(0)
      const node = unwrap("clusterNodeGet", await clusterNodeGet({ config, ids: [String(nodes.ids[0])] }))
      expect(node.list[0]?.hostname).toBeString()
      const roles = unwrap("clusterRoleQuery", await clusterRoleQuery({ config, limit: 10 }))
      expect(Array.isArray(roles.ids)).toBe(true)
      if (roles.ids.length > 0) {
        const role = unwrap("clusterRoleGet", await clusterRoleGet({ config, ids: [String(roles.ids[0])] }))
        expect(role.list[0]?.id).toBe(String(roles.ids[0]))
      }
    },
    { timeout: 30_000 },
  )
})

describe("e2e regSystem: applications and AI models", () => {
  test(
    "creates and destroys a disabled application",
    async () => {
      const set = unwrap(
        "applicationSet",
        await applicationSet({
          config,
          create: {
            a1: {
              description: `e2e ${runId}`,
              enable: false,
              resourceUrl: "https://example.test/app.tar.gz",
              urlPrefix: { [appPrefix]: true },
            },
          },
        }),
      )
      created.applicationId = set.created?.a1?.id
      expect(created.applicationId).toBeString()
      const q = unwrap("applicationQuery", await applicationQuery({ config }))
      expect(q.ids.map(String)).toContain(created.applicationId as string)
      const g = unwrap("applicationGet", await applicationGet({ config, ids: [created.applicationId as string] }))
      expect(g.list[0]?.enable).toBe(false)
      unwrap("applicationSet destroy", await applicationSet({ config, destroy: [created.applicationId as string] }))
      created.applicationId = undefined
    },
    { timeout: 30_000 },
  )

  test(
    "creates and destroys an AI model",
    async () => {
      const set = unwrap(
        "aiModelSet",
        await aiModelSet({
          config,
          create: {
            a1: {
              "@type": "OpenAi",
              allowInvalidCerts: false,
              logprobs: false,
              httpHeaders: {},
              model: "probe",
              name: `e2e-${runId}`,
              url: "https://example.test/v1",
            },
          },
        }),
      )
      created.aiModelId = set.created?.a1?.id
      expect(created.aiModelId).toBeString()
      const q = unwrap("aiModelQuery", await aiModelQuery({ config }))
      expect(q.ids.map(String)).toContain(created.aiModelId as string)
      unwrap("aiModelSet destroy", await aiModelSet({ config, destroy: [created.aiModelId as string] }))
      created.aiModelId = undefined
    },
    { timeout: 30_000 },
  )
})
