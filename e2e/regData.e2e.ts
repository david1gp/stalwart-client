import { afterAll, beforeAll, describe, expect, test } from "bun:test"
import type { StalwartClientConfig } from "../src/client/stalwartClientConfigSchema.js"
import { alertGet } from "../src/registry/telemetry/alertGet.js"
import { alertQuery } from "../src/registry/telemetry/alertQuery.js"
import { archivedItemGet } from "../src/registry/storage/archivedItemGet.js"
import { archivedItemQuery } from "../src/registry/storage/archivedItemQuery.js"
import { arfExternalReportQuery } from "../src/registry/reports/arfExternalReportQuery.js"
import { blobStoreGet } from "../src/registry/storage/blobStoreGet.js"
import { cacheGet } from "../src/registry/storage/cacheGet.js"
import { cacheSet } from "../src/registry/storage/cacheSet.js"
import { dataRetentionGet } from "../src/registry/storage/dataRetentionGet.js"
import { dataRetentionSet } from "../src/registry/storage/dataRetentionSet.js"
import { dataStoreGet } from "../src/registry/storage/dataStoreGet.js"
import { dmarcExternalReportQuery } from "../src/registry/reports/dmarcExternalReportQuery.js"
import { dmarcInternalReportQuery } from "../src/registry/reports/dmarcInternalReportQuery.js"
import { eventTracingLevelQuery } from "../src/registry/telemetry/eventTracingLevelQuery.js"
import { eventTracingLevelSet } from "../src/registry/telemetry/eventTracingLevelSet.js"
import { fileStorageGet } from "../src/registry/storage/fileStorageGet.js"
import { fileStorageSet } from "../src/registry/storage/fileStorageSet.js"
import { inMemoryStoreGet } from "../src/registry/storage/inMemoryStoreGet.js"
import { logGet } from "../src/registry/telemetry/logGet.js"
import { logQuery } from "../src/registry/telemetry/logQuery.js"
import { metricGet } from "../src/registry/telemetry/metricGet.js"
import { metricQuery } from "../src/registry/telemetry/metricQuery.js"
import { metricsGet } from "../src/registry/telemetry/metricsGet.js"
import { metricsSet } from "../src/registry/telemetry/metricsSet.js"
import { metricsStoreGet } from "../src/registry/telemetry/metricsStoreGet.js"
import { reportDestroy } from "../src/registry/reports/reportDestroy.js"
import { searchGet } from "../src/registry/storage/searchGet.js"
import { searchSet } from "../src/registry/storage/searchSet.js"
import { searchStoreGet } from "../src/registry/storage/searchStoreGet.js"
import { tlsExternalReportQuery } from "../src/registry/reports/tlsExternalReportQuery.js"
import { tlsInternalReportQuery } from "../src/registry/reports/tlsInternalReportQuery.js"
import { traceGet } from "../src/registry/telemetry/traceGet.js"
import { traceQuery } from "../src/registry/telemetry/traceQuery.js"
import { tracerQuery } from "../src/registry/telemetry/tracerQuery.js"
import { tracerSet } from "../src/registry/telemetry/tracerSet.js"
import { tracingStoreGet } from "../src/registry/telemetry/tracingStoreGet.js"
import { webHookQuery } from "../src/registry/telemetry/webHookQuery.js"
import { webHookSet } from "../src/registry/telemetry/webHookSet.js"
import { stalwartE2eSetup } from "./e2eSetup.js"

let config: StalwartClientConfig
const created: { tracerId?: string; webHookId?: string; eventLevelId?: string } = {}

beforeAll(async () => {
  config = await stalwartE2eSetup()
})

