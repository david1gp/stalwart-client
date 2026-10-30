import { afterEach, describe, expect, test } from "bun:test"
import { stalwartClientConfig } from "../src/client/stalwartClientConfig.js"
import { alertGet } from "../src/registry/telemetry/alertGet.js"
import { alertQuery } from "../src/registry/telemetry/alertQuery.js"
import { alertSet } from "../src/registry/telemetry/alertSet.js"
import { archivedItemGet } from "../src/registry/storage/archivedItemGet.js"
import { archivedItemQuery } from "../src/registry/storage/archivedItemQuery.js"
import { archivedItemSet } from "../src/registry/storage/archivedItemSet.js"
import { arfExternalReportGet } from "../src/registry/reports/arfExternalReportGet.js"
import { arfExternalReportQuery } from "../src/registry/reports/arfExternalReportQuery.js"
import { blobStoreGet } from "../src/registry/storage/blobStoreGet.js"
import { blobStoreSet } from "../src/registry/storage/blobStoreSet.js"
import { cacheGet } from "../src/registry/storage/cacheGet.js"
import { cacheSet } from "../src/registry/storage/cacheSet.js"
import { dataRetentionGet } from "../src/registry/storage/dataRetentionGet.js"
import { dataRetentionSet } from "../src/registry/storage/dataRetentionSet.js"
import { dataStoreGet } from "../src/registry/storage/dataStoreGet.js"
import { dataStoreSet } from "../src/registry/storage/dataStoreSet.js"
import { dmarcExternalReportGet } from "../src/registry/reports/dmarcExternalReportGet.js"
import { dmarcExternalReportQuery } from "../src/registry/reports/dmarcExternalReportQuery.js"
import { dmarcInternalReportGet } from "../src/registry/reports/dmarcInternalReportGet.js"
import { dmarcInternalReportQuery } from "../src/registry/reports/dmarcInternalReportQuery.js"
import { eventTracingLevelGet } from "../src/registry/telemetry/eventTracingLevelGet.js"
import { eventTracingLevelQuery } from "../src/registry/telemetry/eventTracingLevelQuery.js"
import { eventTracingLevelSet } from "../src/registry/telemetry/eventTracingLevelSet.js"
import { fileStorageGet } from "../src/registry/storage/fileStorageGet.js"
import { fileStorageSet } from "../src/registry/storage/fileStorageSet.js"
import { inMemoryStoreGet } from "../src/registry/storage/inMemoryStoreGet.js"
import { inMemoryStoreSet } from "../src/registry/storage/inMemoryStoreSet.js"
import { indexQueueStatusGet } from "../src/registry/storage/indexQueueStatusGet.js"
import { indexQueueStatusQuery } from "../src/registry/storage/indexQueueStatusQuery.js"
import { indexQueueStatusSet } from "../src/registry/storage/indexQueueStatusSet.js"
import { logGet } from "../src/registry/telemetry/logGet.js"
import { logQuery } from "../src/registry/telemetry/logQuery.js"
import { metricGet } from "../src/registry/telemetry/metricGet.js"
import { metricQuery } from "../src/registry/telemetry/metricQuery.js"
import { metricsGet } from "../src/registry/telemetry/metricsGet.js"
import { metricsSet } from "../src/registry/telemetry/metricsSet.js"
import { metricsStoreGet } from "../src/registry/telemetry/metricsStoreGet.js"
import { metricsStoreSet } from "../src/registry/telemetry/metricsStoreSet.js"
import { reportDestroy } from "../src/registry/reports/reportDestroy.js"
import { reportReschedule } from "../src/registry/reports/reportReschedule.js"
import { searchGet } from "../src/registry/storage/searchGet.js"
import { searchSet } from "../src/registry/storage/searchSet.js"
import { searchStoreGet } from "../src/registry/storage/searchStoreGet.js"
import { searchStoreSet } from "../src/registry/storage/searchStoreSet.js"
import { tlsExternalReportGet } from "../src/registry/reports/tlsExternalReportGet.js"
import { tlsExternalReportQuery } from "../src/registry/reports/tlsExternalReportQuery.js"
import { tlsInternalReportGet } from "../src/registry/reports/tlsInternalReportGet.js"
import { tlsInternalReportQuery } from "../src/registry/reports/tlsInternalReportQuery.js"
import { traceGet } from "../src/registry/telemetry/traceGet.js"
import { traceQuery } from "../src/registry/telemetry/traceQuery.js"
import { tracerGet } from "../src/registry/telemetry/tracerGet.js"
import { tracerQuery } from "../src/registry/telemetry/tracerQuery.js"
import { tracerSet } from "../src/registry/telemetry/tracerSet.js"
import { tracingStoreGet } from "../src/registry/telemetry/tracingStoreGet.js"
import { tracingStoreSet } from "../src/registry/telemetry/tracingStoreSet.js"
import { webHookGet } from "../src/registry/telemetry/webHookGet.js"
import { webHookQuery } from "../src/registry/telemetry/webHookQuery.js"
import { webHookSet } from "../src/registry/telemetry/webHookSet.js"
// Load the CLI route maps so import-time wiring errors surface here.
import "../src/registry/reports/cli/reportsCommands.js"
import "../src/registry/storage/cli/storageCommands.js"
import "../src/registry/telemetry/cli/telemetryCommands.js"
import { fetchMockCreate, fetchMockJson } from "./fetchMock.js"
import { jmapTestSessionCreate } from "./jmapTestSession.js"

