import { afterEach, describe, expect, test } from "bun:test"
import { buildApplication, buildRouteMap, run } from "@stricli/core"
import { stalwartClientConfig } from "../src/client/stalwartClientConfig.js"
import type { StalwartClientConfig } from "../src/client/stalwartClientConfigSchema.js"
import { actionsCommands } from "../src/registry/actions/cli/actionsCommands.js"
import { actionClassifySpam } from "../src/registry/actions/actionClassifySpam.js"
import { actionGet } from "../src/registry/actions/actionGet.js"
import { actionInvalidateCaches } from "../src/registry/actions/actionInvalidateCaches.js"
import { actionInvalidateNegativeCaches } from "../src/registry/actions/actionInvalidateNegativeCaches.js"
import { actionPauseMtaQueue } from "../src/registry/actions/actionPauseMtaQueue.js"
import { actionReloadBlockedIps } from "../src/registry/actions/actionReloadBlockedIps.js"
import { actionReloadLookupStores } from "../src/registry/actions/actionReloadLookupStores.js"
import { actionReloadSettings } from "../src/registry/actions/actionReloadSettings.js"
import { actionReloadTlsCertificates } from "../src/registry/actions/actionReloadTlsCertificates.js"
import { actionResumeMtaQueue } from "../src/registry/actions/actionResumeMtaQueue.js"
import { actionRun } from "../src/registry/actions/actionRun.js"
import { actionSet } from "../src/registry/actions/actionSet.js"
import { actionTroubleshootDmarc } from "../src/registry/actions/actionTroubleshootDmarc.js"
import { actionUpdateApps } from "../src/registry/actions/actionUpdateApps.js"
import { clusterCommands } from "../src/registry/cluster/cli/clusterCommands.js"
import { clusterNodeGet } from "../src/registry/cluster/clusterNodeGet.js"
import { clusterNodeQuery } from "../src/registry/cluster/clusterNodeQuery.js"
import { clusterRoleGet } from "../src/registry/cluster/clusterRoleGet.js"
import { clusterRoleQuery } from "../src/registry/cluster/clusterRoleQuery.js"
import { clusterRoleSet } from "../src/registry/cluster/clusterRoleSet.js"
import { coordinatorGet } from "../src/registry/cluster/coordinatorGet.js"
import { coordinatorSet } from "../src/registry/cluster/coordinatorSet.js"
import { systemCommands } from "../src/registry/system/cli/systemCommands.js"
import { aiModelGet } from "../src/registry/system/aiModelGet.js"
import { aiModelQuery } from "../src/registry/system/aiModelQuery.js"
import { aiModelSet } from "../src/registry/system/aiModelSet.js"
import { allowedIpAdd } from "../src/registry/system/allowedIpAdd.js"
import { allowedIpGet } from "../src/registry/system/allowedIpGet.js"
import { allowedIpQuery } from "../src/registry/system/allowedIpQuery.js"
import { allowedIpRemove } from "../src/registry/system/allowedIpRemove.js"
import { allowedIpSet } from "../src/registry/system/allowedIpSet.js"
import { applicationGet } from "../src/registry/system/applicationGet.js"
import { applicationQuery } from "../src/registry/system/applicationQuery.js"
import { applicationSet } from "../src/registry/system/applicationSet.js"
import { blockedIpAdd } from "../src/registry/system/blockedIpAdd.js"
import { blockedIpGet } from "../src/registry/system/blockedIpGet.js"
import { blockedIpQuery } from "../src/registry/system/blockedIpQuery.js"
import { blockedIpRemove } from "../src/registry/system/blockedIpRemove.js"
import { blockedIpSet } from "../src/registry/system/blockedIpSet.js"
import { bootstrapGet } from "../src/registry/system/bootstrapGet.js"
import { bootstrapSet } from "../src/registry/system/bootstrapSet.js"
import { enterpriseGet } from "../src/registry/system/enterpriseGet.js"
import { enterpriseSet } from "../src/registry/system/enterpriseSet.js"
import { httpFormGet } from "../src/registry/system/httpFormGet.js"
import { httpFormSet } from "../src/registry/system/httpFormSet.js"
import { httpGet } from "../src/registry/system/httpGet.js"
import { httpSet } from "../src/registry/system/httpSet.js"
import { imapGet } from "../src/registry/system/imapGet.js"
import { imapSet } from "../src/registry/system/imapSet.js"
import { jmapGet } from "../src/registry/system/jmapGet.js"
import { jmapSet } from "../src/registry/system/jmapSet.js"
import { securityGet } from "../src/registry/system/securityGet.js"
import { securitySet } from "../src/registry/system/securitySet.js"
import { sharingGet } from "../src/registry/system/sharingGet.js"
import { sharingSet } from "../src/registry/system/sharingSet.js"
import { systemSettingsGet } from "../src/registry/system/systemSettingsGet.js"
import { systemSettingsSet } from "../src/registry/system/systemSettingsSet.js"
import { webDavGet } from "../src/registry/system/webDavGet.js"
import { webDavSet } from "../src/registry/system/webDavSet.js"
import { sysGroupwareCommands } from "../src/registry/sysGroupware/cli/sysGroupwareCommands.js"
import { calendarAlarmGet } from "../src/registry/sysGroupware/calendarAlarmGet.js"
import { calendarAlarmSet } from "../src/registry/sysGroupware/calendarAlarmSet.js"
import { calendarSchedulingGet } from "../src/registry/sysGroupware/calendarSchedulingGet.js"
import { calendarSchedulingSet } from "../src/registry/sysGroupware/calendarSchedulingSet.js"
import { sysAddressBookGet } from "../src/registry/sysGroupware/sysAddressBookGet.js"
import { sysAddressBookSet } from "../src/registry/sysGroupware/sysAddressBookSet.js"
import { sysCalendarGet } from "../src/registry/sysGroupware/sysCalendarGet.js"
import { sysCalendarSet } from "../src/registry/sysGroupware/sysCalendarSet.js"
import { sysEmailGet } from "../src/registry/sysGroupware/sysEmailGet.js"
import { sysEmailSet } from "../src/registry/sysGroupware/sysEmailSet.js"
import { metadataGet } from "../src/registry/sysGroupware/metadataGet.js"
import { metadataSet } from "../src/registry/sysGroupware/metadataSet.js"
import { tasksCommands } from "../src/registry/tasks/cli/tasksCommands.js"
import { taskFailedQuery } from "../src/registry/tasks/taskFailedQuery.js"
import { taskGet } from "../src/registry/tasks/taskGet.js"
import { taskManagerGet } from "../src/registry/tasks/taskManagerGet.js"
import { taskManagerSet } from "../src/registry/tasks/taskManagerSet.js"
import { taskQuery } from "../src/registry/tasks/taskQuery.js"
import { taskSet } from "../src/registry/tasks/taskSet.js"
import { fetchMockCreate, fetchMockJson } from "./fetchMock.js"
import { jmapTestSessionCreate } from "./jmapTestSession.js"