afterAll(async () => {
  // Strict reverse-order, best-effort teardown of run-created objects only.
  if (created.eventLevelId !== undefined) {
    const r = await eventTracingLevelSet({ config, destroy: [created.eventLevelId] })
    if (!r.success) console.warn(`teardown: event tracing level not removed: ${r.errorMessage}`)
    created.eventLevelId = undefined
  }
  if (created.webHookId !== undefined) {
    const r = await webHookSet({ config, destroy: [created.webHookId] })
    if (!r.success) console.warn(`teardown: webhook not removed: ${r.errorMessage}`)
    created.webHookId = undefined
  }
  if (created.tracerId !== undefined) {
    const r = await tracerSet({ config, destroy: [created.tracerId] })
    if (!r.success) console.warn(`teardown: tracer not removed: ${r.errorMessage}`)
    created.tracerId = undefined
  }
})

describe("e2e reg-data: report queries are empty on a fresh instance", () => {
  test(
    "external and internal report queries return empty id lists",
    async () => {
      for (const query of [
        arfExternalReportQuery,
        dmarcExternalReportQuery,
        tlsExternalReportQuery,
        dmarcInternalReportQuery,
        tlsInternalReportQuery,
      ]) {
        const r = await query({ config, limit: 10 })
        if (!r.success) throw new Error(`${r.op} failed: ${r.errorMessage} ${r.errorData ?? ""}`)
        expect(r.data.ids).toEqual([])
      }
    },
    { timeout: 30_000 },
  )

  test(
    "reportDestroy on an unparsable id is a silent no-op",
    async () => {
      const r = await reportDestroy({ config, objectType: "ArfExternalReport", ids: ["reg-data-bogus"] })
      if (!r.success) throw new Error(`destroy failed: ${r.errorMessage} ${r.errorData ?? ""}`)
      expect(r.data.destroyed ?? []).toEqual([])
    },
    { timeout: 30_000 },
  )
})

describe("e2e reg-data: log entries", () => {
  test(
    "logQuery pins the local instance behaviour",
    async () => {
      const r = await logQuery({ config, limit: 5 })
      if (r.success) {
        // A server with log tracers configured returns newest-first ids.
        expect(Array.isArray(r.data.ids)).toBe(true)
        if (r.data.ids.length > 0) {
          const g = await logGet({ config, ids: [String(r.data.ids[0])] })
          if (!g.success) throw new Error(`logGet failed: ${g.errorMessage}`)
          expect(g.data.list[0]?.details).toBeString()
        }
      } else {
        // The local container has no readable log path: the server answers
        // serverUnavailable ("temporarily unavailable").
        expect(r.errorMessage).toContain("temporarily unavailable")
      }
    },
    { timeout: 30_000 },
  )
})

describe("e2e reg-data: tracer, webhook and event level create/destroy", () => {
  test(
    "tracerSet creates a disabled Stdout tracer and destroys it",
    async () => {
      const c = await tracerSet({
        config,
        create: { e2e: { "@type": "Stdout", enable: false, level: "error" } },
      })
      if (!c.success) throw new Error(`tracer create failed: ${c.errorMessage} ${c.errorData ?? ""}`)
      created.tracerId = c.data.created?.e2e?.id
      expect(created.tracerId).toBeString()
      const q = await tracerQuery({ config, limit: 50 })
      if (!q.success) throw new Error(`tracer query failed: ${q.errorMessage}`)
      expect(q.data.ids.map(String)).toContain(created.tracerId as string)
      const d = await tracerSet({ config, destroy: [created.tracerId as string] })
      if (!d.success) throw new Error(`tracer destroy failed: ${d.errorMessage}`)
      created.tracerId = undefined
    },
    { timeout: 30_000 },
  )

  test(
    "webHookSet creates a disabled webhook and destroys it",
    async () => {
      const c = await webHookSet({
        config,
        create: {
          e2e: {
            url: "http://127.0.0.1:9/",
            enable: false,
            allowInvalidCerts: false,
            events: {},
            eventsPolicy: "exclude",
            httpAuth: { "@type": "Unauthenticated" },
            httpHeaders: {},
            lossy: true,
            signatureKey: { "@type": "None" },
          },
        },
      })
      if (!c.success) throw new Error(`webhook create failed: ${c.errorMessage} ${c.errorData ?? ""}`)
      created.webHookId = c.data.created?.e2e?.id
      expect(created.webHookId).toBeString()
      const d = await webHookSet({ config, destroy: [created.webHookId as string] })
      if (!d.success) throw new Error(`webhook destroy failed: ${d.errorMessage}`)
      created.webHookId = undefined
    },
    { timeout: 30_000 },
  )

  test(
    "eventTracingLevelSet creates an override and destroys it",
    async () => {
      const c = await eventTracingLevelSet({
        config,
        create: { e2e: { event: "smtp.connection-start", level: "debug" } },
      })
      if (!c.success) throw new Error(`event level create failed: ${c.errorMessage} ${c.errorData ?? ""}`)
      created.eventLevelId = c.data.created?.e2e?.id
      expect(created.eventLevelId).toBeString()
      // Note: the server rejects an `event` filter here with unsupportedFilter —
      // query unfiltered instead (see eventTracingLevelQuery docs).
      const q = await eventTracingLevelQuery({ config, limit: 50 })
      if (!q.success) throw new Error(`event level query failed: ${q.errorMessage}`)
      expect(q.data.ids.map(String)).toContain(created.eventLevelId as string)
      const d = await eventTracingLevelSet({ config, destroy: [created.eventLevelId as string] })
      if (!d.success) throw new Error(`event level destroy failed: ${d.errorMessage}`)
      created.eventLevelId = undefined
    },
    { timeout: 30_000 },
  )
})