const config = stalwartClientConfig({ baseUrl: "https://mail.example.com", username: "admin", password: "pw" })
if (!config.success) throw new Error("fixture config invalid")

type SentCall = { using: string[]; methodCalls: [string, Record<string, unknown>, string][] }
type WireRun = () => Promise<
  { success: boolean } & Partial<{ op: string; errorMessage: string; errorData: string | null }>
>

let mock: ReturnType<typeof fetchMockCreate> | undefined
afterEach(() => {
  mock?.restore()
  mock = undefined
})

function sentMockCreate(payloadFor?: (methodName: string) => Record<string, unknown>) {
  const sent: SentCall[] = []
  mock = fetchMockCreate((request) => {
    if (new URL(request.url).pathname === "/jmap/session") return fetchMockJson(jmapTestSessionCreate())
    const body = JSON.parse(String(request.body)) as SentCall
    sent.push(body)
    const methodName = String(body.methodCalls[0]?.[0])
    const verb = methodName.split("/")[1]
    const payload =
      payloadFor?.(methodName) ??
      (verb === "query"
        ? { ids: [], position: 0, queryState: "n" }
        : verb === "get"
          ? { list: [], notFound: [] }
          : { created: {}, updated: {}, destroyed: [] })
    return fetchMockJson({ methodResponses: [[methodName, payload, "c1"]], sessionState: "1" })
  })
  return sent
}

const STALWART_USING = ["urn:ietf:params:jmap:core", "urn:stalwart:jmap"]

async function expectWireCall(label: string, run: WireRun, method: string, args: Record<string, unknown>) {
  const sent = sentMockCreate()
  const result = await run()
  expect(result.success, label).toBe(true)
  expect(sent, label).toHaveLength(1)
  expect(sent[0]?.using, label).toEqual(STALWART_USING)
  expect(sent[0]?.methodCalls[0], label).toEqual([method, args, "c1"])
}