const config = stalwartClientConfig({ baseUrl: "https://mail.example.com", username: "admin", password: "pw" })
if (!config.success) throw new Error("fixture config invalid")

type SentCall = { using: string[]; methodCalls: [string, Record<string, unknown>, string][] }

function regSystemMock(...methodResponses: [string, Record<string, unknown>][]) {
  const sent: SentCall[] = []
  let call = 0
  const mock = fetchMockCreate((request) => {
    if (new URL(request.url).pathname === "/jmap/session") return fetchMockJson(jmapTestSessionCreate())
    sent.push(JSON.parse(String(request.body)) as SentCall)
    const response = methodResponses[Math.min(call, methodResponses.length - 1)] as [string, Record<string, unknown>]
    call += 1
    return fetchMockJson({ methodResponses: [[...response, "c0"]], sessionState: "1" })
  })
  return { mock, sent }
}

describe("regSystem singleton getters send x:<T>/get with the singleton id", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  const cases = [
    { label: "systemSettingsGet", fn: systemSettingsGet, method: "x:SystemSettings/get", key: "defaultHostname" },
    { label: "httpGet", fn: httpGet, method: "x:Http/get", key: "clientIpSource" },
    { label: "httpFormGet", fn: httpFormGet, method: "x:HttpForm/get", key: "enable" },
    { label: "imapGet", fn: imapGet, method: "x:Imap/get", key: "idleTimeout" },
    { label: "jmapGet", fn: jmapGet, method: "x:Jmap/get", key: "maxRequestSize" },
    { label: "webDavGet", fn: webDavGet, method: "x:WebDav/get", key: "maxResults" },
    { label: "securityGet", fn: securityGet, method: "x:Security/get", key: "scanBanPaths" },
    { label: "sharingGet", fn: sharingGet, method: "x:Sharing/get", key: "maxShares" },
    { label: "enterpriseGet", fn: enterpriseGet, method: "x:Enterprise/get", key: "logo" },
    { label: "bootstrapGet", fn: bootstrapGet, method: "x:Bootstrap/get", key: "defaultDomain" },
    { label: "coordinatorGet", fn: coordinatorGet, method: "x:Coordinator/get", key: "@type" },
    { label: "taskManagerGet", fn: taskManagerGet, method: "x:TaskManager/get", key: "alertAfter" },
    { label: "sysEmailGet", fn: sysEmailGet, method: "x:Email/get", key: "maxMessageSize" },
    { label: "sysCalendarGet", fn: sysCalendarGet, method: "x:Calendar/get", key: "maxAttendees" },
    { label: "calendarAlarmGet", fn: calendarAlarmGet, method: "x:CalendarAlarm/get", key: "enable" },
    { label: "calendarSchedulingGet", fn: calendarSchedulingGet, method: "x:CalendarScheduling/get", key: "enable" },
    { label: "sysAddressBookGet", fn: sysAddressBookGet, method: "x:AddressBook/get", key: "maxVCardSize" },
    { label: "metadataGet", fn: metadataGet, method: "x:Metadata/get", key: "maxEntries" },
  ] as const

  for (const { label, fn, method, key } of cases) {
    test(`${label} sends ${method} with ids ["singleton"]`, async () => {
      const m = regSystemMock([method, { list: [{ id: "singleton", [key]: "seen" }], notFound: [] }])
      mock = m.mock
      const call = fn as (options: { config: StalwartClientConfig }) => Promise<{ success: boolean; data?: unknown }>
      const r = await call({ config: config.data })
      expect(r.success).toBe(true)
      expect(m.sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
      expect(m.sent[0]?.methodCalls[0]?.[0]).toBe(method)
      expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({ ids: ["singleton"] })
    })
  }

  test("systemSettingsGet forwards an explicit properties list", async () => {
    const m = regSystemMock(["x:SystemSettings/get", { list: [{ id: "singleton" }], notFound: [] }])
    mock = m.mock
    const r = await systemSettingsGet({ config: config.data, properties: ["defaultHostname"] })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({ ids: ["singleton"], properties: ["defaultHostname"] })
  })

  test("systemSettingsGet rejects an invalid config without a request", async () => {
    const m = regSystemMock(["x:SystemSettings/get", {}])
    mock = m.mock
    const r = await systemSettingsGet({ config: { baseUrl: "not a url" } })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("systemSettingsGet")
    expect(m.sent).toHaveLength(0)
  })
})