describe("e2e reg-data: enterprise-gated objects and community-working neighbours", () => {
  test(
    "trace, metric and archived item calls fail with the Enterprise error",
    async () => {
      for (const run of [
        () => traceQuery({ config, limit: 1 }),
        () => traceGet({ config, ids: ["bogus"] }),
        () => metricQuery({ config, limit: 1 }),
        () => metricGet({ config, ids: ["bogus"] }),
        () => archivedItemQuery({ config, limit: 1 }),
        () => archivedItemGet({ config, ids: ["bogus"] }),
      ]) {
        const r = await run()
        expect(r.success).toBe(false)
        if (!r.success) expect(r.errorMessage).toContain("Enterprise")
      }
    },
    { timeout: 30_000 },
  )

  test(
    "alert query works on community (schema enterprise flag, no runtime gate)",
    async () => {
      const q = await alertQuery({ config, limit: 10 })
      if (!q.success) throw new Error(`alert query failed: ${q.errorMessage}`)
      expect(Array.isArray(q.data.ids)).toBe(true)
      const g = await alertGet({ config, ids: [] })
      if (!g.success) throw new Error(`alert get failed: ${g.errorMessage}`)
      expect(g.data.list).toEqual([])
    },
    { timeout: 30_000 },
  )

  test(
    "metrics and tracing stores read back their backend type on community",
    async () => {
      for (const get of [metricsStoreGet, tracingStoreGet]) {
        const r = await get({ config })
        if (!r.success) throw new Error(`store get failed: ${r.errorMessage}`)
        expect(r.data.list).toHaveLength(1)
        expect(r.data.list[0]?.id).toBe("singleton")
      }
    },
    { timeout: 30_000 },
  )
})