describe("reg-data reports: get and query send the right wire calls", () => {
  test("arfExternalReportGet fetches one report by id", async () => {
    await expectWireCall(
      "arf get",
      () => arfExternalReportGet({ config: config.data, ids: ["r1"] }),
      "x:ArfExternalReport/get",
      { ids: ["r1"] },
    )
  })

  test("arfExternalReportQuery lists report ids with a text filter and limit", async () => {
    await expectWireCall(
      "arf query",
      () => arfExternalReportQuery({ config: config.data, filter: { text: "dmarc" }, limit: 5 }),
      "x:ArfExternalReport/query",
      { filter: { text: "dmarc" }, limit: 5 },
    )
  })

  test("dmarcExternalReportGet fetches one report by id", async () => {
    await expectWireCall(
      "dmarc ext get",
      () => dmarcExternalReportGet({ config: config.data, ids: ["r1"] }),
      "x:DmarcExternalReport/get",
      { ids: ["r1"] },
    )
  })

  test("dmarcExternalReportQuery filters by expiry window", async () => {
    await expectWireCall(
      "dmarc ext query",
      () =>
        dmarcExternalReportQuery({
          config: config.data,
          filter: { expiresAtIsGreaterThan: "2024-01-01T00:00:00Z" },
          limit: 5,
        }),
      "x:DmarcExternalReport/query",
      { filter: { expiresAtIsGreaterThan: "2024-01-01T00:00:00Z" }, limit: 5 },
    )
  })

  test("tlsExternalReportGet fetches one report by id", async () => {
    await expectWireCall(
      "tls ext get",
      () => tlsExternalReportGet({ config: config.data, ids: ["r1"] }),
      "x:TlsExternalReport/get",
      { ids: ["r1"] },
    )
  })

  test("tlsExternalReportQuery lists report ids without a filter", async () => {
    await expectWireCall(
      "tls ext query",
      () => tlsExternalReportQuery({ config: config.data, limit: 10 }),
      "x:TlsExternalReport/query",
      { limit: 10 },
    )
  })

  test("dmarcInternalReportGet fetches one pending report by id", async () => {
    await expectWireCall(
      "dmarc int get",
      () => dmarcInternalReportGet({ config: config.data, ids: ["r1"] }),
      "x:DmarcInternalReport/get",
      { ids: ["r1"] },
    )
  })

  test("dmarcInternalReportQuery filters by domain", async () => {
    await expectWireCall(
      "dmarc int query",
      () => dmarcInternalReportQuery({ config: config.data, filter: { domain: "example.com" } }),
      "x:DmarcInternalReport/query",
      { filter: { domain: "example.com" } },
    )
  })

  test("tlsInternalReportGet fetches one pending report by id", async () => {
    await expectWireCall(
      "tls int get",
      () => tlsInternalReportGet({ config: config.data, ids: ["r1"] }),
      "x:TlsInternalReport/get",
      { ids: ["r1"] },
    )
  })

  test("tlsInternalReportQuery filters by domain", async () => {
    await expectWireCall(
      "tls int query",
      () => tlsInternalReportQuery({ config: config.data, filter: { domain: "example.com" } }),
      "x:TlsInternalReport/query",
      { filter: { domain: "example.com" } },
    )
  })
})

describe("reg-data reports: destroy and reschedule", () => {
  test("reportDestroy destroys an external report", async () => {
    await expectWireCall(
      "destroy",
      () => reportDestroy({ config: config.data, objectType: "DmarcExternalReport", ids: ["r1"] }),
      "x:DmarcExternalReport/set",
      { destroy: ["r1"] },
    )
  })

  test("reportDestroy destroys an internal report", async () => {
    await expectWireCall(
      "destroy internal",
      () => reportDestroy({ config: config.data, objectType: "TlsInternalReport", ids: ["r2"] }),
      "x:TlsInternalReport/set",
      { destroy: ["r2"] },
    )
  })

  test("reportReschedule sets a future deliverAt on an internal report", async () => {
    await expectWireCall(
      "reschedule",
      () =>
        reportReschedule({
          config: config.data,
          objectType: "DmarcInternalReport",
          id: "r1",
          deliverAt: "2030-01-01T00:00:00Z",
        }),
      "x:DmarcInternalReport/set",
      { update: { r1: { deliverAt: "2030-01-01T00:00:00Z" } } },
    )
  })

  test("reportReschedule rejects an external report type without sending a request", async () => {
    const sent = sentMockCreate()
    const result = await reportReschedule({
      config: config.data,
      objectType: "ArfExternalReport" as "DmarcInternalReport",
      id: "r1",
      deliverAt: "2030-01-01T00:00:00Z",
    })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.op).toBe("reportReschedule")
    expect(sent).toHaveLength(0)
  })

  test("reportDestroy requires a non-empty id list", async () => {
    const sent = sentMockCreate()
    const result = await reportDestroy({ config: config.data, objectType: "TlsExternalReport", ids: [] })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.op).toBe("reportDestroy")
    expect(sent).toHaveLength(0)
  })

  test("reportDestroy surfaces a notDestroyed entry as a ResultErr", async () => {
    const sent = sentMockCreate(() => ({ notDestroyed: { r9: { type: "notFound", description: "gone" } } }))
    const result = await reportDestroy({ config: config.data, objectType: "ArfExternalReport", ids: ["r9"] })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.op).toBe("reportDestroy")
      expect(result.errorMessage).toContain("notFound")
      expect(JSON.parse(result.errorData ?? "{}").notDestroyed.r9.type).toBe("notFound")
    }
    expect(sent).toHaveLength(1)
  })
})