describe("regSystem singleton setters patch update.singleton", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  const cases = [
    { label: "systemSettingsSet", fn: systemSettingsSet, method: "x:SystemSettings/set" },
    { label: "httpSet", fn: httpSet, method: "x:Http/set" },
    { label: "httpFormSet", fn: httpFormSet, method: "x:HttpForm/set" },
    { label: "imapSet", fn: imapSet, method: "x:Imap/set" },
    { label: "jmapSet", fn: jmapSet, method: "x:Jmap/set" },
    { label: "webDavSet", fn: webDavSet, method: "x:WebDav/set" },
    { label: "securitySet", fn: securitySet, method: "x:Security/set" },
    { label: "sharingSet", fn: sharingSet, method: "x:Sharing/set" },
    { label: "enterpriseSet", fn: enterpriseSet, method: "x:Enterprise/set" },
    { label: "bootstrapSet", fn: bootstrapSet, method: "x:Bootstrap/set" },
    { label: "coordinatorSet", fn: coordinatorSet, method: "x:Coordinator/set" },
    { label: "taskManagerSet", fn: taskManagerSet, method: "x:TaskManager/set" },
    { label: "sysEmailSet", fn: sysEmailSet, method: "x:Email/set" },
    { label: "sysCalendarSet", fn: sysCalendarSet, method: "x:Calendar/set" },
    { label: "calendarAlarmSet", fn: calendarAlarmSet, method: "x:CalendarAlarm/set" },
    { label: "calendarSchedulingSet", fn: calendarSchedulingSet, method: "x:CalendarScheduling/set" },
    { label: "sysAddressBookSet", fn: sysAddressBookSet, method: "x:AddressBook/set" },
  ] as const

  for (const { label, fn, method } of cases) {
    test(`${label} sends ${method} with update.singleton`, async () => {
      const m = regSystemMock([method, { updated: { singleton: null } }])
      mock = m.mock
      const call = fn as (options: {
        config: StalwartClientConfig
        patch: Record<string, unknown>
      }) => Promise<{ success: boolean }>
      const r = await call({ config: config.data, patch: { probe: true } })
      expect(r.success).toBe(true)
      expect(m.sent[0]?.methodCalls[0]?.[0]).toBe(method)
      expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({ update: { singleton: { probe: true } } })
    })
  }

  test("imapSet turns a notUpdated entry into a ResultErr carrying the set response", async () => {
    const m = regSystemMock([
      "x:Imap/set",
      { notUpdated: { singleton: { type: "invalidPatch", description: "bad path" } } },
    ])
    mock = m.mock
    const r = await imapSet({ config: config.data, patch: { "nope/deep": 1 } })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.op).toBe("imapSet")
      expect(r.errorMessage).toContain("invalidPatch")
      expect(JSON.parse(r.errorData ?? "{}").notUpdated.singleton.type).toBe("invalidPatch")
    }
  })

  test("sysEmailSet turns a notUpdated entry into a ResultErr", async () => {
    const m = regSystemMock(["x:Email/set", { notUpdated: { singleton: { type: "forbidden" } } }])
    mock = m.mock
    const r = await sysEmailSet({ config: config.data, patch: { maxMessageSize: -1 } })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("sysEmailSet")
  })
})