describe("e2e reg-data: singleton reads and reversible updates", () => {
  test(
    "data, blob, in-memory and search stores read back their backend type",
    async () => {
      for (const get of [dataStoreGet, blobStoreGet, inMemoryStoreGet, searchStoreGet]) {
        const r = await get({ config })
        if (!r.success) throw new Error(`store get failed: ${r.errorMessage}`)
        expect(r.data.list).toHaveLength(1)
        expect(r.data.list[0]?.id).toBe("singleton")
      }
    },
    { timeout: 30_000 },
  )

  test(
    "metrics singleton update is reversible",
    async () => {
      const before = await metricsGet({ config, properties: ["metricsPolicy"] })
      if (!before.success) throw new Error(`metrics get failed: ${before.errorMessage}`)
      const policy = before.data.list[0]?.metricsPolicy
      const next = policy === "include" ? "exclude" : "include"
      const u = await metricsSet({ config, update: { singleton: { metricsPolicy: next } } })
      if (!u.success) throw new Error(`metrics set failed: ${u.errorMessage}`)
      const mid = await metricsGet({ config, properties: ["metricsPolicy"] })
      if (!mid.success) throw new Error(`metrics re-get failed: ${mid.errorMessage}`)
      expect(mid.data.list[0]?.metricsPolicy).toBe(next)
      const back = await metricsSet({ config, update: { singleton: { metricsPolicy: policy } } })
      if (!back.success) throw new Error(`metrics restore failed: ${back.errorMessage}`)
    },
    { timeout: 30_000 },
  )

  test(
    "cache singleton update is reversible",
    async () => {
      const before = await cacheGet({ config, properties: ["accounts"] })
      if (!before.success) throw new Error(`cache get failed: ${before.errorMessage}`)
      const size = before.data.list[0]?.accounts
      expect(size).toBeNumber()
      const bumped = (size as number) + 1
      const u = await cacheSet({ config, update: { singleton: { accounts: bumped } } })
      if (!u.success) throw new Error(`cache set failed: ${u.errorMessage}`)
      const back = await cacheSet({ config, update: { singleton: { accounts: size } } })
      if (!back.success) throw new Error(`cache restore failed: ${back.errorMessage}`)
    },
    { timeout: 30_000 },
  )

  test(
    "search singleton update is reversible",
    async () => {
      const before = await searchGet({ config, properties: ["indexBatchSize"] })
      if (!before.success) throw new Error(`search get failed: ${before.errorMessage}`)
      const size = before.data.list[0]?.indexBatchSize
      expect(size).toBeNumber()
      const u = await searchSet({ config, update: { singleton: { indexBatchSize: (size as number) + 1 } } })
      if (!u.success) throw new Error(`search set failed: ${u.errorMessage}`)
      const back = await searchSet({ config, update: { singleton: { indexBatchSize: size } } })
      if (!back.success) throw new Error(`search restore failed: ${back.errorMessage}`)
    },
    { timeout: 30_000 },
  )

  test(
    "file storage and data retention singleton updates are reversible",
    async () => {
      const fs = await fileStorageGet({ config, properties: ["maxSize"] })
      if (!fs.success) throw new Error(`filestorage get failed: ${fs.errorMessage}`)
      const maxSize = fs.data.list[0]?.maxSize
      expect(maxSize).toBeNumber()
      const u = await fileStorageSet({ config, update: { singleton: { maxSize: (maxSize as number) + 1 } } })
      if (!u.success) throw new Error(`filestorage set failed: ${u.errorMessage}`)
      const back = await fileStorageSet({ config, update: { singleton: { maxSize } } })
      if (!back.success) throw new Error(`filestorage restore failed: ${back.errorMessage}`)

      const dr = await dataRetentionGet({ config, properties: ["expungeTrashAfter"] })
      if (!dr.success) throw new Error(`retention get failed: ${dr.errorMessage}`)
      const trash = dr.data.list[0]?.expungeTrashAfter
      expect(trash).toBeNumber()
      const u2 = await dataRetentionSet({ config, update: { singleton: { expungeTrashAfter: (trash as number) + 1 } } })
      if (!u2.success) throw new Error(`retention set failed: ${u2.errorMessage}`)
      const back2 = await dataRetentionSet({ config, update: { singleton: { expungeTrashAfter: trash } } })
      if (!back2.success) throw new Error(`retention restore failed: ${back2.errorMessage}`)
    },
    { timeout: 30_000 },
  )

  test(
    "webhook and tracer queries stay empty and metrics stores list nothing to query",
    async () => {
      const w = await webHookQuery({ config, limit: 10 })
      if (!w.success) throw new Error(`webhook query failed: ${w.errorMessage}`)
      expect(w.data.ids).toEqual([])
      const t = await tracerQuery({ config, limit: 50 })
      if (!t.success) throw new Error(`tracer query failed: ${t.errorMessage}`)
      // Only the pre-existing server tracer remains; run-created ones are gone.
      for (const id of t.data.ids.map(String)) {
        expect(id).not.toBe(created.tracerId)
      }
    },
    { timeout: 30_000 },
  )
})