describe("reg-data telemetry: log, trace and metric read paths", () => {
  test("logGet fetches log entries by id", async () => {
    await expectWireCall("log get", () => logGet({ config: config.data, ids: ["abc"] }), "x:Log/get", { ids: ["abc"] })
  })

  test("logQuery sends only the text filter", async () => {
    await expectWireCall(
      "log query",
      () => logQuery({ config: config.data, filter: { text: "smtp" }, limit: 10 }),
      "x:Log/query",
      { filter: { text: "smtp" }, limit: 10 },
    )
  })

  test("logQuery without a filter sends no filter argument", async () => {
    await expectWireCall("log query bare", () => logQuery({ config: config.data, limit: 10 }), "x:Log/query", {
      limit: 10,
    })
  })

  test("traceGet fetches a delivery trace by id", async () => {
    await expectWireCall("trace get", () => traceGet({ config: config.data, ids: ["t1"] }), "x:Trace/get", {
      ids: ["t1"],
    })
  })

  test("traceQuery filters by event type", async () => {
    await expectWireCall(
      "trace query",
      () => traceQuery({ config: config.data, filter: { event: "smtp" }, limit: 5 }),
      "x:Trace/query",
      { filter: { event: "smtp" }, limit: 5 },
    )
  })

  test("metricGet fetches a metric data point by id", async () => {
    await expectWireCall("metric get", () => metricGet({ config: config.data, ids: ["m1"] }), "x:Metric/get", {
      ids: ["m1"],
    })
  })

  test("metricQuery filters by timestamp range", async () => {
    await expectWireCall(
      "metric query",
      () =>
        metricQuery({
          config: config.data,
          filter: { timestampIsGreaterThan: "2024-01-01T00:00:00Z" },
        }),
      "x:Metric/query",
      { filter: { timestampIsGreaterThan: "2024-01-01T00:00:00Z" } },
    )
  })
})