describe("regSystem object get/query/set wrappers", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("allowedIpGet sends x:AllowedIp/get with explicit ids", async () => {
    const m = regSystemMock(["x:AllowedIp/get", { list: [{ id: "a1", address: "192.0.2.1" }], notFound: [] }])
    mock = m.mock
    const r = await allowedIpGet({ config: config.data, ids: ["a1"] })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.list[0]?.address).toBe("192.0.2.1")
    expect(m.sent[0]?.methodCalls[0]).toEqual(["x:AllowedIp/get", { ids: ["a1"] }, expect.any(String)])
  })

  test("allowedIpQuery passes filter and limit through", async () => {
    const m = regSystemMock(["x:AllowedIp/query", { ids: ["a1"], queryState: "s" }])
    mock = m.mock
    const r = await allowedIpQuery({ config: config.data, filter: { address: "192.0.2.1" }, limit: 10 })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.ids).toEqual(["a1"])
    expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({ filter: { address: "192.0.2.1" }, limit: 10 })
  })

  test("allowedIpSet turns a notCreated entry into a ResultErr", async () => {
    const m = regSystemMock([
      "x:AllowedIp/set",
      { notCreated: { a1: { type: "invalidProperties", description: "bad address" } } },
    ])
    mock = m.mock
    const r = await allowedIpSet({ config: config.data, create: { a1: { address: "nope" } } })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.op).toBe("allowedIpSet")
      expect(r.errorMessage).toContain("invalidProperties")
    }
  })

  test("blockedIpGet sends x:BlockedIp/get with explicit ids", async () => {
    const m = regSystemMock(["x:BlockedIp/get", { list: [{ id: "b1", address: "198.51.100.7" }], notFound: [] }])
    mock = m.mock
    const r = await blockedIpGet({ config: config.data, ids: ["b1"] })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.list[0]?.address).toBe("198.51.100.7")
    expect(m.sent[0]?.methodCalls[0]?.[0]).toBe("x:BlockedIp/get")
  })

  test("blockedIpQuery passes filter and limit through", async () => {
    const m = regSystemMock(["x:BlockedIp/query", { ids: [], queryState: "s" }])
    mock = m.mock
    const r = await blockedIpQuery({ config: config.data, filter: { address: "198.51.100.7" } })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({ filter: { address: "198.51.100.7" } })
  })

  test("blockedIpSet turns a notDestroyed entry into a ResultErr", async () => {
    const m = regSystemMock(["x:BlockedIp/set", { notDestroyed: { b1: { type: "notFound" } } }])
    mock = m.mock
    const r = await blockedIpSet({ config: config.data, destroy: ["b1"] })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("blockedIpSet")
  })

  test("applicationGet sends x:Application/get and applicationQuery lists ids", async () => {
    const m = regSystemMock(
      ["x:Application/get", { list: [{ id: "w1", description: "app" }], notFound: [] }],
      ["x:Application/query", { ids: ["w1"], queryState: "s" }],
    )
    mock = m.mock
    const g = await applicationGet({ config: config.data, ids: ["w1"] })
    expect(g.success).toBe(true)
    expect(m.sent[0]?.methodCalls[0]?.[0]).toBe("x:Application/get")
    const q = await applicationQuery({ config: config.data })
    expect(q.success).toBe(true)
    expect(m.sent[1]?.methodCalls[0]?.[1]).toEqual({})
  })

  test("applicationSet turns a notCreated entry into a ResultErr", async () => {
    const m = regSystemMock(["x:Application/set", { notCreated: { a1: { type: "invalidProperties" } } }])
    mock = m.mock
    const r = await applicationSet({ config: config.data, create: { a1: { description: "x" } } })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("applicationSet")
  })

  test("aiModelGet sends x:AiModel/get and aiModelQuery lists ids", async () => {
    const m = regSystemMock(
      ["x:AiModel/get", { list: [{ id: "m1", name: "llm" }], notFound: [] }],
      ["x:AiModel/query", { ids: ["m1"], queryState: "s" }],
    )
    mock = m.mock
    const g = await aiModelGet({ config: config.data, ids: ["m1"] })
    expect(g.success).toBe(true)
    expect(m.sent[0]?.methodCalls[0]?.[0]).toBe("x:AiModel/get")
    const q = await aiModelQuery({ config: config.data, filter: { name: "llm" } })
    expect(q.success).toBe(true)
    expect(m.sent[1]?.methodCalls[0]?.[1]).toEqual({ filter: { name: "llm" } })
  })

  test("aiModelSet turns a notCreated entry into a ResultErr", async () => {
    const m = regSystemMock(["x:AiModel/set", { notCreated: { a1: { type: "invalidProperties" } } }])
    mock = m.mock
    const r = await aiModelSet({ config: config.data, create: { a1: { name: "x" } } })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("aiModelSet")
  })

  test("allowedIpQuery rejects an invalid filter without a request", async () => {
    const m = regSystemMock(["x:AllowedIp/query", {}])
    mock = m.mock
    const r = await allowedIpQuery({ config: config.data, filter: { address: ["not-a-scalar"] } as never })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("allowedIpQuery")
    expect(m.sent).toHaveLength(0)
  })
})

describe("regSystem IP conveniences", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("allowedIpAdd creates one entry and returns its id", async () => {
    const m = regSystemMock(["x:AllowedIp/set", { created: { a1: { id: "a9" } } }])
    mock = m.mock
    const r = await allowedIpAdd({ config: config.data, address: "192.0.2.9", reason: "e2e" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toBe("a9")
    expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({ create: { a1: { address: "192.0.2.9", reason: "e2e" } } })
  })

  test("allowedIpAdd rejects an empty address without a request", async () => {
    const m = regSystemMock(["x:AllowedIp/set", {}])
    mock = m.mock
    const r = await allowedIpAdd({ config: config.data, address: "" })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("allowedIpAdd")
    expect(m.sent).toHaveLength(0)
  })

  test("allowedIpRemove destroys the entry by id", async () => {
    const m = regSystemMock(["x:AllowedIp/set", { destroyed: ["a9"] }])
    mock = m.mock
    const r = await allowedIpRemove({ config: config.data, id: "a9" })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({ destroy: ["a9"] })
  })

  test("blockedIpAdd creates one entry with a reason and returns its id", async () => {
    const m = regSystemMock(["x:BlockedIp/set", { created: { a1: { id: "b9" } } }])
    mock = m.mock
    const r = await blockedIpAdd({ config: config.data, address: "198.51.100.9", reason: "manual" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toBe("b9")
    expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({
      create: { a1: { address: "198.51.100.9", reason: "manual" } },
    })
  })

  test("blockedIpAdd rejects an unknown reason without a request", async () => {
    const m = regSystemMock(["x:BlockedIp/set", {}])
    mock = m.mock
    const r = await blockedIpAdd({ config: config.data, address: "198.51.100.9", reason: "nope" as never })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("blockedIpAdd")
    expect(m.sent).toHaveLength(0)
  })

  test("blockedIpRemove destroys the entry by id", async () => {
    const m = regSystemMock(["x:BlockedIp/set", { destroyed: ["b9"] }])
    mock = m.mock
    const r = await blockedIpRemove({ config: config.data, id: "b9" })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({ destroy: ["b9"] })
  })
})

describe("regSystem actions", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("actionGet sends x:Action/get with explicit ids", async () => {
    const m = regSystemMock(["x:Action/get", { list: [{ id: "x1", "@type": "ReloadSettings" }], notFound: [] }])
    mock = m.mock
    const r = await actionGet({ config: config.data, ids: ["x1"] })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({ ids: ["x1"] })
  })

  test("actionSet passes creates through (updates/destroys fail server-side)", async () => {
    const m = regSystemMock(["x:Action/set", { created: { a1: { id: "x9" } } }])
    mock = m.mock
    const r = await actionSet({ config: config.data, create: { a1: { "@type": "InvalidateCaches" } } })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({ create: { a1: { "@type": "InvalidateCaches" } } })
  })

  test("actionSet surfaces a rejected update as a ResultErr", async () => {
    const m = regSystemMock(["x:Action/set", { notUpdated: { x1: { type: "invalidPatch", description: "nope" } } }])
    mock = m.mock
    const r = await actionSet({ config: config.data, update: { x1: { "@type": "ReloadSettings" } } })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("actionSet")
  })

  test("actionRun creates the action and returns its id", async () => {
    const m = regSystemMock(["x:Action/set", { created: { a1: { id: "x9" } } }])
    mock = m.mock
    const r = await actionRun({ config: config.data, action: { "@type": "ReloadSettings" } })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toBe("x9")
    expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({ create: { a1: { "@type": "ReloadSettings" } } })
  })

  test("actionRun rejects an unknown @type without a request", async () => {
    const m = regSystemMock(["x:Action/set", {}])
    mock = m.mock
    const r = await actionRun({ config: config.data, action: { "@type": "Nope" } as never })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("actionRun")
    expect(m.sent).toHaveLength(0)
  })

  const shortcuts = [
    { label: "actionReloadSettings", fn: actionReloadSettings, type: "ReloadSettings" },
    { label: "actionReloadTlsCertificates", fn: actionReloadTlsCertificates, type: "ReloadTlsCertificates" },
    { label: "actionReloadLookupStores", fn: actionReloadLookupStores, type: "ReloadLookupStores" },
    { label: "actionReloadBlockedIps", fn: actionReloadBlockedIps, type: "ReloadBlockedIps" },
    { label: "actionUpdateApps", fn: actionUpdateApps, type: "UpdateApps" },
    { label: "actionInvalidateCaches", fn: actionInvalidateCaches, type: "InvalidateCaches" },
    { label: "actionInvalidateNegativeCaches", fn: actionInvalidateNegativeCaches, type: "InvalidateNegativeCaches" },
    { label: "actionPauseMtaQueue", fn: actionPauseMtaQueue, type: "PauseMtaQueue" },
    { label: "actionResumeMtaQueue", fn: actionResumeMtaQueue, type: "ResumeMtaQueue" },
  ] as const

  for (const { label, fn, type } of shortcuts) {
    test(`${label} runs the ${type} action`, async () => {
      const m = regSystemMock(["x:Action/set", { created: { a1: { id: "x1" } } }])
      mock = m.mock
      const call = fn as (options: { config: StalwartClientConfig }) => Promise<{ success: boolean; data?: unknown }>
      const r = await call({ config: config.data })
      expect(r.success).toBe(true)
      if (r.success) expect(r.data).toBe("x1")
      expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({ create: { a1: { "@type": type } } })
    })
  }

  test("actionTroubleshootDmarc sends the envelope and returns the diagnostic result", async () => {
    const m = regSystemMock(["x:Action/set", { created: { a1: { dmarcPass: false, elapsed: 12 } } }])
    mock = m.mock
    const r = await actionTroubleshootDmarc({
      config: config.data,
      ehloDomain: "mail.example.test",
      mailFrom: "alice@example.test",
      remoteIp: "192.0.2.10",
      spfEhloDomain: "example.test",
      spfMailFromDomain: "example.test",
      rcptTo: { "bob@example.test": true },
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.elapsed).toBe(12)
    const sent = m.sent[0]?.methodCalls[0]?.[1] as { create: { a1: Record<string, unknown> } }
    expect(sent.create.a1["@type"]).toBe("TroubleshootDmarc")
    expect(sent.create.a1["mailFrom"]).toBe("alice@example.test")
  })

  test("actionTroubleshootDmarc rejects a missing envelope without a request", async () => {
    const m = regSystemMock(["x:Action/set", {}])
    mock = m.mock
    const r = await actionTroubleshootDmarc({ config: config.data, ehloDomain: "x" } as never)
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("actionTroubleshootDmarc")
    expect(m.sent).toHaveLength(0)
  })

  test("actionClassifySpam sends the message and returns the classification", async () => {
    const m = regSystemMock(["x:Action/set", { created: { a1: { result: "ham", score: 0 } } }])
    mock = m.mock
    const r = await actionClassifySpam({
      config: config.data,
      ehloDomain: "mail.example.test",
      envFrom: "alice@example.test",
      envRcptTo: { "bob@example.test": true },
      message: "Subject: hi\r\n\r\nhello",
      remoteIp: "192.0.2.10",
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.score).toBe(0)
    const sent = m.sent[0]?.methodCalls[0]?.[1] as { create: { a1: Record<string, unknown> } }
    expect(sent.create.a1["@type"]).toBe("ClassifySpam")
    expect(sent.create.a1["message"]).toBe("Subject: hi\r\n\r\nhello")
  })
})

describe("regSystem cluster and tasks", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("clusterNodeQuery lists node ids", async () => {
    const m = regSystemMock(["x:ClusterNode/query", { ids: ["a", "b"], queryState: "s" }])
    mock = m.mock
    const r = await clusterNodeQuery({ config: config.data, limit: 5 })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.ids).toEqual(["a", "b"])
    expect(m.sent[0]?.methodCalls[0]?.[0]).toBe("x:ClusterNode/query")
  })

  test("clusterNodeGet fetches nodes by id", async () => {
    const m = regSystemMock(["x:ClusterNode/get", { list: [{ id: "a", hostname: "n1" }], notFound: [] }])
    mock = m.mock
    const r = await clusterNodeGet({ config: config.data, ids: ["a"] })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.list[0]?.hostname).toBe("n1")
  })

  test("clusterRoleGet sends x:ClusterRole/get and clusterRoleQuery lists ids", async () => {
    const m = regSystemMock(
      ["x:ClusterRole/get", { list: [], notFound: [] }],
      ["x:ClusterRole/query", { ids: [], queryState: "s" }],
    )
    mock = m.mock
    const g = await clusterRoleGet({ config: config.data })
    expect(g.success).toBe(true)
    expect(m.sent[0]?.methodCalls[0]?.[0]).toBe("x:ClusterRole/get")
    const q = await clusterRoleQuery({ config: config.data })
    expect(q.success).toBe(true)
    expect(m.sent[1]?.methodCalls[0]?.[0]).toBe("x:ClusterRole/query")
  })

  test("clusterRoleSet turns a notCreated entry into a ResultErr", async () => {
    const m = regSystemMock(["x:ClusterRole/set", { notCreated: { a1: { type: "invalidProperties" } } }])
    mock = m.mock
    const r = await clusterRoleSet({ config: config.data, create: { a1: { name: "x" } } })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("clusterRoleSet")
  })

  test("taskGet fetches tasks by id", async () => {
    const m = regSystemMock(["x:Task/get", { list: [], notFound: ["t1"] }])
    mock = m.mock
    const r = await taskGet({ config: config.data, ids: ["t1"] })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.methodCalls[0]).toEqual(["x:Task/get", { ids: ["t1"] }, expect.any(String)])
  })

  test("taskQuery only forwards due/status/type filters and due sorting", async () => {
    const m = regSystemMock(["x:Task/query", { ids: [], queryState: "s" }])
    mock = m.mock
    const r = await taskQuery({
      config: config.data,
      filter: { status: "Pending", type: "DkimManagement" },
      sort: [{ property: "due", isAscending: true }],
      limit: 5,
    })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({
      filter: { status: "Pending", type: "DkimManagement" },
      sort: [{ property: "due", isAscending: true }],
      limit: 5,
    })
  })

  test("taskQuery rejects an unsupported sort property without a request", async () => {
    const m = regSystemMock(["x:Task/query", {}])
    mock = m.mock
    const r = await taskQuery({ config: config.data, sort: [{ property: "name" }] } as never)
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("taskQuery")
    expect(m.sent).toHaveLength(0)
  })

  test("taskFailedQuery forces status Failed and keeps extra constraints", async () => {
    const m = regSystemMock(["x:Task/query", { ids: [], queryState: "s" }])
    mock = m.mock
    const r = await taskFailedQuery({ config: config.data, type: "DmarcReport", limit: 3 })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.methodCalls[0]?.[0]).toBe("x:Task/query")
    expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({ filter: { type: "DmarcReport", status: "Failed" }, limit: 3 })
  })

  test("taskSet turns a notCreated entry into a ResultErr", async () => {
    const m = regSystemMock(["x:Task/set", { notCreated: { a1: { type: "invalidProperties" } } }])
    mock = m.mock
    const r = await taskSet({ config: config.data, create: { a1: { "@type": "DkimManagement" } } })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("taskSet")
  })

  test("taskManagerGet reads the singleton and rejects a bad config", async () => {
    const m = regSystemMock(["x:TaskManager/get", { list: [{ id: "singleton", maxAttempts: 3 }], notFound: [] }])
    mock = m.mock
    const r = await taskManagerGet({ config: config.data })
    expect(r.success).toBe(true)
    const bad = await taskManagerGet({ config: { baseUrl: "not a url" } })
    expect(bad.success).toBe(false)
    if (!bad.success) expect(bad.op).toBe("taskManagerGet")
  })

  test("coordinatorGet reads the singleton and coordinatorSet patches it", async () => {
    const m = regSystemMock(
      ["x:Coordinator/get", { list: [{ id: "singleton", "@type": "Disabled" }], notFound: [] }],
      ["x:Coordinator/set", { updated: { singleton: null } }],
    )
    mock = m.mock
    const g = await coordinatorGet({ config: config.data })
    expect(g.success).toBe(true)
    const s = await coordinatorSet({ config: config.data, patch: { "@type": "Disabled" } })
    expect(s.success).toBe(true)
    expect(m.sent[1]?.methodCalls[0]?.[1]).toEqual({ update: { singleton: { "@type": "Disabled" } } })
  })

  test("coordinatorGet rejects a bad config without a request", async () => {
    const m = regSystemMock(["x:Coordinator/get", {}])
    mock = m.mock
    const r = await coordinatorGet({ config: { baseUrl: "not a url" } })
    expect(r.success).toBe(false)
    expect(m.sent).toHaveLength(0)
  })
})