describe("reg-data telemetry: tracer, alert and webhook", () => {
  test("tracerGet fetches a tracer by id", async () => {
    await expectWireCall("tracer get", () => tracerGet({ config: config.data, ids: ["t1"] }), "x:Tracer/get", {
      ids: ["t1"],
    })
  })

  test("tracerQuery lists tracer ids", async () => {
    await expectWireCall("tracer query", () => tracerQuery({ config: config.data, limit: 10 }), "x:Tracer/query", {
      limit: 10,
    })
  })

  test("tracerSet creates a disabled Stdout tracer", async () => {
    await expectWireCall(
      "tracer set",
      () =>
        tracerSet({
          config: config.data,
          create: { t1: { "@type": "Stdout", enable: false, level: "info" } },
        }),
      "x:Tracer/set",
      { create: { t1: { "@type": "Stdout", enable: false, level: "info" } } },
    )
  })

  test("alertGet fetches an alert rule by id", async () => {
    await expectWireCall("alert get", () => alertGet({ config: config.data, ids: ["a1"] }), "x:Alert/get", {
      ids: ["a1"],
    })
  })

  test("alertQuery lists alert rule ids", async () => {
    await expectWireCall("alert query", () => alertQuery({ config: config.data, limit: 10 }), "x:Alert/query", {
      limit: 10,
    })
  })

  test("alertSet destroys an alert rule", async () => {
    await expectWireCall("alert set", () => alertSet({ config: config.data, destroy: ["a1"] }), "x:Alert/set", {
      destroy: ["a1"],
    })
  })

  test("webHookGet fetches a webhook by id", async () => {
    await expectWireCall("webhook get", () => webHookGet({ config: config.data, ids: ["w1"] }), "x:WebHook/get", {
      ids: ["w1"],
    })
  })

  test("webHookQuery lists webhook ids", async () => {
    await expectWireCall("webhook query", () => webHookQuery({ config: config.data, limit: 10 }), "x:WebHook/query", {
      limit: 10,
    })
  })

  test("webHookSet creates a disabled webhook", async () => {
    await expectWireCall(
      "webhook set",
      () =>
        webHookSet({
          config: config.data,
          create: { w1: { url: "http://127.0.0.1:9/", enable: false } },
        }),
      "x:WebHook/set",
      { create: { w1: { url: "http://127.0.0.1:9/", enable: false } } },
    )
  })
})

describe("reg-data telemetry: singleton get and set send the singleton id", () => {
  test("metricsGet reads the singleton", async () => {
    await expectWireCall("metrics get", () => metricsGet({ config: config.data }), "x:Metrics/get", {
      ids: ["singleton"],
    })
  })

  test("metricsSet patches the singleton", async () => {
    await expectWireCall(
      "metrics set",
      () => metricsSet({ config: config.data, update: { singleton: { metricsPolicy: "include" } } }),
      "x:Metrics/set",
      { update: { singleton: { metricsPolicy: "include" } } },
    )
  })

  test("metricsStoreGet reads the singleton", async () => {
    await expectWireCall("metricsStore get", () => metricsStoreGet({ config: config.data }), "x:MetricsStore/get", {
      ids: ["singleton"],
    })
  })

  test("metricsStoreSet patches the singleton", async () => {
    await expectWireCall(
      "metricsStore set",
      () => metricsStoreSet({ config: config.data, update: { singleton: { "@type": "Disabled" } } }),
      "x:MetricsStore/set",
      { update: { singleton: { "@type": "Disabled" } } },
    )
  })

  test("tracingStoreGet reads the singleton", async () => {
    await expectWireCall("tracingStore get", () => tracingStoreGet({ config: config.data }), "x:TracingStore/get", {
      ids: ["singleton"],
    })
  })

  test("tracingStoreSet patches the singleton", async () => {
    await expectWireCall(
      "tracingStore set",
      () => tracingStoreSet({ config: config.data, update: { singleton: { "@type": "Disabled" } } }),
      "x:TracingStore/set",
      { update: { singleton: { "@type": "Disabled" } } },
    )
  })

  test("eventTracingLevelGet fetches an override by id", async () => {
    await expectWireCall(
      "etl get",
      () => eventTracingLevelGet({ config: config.data, ids: ["e1"] }),
      "x:EventTracingLevel/get",
      { ids: ["e1"] },
    )
  })

  test("eventTracingLevelQuery lists override ids (unfiltered: event is not indexed server-side)", async () => {
    await expectWireCall(
      "etl query",
      () => eventTracingLevelQuery({ config: config.data, limit: 50 }),
      "x:EventTracingLevel/query",
      { limit: 50 },
    )
  })

  test("eventTracingLevelSet creates an override", async () => {
    await expectWireCall(
      "etl set",
      () => eventTracingLevelSet({ config: config.data, create: { e1: { event: "smtp" } } }),
      "x:EventTracingLevel/set",
      { create: { e1: { event: "smtp" } } },
    )
  })
})

describe("reg-data storage: archived items and store singletons", () => {
  test("archivedItemGet fetches an archived item by id", async () => {
    await expectWireCall(
      "archived get",
      () => archivedItemGet({ config: config.data, ids: ["i1"] }),
      "x:ArchivedItem/get",
      { ids: ["i1"] },
    )
  })

  test("archivedItemQuery filters by account", async () => {
    await expectWireCall(
      "archived query",
      () => archivedItemQuery({ config: config.data, filter: { accountId: "b" } }),
      "x:ArchivedItem/query",
      { filter: { accountId: "b" } },
    )
  })

  test("archivedItemSet destroys an archived item", async () => {
    await expectWireCall(
      "archived set",
      () => archivedItemSet({ config: config.data, destroy: ["i1"] }),
      "x:ArchivedItem/set",
      { destroy: ["i1"] },
    )
  })

  test("indexQueueStatusGet fetches a queue state by id", async () => {
    await expectWireCall(
      "index queue get",
      () => indexQueueStatusGet({ config: config.data, ids: ["q1"] }),
      "x:IndexQueueStatus/get",
      { ids: ["q1"] },
    )
  })

  test("indexQueueStatusQuery filters by index", async () => {
    await expectWireCall(
      "index queue query",
      () => indexQueueStatusQuery({ config: config.data, filter: { index: "Email" } }),
      "x:IndexQueueStatus/query",
      { filter: { index: "Email" } },
    )
  })

  test("indexQueueStatusSet updates a queue entry", async () => {
    await expectWireCall(
      "index queue set",
      () => indexQueueStatusSet({ config: config.data, update: { q1: { status: "Idle" } } }),
      "x:IndexQueueStatus/set",
      { update: { q1: { status: "Idle" } } },
    )
  })

  test("blobStoreGet reads the singleton", async () => {
    await expectWireCall("blobStore get", () => blobStoreGet({ config: config.data }), "x:BlobStore/get", {
      ids: ["singleton"],
    })
  })

  test("blobStoreSet patches the singleton", async () => {
    await expectWireCall(
      "blobStore set",
      () => blobStoreSet({ config: config.data, update: { singleton: { "@type": "Default" } } }),
      "x:BlobStore/set",
      { update: { singleton: { "@type": "Default" } } },
    )
  })

  test("dataStoreGet reads the singleton", async () => {
    await expectWireCall("dataStore get", () => dataStoreGet({ config: config.data }), "x:DataStore/get", {
      ids: ["singleton"],
    })
  })

  test("dataStoreSet patches the singleton", async () => {
    await expectWireCall(
      "dataStore set",
      () => dataStoreSet({ config: config.data, update: { singleton: { "@type": "Default" } } }),
      "x:DataStore/set",
      { update: { singleton: { "@type": "Default" } } },
    )
  })

  test("cacheGet reads the singleton", async () => {
    await expectWireCall("cache get", () => cacheGet({ config: config.data }), "x:Cache/get", { ids: ["singleton"] })
  })

  test("cacheSet patches one cache size", async () => {
    await expectWireCall(
      "cache set",
      () => cacheSet({ config: config.data, update: { singleton: { accounts: 1000 } } }),
      "x:Cache/set",
      { update: { singleton: { accounts: 1000 } } },
    )
  })

  test("searchGet reads the singleton", async () => {
    await expectWireCall("search get", () => searchGet({ config: config.data }), "x:Search/get", { ids: ["singleton"] })
  })

  test("searchSet patches the singleton", async () => {
    await expectWireCall(
      "search set",
      () => searchSet({ config: config.data, update: { singleton: { indexEmail: true } } }),
      "x:Search/set",
      { update: { singleton: { indexEmail: true } } },
    )
  })

  test("searchStoreGet reads the singleton", async () => {
    await expectWireCall("searchStore get", () => searchStoreGet({ config: config.data }), "x:SearchStore/get", {
      ids: ["singleton"],
    })
  })

  test("searchStoreSet patches the singleton", async () => {
    await expectWireCall(
      "searchStore set",
      () => searchStoreSet({ config: config.data, update: { singleton: { "@type": "Default" } } }),
      "x:SearchStore/set",
      { update: { singleton: { "@type": "Default" } } },
    )
  })

  test("inMemoryStoreGet reads the singleton", async () => {
    await expectWireCall("inMemoryStore get", () => inMemoryStoreGet({ config: config.data }), "x:InMemoryStore/get", {
      ids: ["singleton"],
    })
  })

  test("inMemoryStoreSet patches the singleton", async () => {
    await expectWireCall(
      "inMemoryStore set",
      () => inMemoryStoreSet({ config: config.data, update: { singleton: { "@type": "Default" } } }),
      "x:InMemoryStore/set",
      { update: { singleton: { "@type": "Default" } } },
    )
  })

  test("fileStorageGet reads the singleton", async () => {
    await expectWireCall("fileStorage get", () => fileStorageGet({ config: config.data }), "x:FileStorage/get", {
      ids: ["singleton"],
    })
  })

  test("fileStorageSet patches the singleton", async () => {
    await expectWireCall(
      "fileStorage set",
      () => fileStorageSet({ config: config.data, update: { singleton: { maxSize: 104857600 } } }),
      "x:FileStorage/set",
      { update: { singleton: { maxSize: 104857600 } } },
    )
  })

  test("dataRetentionGet reads the singleton", async () => {
    await expectWireCall("dataRetention get", () => dataRetentionGet({ config: config.data }), "x:DataRetention/get", {
      ids: ["singleton"],
    })
  })

  test("dataRetentionSet patches one retention window", async () => {
    await expectWireCall(
      "dataRetention set",
      () =>
        dataRetentionSet({
          config: config.data,
          update: { singleton: { expungeTrashAfter: 2592000000 } },
        }),
      "x:DataRetention/set",
      { update: { singleton: { expungeTrashAfter: 2592000000 } } },
    )
  })
})