describe("regSystem groupware singletons", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("sysEmailGet reads x:Email and sysEmailSet patches update.singleton", async () => {
    const m = regSystemMock(
      ["x:Email/get", { list: [{ id: "singleton", maxMessageSize: 1 }], notFound: [] }],
      ["x:Email/set", { updated: { singleton: null } }],
    )
    mock = m.mock
    const g = await sysEmailGet({ config: config.data })
    expect(g.success).toBe(true)
    if (g.success) expect(g.data.list[0]?.maxMessageSize).toBe(1)
    expect(m.sent[0]?.methodCalls[0]?.[0]).toBe("x:Email/get")
    const s = await sysEmailSet({ config: config.data, patch: { maxMessageSize: 2 } })
    expect(s.success).toBe(true)
    expect(m.sent[1]?.methodCalls[0]?.[1]).toEqual({ update: { singleton: { maxMessageSize: 2 } } })
  })

  test("sysCalendarGet reads x:Calendar and sysCalendarSet patches it", async () => {
    const m = regSystemMock(
      ["x:Calendar/get", { list: [{ id: "singleton" }], notFound: [] }],
      ["x:Calendar/set", { updated: { singleton: null } }],
    )
    mock = m.mock
    const g = await sysCalendarGet({ config: config.data })
    expect(g.success).toBe(true)
    expect(m.sent[0]?.methodCalls[0]?.[0]).toBe("x:Calendar/get")
    const s = await sysCalendarSet({ config: config.data, patch: { maxAttendees: 10 } })
    expect(s.success).toBe(true)
  })

  test("metadataGet reads x:Metadata and metadataSet patches update.singleton", async () => {
    const m = regSystemMock(
      ["x:Metadata/get", { list: [{ id: "singleton", maxEntries: 100 }], notFound: [] }],
      ["x:Metadata/set", { updated: { singleton: null } }],
    )
    mock = m.mock
    const g = await metadataGet({ config: config.data })
    expect(g.success).toBe(true)
    if (g.success) expect(g.data.list[0]?.maxEntries).toBe(100)
    expect(m.sent[0]?.methodCalls[0]?.[0]).toBe("x:Metadata/get")
    const s = await metadataSet({ config: config.data, patch: { maxEntries: 200 } })
    expect(s.success).toBe(true)
    expect(m.sent[1]?.methodCalls[0]?.[1]).toEqual({ update: { singleton: { maxEntries: 200 } } })
  })

  test("calendarAlarmGet reads x:CalendarAlarm and calendarAlarmSet patches it", async () => {
    const m = regSystemMock(
      ["x:CalendarAlarm/get", { list: [{ id: "singleton", enable: true }], notFound: [] }],
      ["x:CalendarAlarm/set", { updated: { singleton: null } }],
    )
    mock = m.mock
    const g = await calendarAlarmGet({ config: config.data })
    expect(g.success).toBe(true)
    if (g.success) expect(g.data.list[0]?.enable).toBe(true)
    const s = await calendarAlarmSet({ config: config.data, patch: { enable: false } })
    expect(s.success).toBe(true)
    expect(m.sent[1]?.methodCalls[0]?.[1]).toEqual({ update: { singleton: { enable: false } } })
  })

  test("calendarSchedulingGet reads x:CalendarScheduling and calendarSchedulingSet patches it", async () => {
    const m = regSystemMock(
      ["x:CalendarScheduling/get", { list: [{ id: "singleton" }], notFound: [] }],
      ["x:CalendarScheduling/set", { updated: { singleton: null } }],
    )
    mock = m.mock
    const g = await calendarSchedulingGet({ config: config.data })
    expect(g.success).toBe(true)
    expect(m.sent[0]?.methodCalls[0]?.[0]).toBe("x:CalendarScheduling/get")
    const s = await calendarSchedulingSet({ config: config.data, patch: { enable: true } })
    expect(s.success).toBe(true)
  })

  test("sysAddressBookGet reads x:AddressBook and sysAddressBookSet patches it", async () => {
    const m = regSystemMock(
      ["x:AddressBook/get", { list: [{ id: "singleton" }], notFound: [] }],
      ["x:AddressBook/set", { updated: { singleton: null } }],
    )
    mock = m.mock
    const g = await sysAddressBookGet({ config: config.data })
    expect(g.success).toBe(true)
    expect(m.sent[0]?.methodCalls[0]?.[0]).toBe("x:AddressBook/get")
    const s = await sysAddressBookSet({ config: config.data, patch: { maxVCardSize: 1024 } })
    expect(s.success).toBe(true)
  })

  test("sysEmailGet rejects a bad config without a request", async () => {
    const m = regSystemMock(["x:Email/get", {}])
    mock = m.mock
    const r = await sysEmailGet({ config: { baseUrl: "not a url" } })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("sysEmailGet")
    expect(m.sent).toHaveLength(0)
  })
})