describe("reg-data set-error paths turn server rejections into ResultErrs", () => {
  const setCases: { label: string; op: string; run: WireRun }[] = [
    {
      label: "reportReschedule surfaces a notUpdated entry",
      op: "reportReschedule",
      run: () =>
        reportReschedule({
          config: config.data,
          objectType: "DmarcInternalReport",
          id: "r1",
          deliverAt: "2030-01-01T00:00:00Z",
        }),
    },
    {
      label: "tracerSet surfaces a notCreated entry",
      op: "tracerSet",
      run: () => tracerSet({ config: config.data, create: { t1: { "@type": "Log" } } }),
    },
    {
      label: "alertSet surfaces a notDestroyed entry",
      op: "alertSet",
      run: () => alertSet({ config: config.data, destroy: ["a1"] }),
    },
    {
      label: "webHookSet surfaces a notCreated entry",
      op: "webHookSet",
      run: () => webHookSet({ config: config.data, create: { w1: {} } }),
    },
    {
      label: "metricsSet surfaces a notUpdated entry",
      op: "metricsSet",
      run: () => metricsSet({ config: config.data, update: { singleton: { metricsPolicy: "bogus" } } }),
    },
    {
      label: "metricsStoreSet surfaces a notUpdated entry",
      op: "metricsStoreSet",
      run: () => metricsStoreSet({ config: config.data, update: { singleton: {} } }),
    },
    {
      label: "tracingStoreSet surfaces a notUpdated entry",
      op: "tracingStoreSet",
      run: () => tracingStoreSet({ config: config.data, update: { singleton: {} } }),
    },
    {
      label: "eventTracingLevelSet surfaces a notCreated entry",
      op: "eventTracingLevelSet",
      run: () => eventTracingLevelSet({ config: config.data, create: { e1: {} } }),
    },
    {
      label: "archivedItemSet surfaces a notDestroyed entry",
      op: "archivedItemSet",
      run: () => archivedItemSet({ config: config.data, destroy: ["i1"] }),
    },
    {
      label: "blobStoreSet surfaces a notUpdated entry",
      op: "blobStoreSet",
      run: () => blobStoreSet({ config: config.data, update: { singleton: {} } }),
    },
    {
      label: "dataStoreSet surfaces a notUpdated entry",
      op: "dataStoreSet",
      run: () => dataStoreSet({ config: config.data, update: { singleton: {} } }),
    },
    {
      label: "cacheSet surfaces a notUpdated entry",
      op: "cacheSet",
      run: () => cacheSet({ config: config.data, update: { singleton: {} } }),
    },
    {
      label: "searchSet surfaces a notUpdated entry",
      op: "searchSet",
      run: () => searchSet({ config: config.data, update: { singleton: {} } }),
    },
    {
      label: "searchStoreSet surfaces a notUpdated entry",
      op: "searchStoreSet",
      run: () => searchStoreSet({ config: config.data, update: { singleton: {} } }),
    },
    {
      label: "inMemoryStoreSet surfaces a notUpdated entry",
      op: "inMemoryStoreSet",
      run: () => inMemoryStoreSet({ config: config.data, update: { singleton: {} } }),
    },
    {
      label: "fileStorageSet surfaces a notUpdated entry",
      op: "fileStorageSet",
      run: () => fileStorageSet({ config: config.data, update: { singleton: {} } }),
    },
    {
      label: "dataRetentionSet surfaces a notUpdated entry",
      op: "dataRetentionSet",
      run: () => dataRetentionSet({ config: config.data, update: { singleton: {} } }),
    },
  ]
  for (const { label, op, run } of setCases) {
    test(label, async () => {
      const sent = sentMockCreate(() => ({ notUpdated: { x1: { type: "invalidPatch", description: "bad patch" } } }))
      const result = await run()
      expect(result.success, label).toBe(false)
      if (!result.success) {
        expect(result.op, label).toBe(op)
        expect(result.errorMessage, label).toContain("invalidPatch")
        expect(JSON.parse(result.errorData ?? "{}").notUpdated.x1.type, label).toBe("invalidPatch")
      }
      expect(sent, label).toHaveLength(1)
    })
  }
})

describe("reg-data invalid options fail before any request", () => {
  test("reports: reportReschedule rejects a past-tense empty deliverAt", async () => {
    const sent = sentMockCreate()
    const result = await reportReschedule({
      config: config.data,
      objectType: "DmarcInternalReport",
      id: "r1",
      deliverAt: "",
    })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.op).toBe("reportReschedule")
    expect(sent).toHaveLength(0)
  })

  test("telemetry: logQuery rejects a non-string text filter", async () => {
    const sent = sentMockCreate()
    const result = await logQuery({ config: config.data, filter: { text: 5 as unknown as string } })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.op).toBe("logQuery")
    expect(sent).toHaveLength(0)
  })

  test("telemetry: metricsSet rejects a missing update", async () => {
    const sent = sentMockCreate()
    const result = await metricsSet({ config: config.data } as unknown as Parameters<typeof metricsSet>[0])
    expect(result.success).toBe(false)
    if (!result.success) expect(result.op).toBe("metricsSet")
    expect(sent).toHaveLength(0)
  })

  test("storage: cacheSet rejects a missing update", async () => {
    const sent = sentMockCreate()
    const result = await cacheSet({ config: config.data } as unknown as Parameters<typeof cacheSet>[0])
    expect(result.success).toBe(false)
    if (!result.success) expect(result.op).toBe("cacheSet")
    expect(sent).toHaveLength(0)
  })

  test("storage: archivedItemQuery rejects a negative limit", async () => {
    const sent = sentMockCreate()
    const result = await archivedItemQuery({ config: config.data, limit: -1 })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.op).toBe("archivedItemQuery")
    expect(sent).toHaveLength(0)
  })
})