describe("regSystem CLI route maps", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  const app = buildApplication(
    buildRouteMap({
      routes: {
        system: systemCommands,
        actions: actionsCommands,
        cluster: clusterCommands,
        tasks: tasksCommands,
        sysGroupware: sysGroupwareCommands,
      },
      docs: { brief: "regSystem smoke test app" },
    }),
    { name: "reg-system-smoke", versionInfo: { currentVersion: "0.0.0-test" } },
  )

  async function runCapture(argv: string[]): Promise<string> {
    const lines: string[] = []
    const context = {
      process: {
        stdout: { write: (chunk: string) => void lines.push(chunk) },
        stderr: { write: () => true },
        env: {},
      },
    }
    await run(app, argv, context as never)
    return lines.join("")
  }

  const flags = ["--baseUrl", "https://mail.example.com", "--username", "admin", "--password", "pw"]

  test("system system-settings get prints the singleton", async () => {
    const m = regSystemMock([
      "x:SystemSettings/get",
      { list: [{ id: "singleton", defaultHostname: "h" }], notFound: [] },
    ])
    mock = m.mock
    const out = await runCapture(["system", "system-settings", "get", ...flags])
    expect(JSON.parse(out).list[0].defaultHostname).toBe("h")
    expect(m.sent[0]?.methodCalls[0]?.[0]).toBe("x:SystemSettings/get")
  })

  test("actions reload-settings runs the ReloadSettings action", async () => {
    const m = regSystemMock(["x:Action/set", { created: { a1: { id: "x1" } } }])
    mock = m.mock
    const out = await runCapture(["actions", "reload-settings", ...flags])
    expect(JSON.parse(out)).toBe("x1")
    expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({ create: { a1: { "@type": "ReloadSettings" } } })
  })

  test("cluster cluster-node query lists node ids", async () => {
    const m = regSystemMock(["x:ClusterNode/query", { ids: ["a"], queryState: "s" }])
    mock = m.mock
    const out = await runCapture(["cluster", "cluster-node", "query", "--limit", "5", ...flags])
    expect(JSON.parse(out).ids).toEqual(["a"])
  })

  test("tasks task-failed query forces status Failed", async () => {
    const m = regSystemMock(["x:Task/query", { ids: [], queryState: "s" }])
    mock = m.mock
    await runCapture(["tasks", "task-failed", "query", "--type", "DmarcReport", ...flags])
    expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({ filter: { type: "DmarcReport", status: "Failed" } })
  })

  test("sysGroupware sys-email get reads x:Email", async () => {
    const m = regSystemMock(["x:Email/get", { list: [{ id: "singleton" }], notFound: [] }])
    mock = m.mock
    const out = await runCapture(["sysGroupware", "sys-email", "get", ...flags])
    expect(JSON.parse(out).list[0].id).toBe("singleton")
    expect(m.sent[0]?.methodCalls[0]?.[0]).toBe("x:Email/get")
  })

  test("every regSystem op is reachable from its route map", async () => {
    const names = new Set<string>()
    const walk = (
      routes: { getAllEntries: () => readonly { name: { original: string }; target: unknown }[] },
      prefix: string,
    ) => {
      for (const entry of routes.getAllEntries()) {
        const path = prefix === "" ? entry.name.original : `${prefix} ${entry.name.original}`
        const target = entry.target as { getAllEntries?: () => unknown[] }
        if (typeof target.getAllEntries === "function") walk(target as never, path)
        else names.add(path)
      }
    }
    walk(systemCommands as never, "")
    walk(actionsCommands as never, "")
    walk(clusterCommands as never, "")
    walk(tasksCommands as never, "")
    walk(sysGroupwareCommands as never, "")
    for (const op of [
      "system-settings get",
      "system-settings set",
      "allowed-ip add",
      "allowed-ip remove",
      "blocked-ip query",
      "application set",
      "ai-model get",
      "run",
      "reload-settings",
      "troubleshoot-dmarc",
      "classify-spam",
      "cluster-node query",
      "cluster-role set",
      "coordinator get",
      "task query",
      "task-failed query",
      "task-manager set",
      "sys-email set",
      "calendar-alarm get",
      "sys-address-book set",
    ]) {
      expect(names.has(op)).toBe(true)
    }
  })
})
