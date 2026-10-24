import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { cliConfigFlagParams } from "../../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../../cli/cliConfigFlags.js"
import { cliFail } from "../../../cli/cliFail.js"
import { cliJsonParse } from "../../../cli/cliJsonParse.js"
import { cliRunApi } from "../../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../../cli/cliScalarFlagParams.js"
import { alertGet } from "../alertGet.js"
import { alertQuery } from "../alertQuery.js"
import { alertSet } from "../alertSet.js"
import { eventTracingLevelGet } from "../eventTracingLevelGet.js"
import { eventTracingLevelQuery } from "../eventTracingLevelQuery.js"
import { eventTracingLevelSet } from "../eventTracingLevelSet.js"
import { logGet } from "../logGet.js"
import { logQuery } from "../logQuery.js"
import { metricGet } from "../metricGet.js"
import { metricQuery } from "../metricQuery.js"
import { metricsGet } from "../metricsGet.js"
import { metricsSet } from "../metricsSet.js"
import { metricsStoreGet } from "../metricsStoreGet.js"
import { metricsStoreSet } from "../metricsStoreSet.js"
import type { RegistryFilter } from "../../registryFilterSchema.js"
import { traceGet } from "../traceGet.js"
import { traceQuery } from "../traceQuery.js"
import { tracerGet } from "../tracerGet.js"
import { tracerQuery } from "../tracerQuery.js"
import { tracerSet } from "../tracerSet.js"
import { tracingStoreGet } from "../tracingStoreGet.js"
import { tracingStoreSet } from "../tracingStoreSet.js"
import { webHookGet } from "../webHookGet.js"
import { webHookQuery } from "../webHookQuery.js"
import { webHookSet } from "../webHookSet.js"

// biome-ignore lint/suspicious/noExplicitAny: route builders share one shape across 10 telemetry families.
type AnyOp = (options: any) => Promise<any>

type GetFlags = CliConfigFlags & { ids?: string[]; properties?: string[] }

type SingletonGetFlags = CliConfigFlags & { properties?: string[] }

type QueryFlags = CliConfigFlags & {
  filterJson?: string
  sortJson?: string
  limit?: number
  position?: number
  anchor?: string
}

type SetFlags = CliConfigFlags & {
  createJson?: string
  updateJson?: string
  destroy?: string[]
}

type SingletonSetFlags = CliConfigFlags & { updateJson: string }

type LogQueryFlags = CliConfigFlags & { text?: string; limit?: number; anchor?: string }

function getFlags() {
  return {
    ...cliConfigFlagParams,
    ids: cliScalarFlagParams.optionalStringList("Comma-separated ids to fetch (default: all)"),
    properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
  }
}

function queryFlags() {
  return {
    ...cliConfigFlagParams,
    filterJson: cliScalarFlagParams.optionalString('Filter as JSON, e.g. {"text":"smtp"}'),
    sortJson: cliScalarFlagParams.optionalString('Sort as JSON array, e.g. [{"property":"id"}]'),
    limit: cliScalarFlagParams.optionalNumber("Max ids to return"),
    position: cliScalarFlagParams.optionalNumber("Zero-based start position"),
    anchor: cliScalarFlagParams.optionalString("Anchor id for pagination"),
  }
}

function setFlags() {
  return {
    ...cliConfigFlagParams,
    createJson: cliScalarFlagParams.optionalString('Creations as JSON: {"<creationId>": {…object…}}'),
    updateJson: cliScalarFlagParams.optionalString('Updates as JSON: {"<id>": {…patch…}}'),
    destroy: cliScalarFlagParams.optionalStringList("Comma-separated ids to destroy"),
  }
}

function queryArgs(op: string, flags: QueryFlags) {
  const filter =
    flags.filterJson === undefined
      ? undefined
      : (() => {
          const parsed = cliJsonParse(flags.filterJson, op, "filterJson")
          if (!parsed.success) cliFail(parsed)
          return parsed.data as RegistryFilter
        })()
  const sort =
    flags.sortJson === undefined
      ? undefined
      : (() => {
          const parsed = cliJsonParse(flags.sortJson, op, "sortJson")
          if (!parsed.success) cliFail(parsed)
          return parsed.data as { property: string; isAscending?: boolean }[]
        })()
  return { filter, sort, limit: flags.limit, position: flags.position, anchor: flags.anchor }
}

function setArgs(op: string, flags: SetFlags) {
  const create =
    flags.createJson === undefined
      ? undefined
      : (() => {
          const parsed = cliJsonParse(flags.createJson, op, "createJson")
          if (!parsed.success) cliFail(parsed)
          return parsed.data as Record<string, Record<string, unknown>>
        })()
  const update =
    flags.updateJson === undefined
      ? undefined
      : (() => {
          const parsed = cliJsonParse(flags.updateJson, op, "updateJson")
          if (!parsed.success) cliFail(parsed)
          return parsed.data as Record<string, Record<string, unknown>>
        })()
  return { create, update, destroy: flags.destroy }
}

function getRoute(brief: string, run: AnyOp) {
  return buildCommand({
    async func(this: CommandContext, flags: GetFlags) {
      await cliRunApi(this, flags, (config) => run({ config, ids: flags.ids, properties: flags.properties }))
    },
    parameters: { flags: getFlags() },
    docs: { brief },
  })
}

function queryRoute(brief: string, run: AnyOp) {
  return buildCommand({
    async func(this: CommandContext, flags: QueryFlags) {
      const args = queryArgs("telemetryQuery", flags)
      await cliRunApi(this, flags, (config) => run({ config, ...args }))
    },
    parameters: { flags: queryFlags() },
    docs: { brief },
  })
}

function setRoute(brief: string, run: AnyOp) {
  return buildCommand({
    async func(this: CommandContext, flags: SetFlags) {
      const args = setArgs("telemetrySet", flags)
      await cliRunApi(this, flags, (config) => run({ config, ...args }))
    },
    parameters: { flags: setFlags() },
    docs: { brief },
  })
}

function singletonGetRoute(brief: string, run: AnyOp) {
  return buildCommand({
    async func(this: CommandContext, flags: SingletonGetFlags) {
      await cliRunApi(this, flags, (config) => run({ config, properties: flags.properties }))
    },
    parameters: {
      flags: {
        ...cliConfigFlagParams,
        properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
      },
    },
    docs: { brief },
  })
}

function singletonSetRoute(brief: string, run: AnyOp) {
  return buildCommand({
    async func(this: CommandContext, flags: SingletonSetFlags) {
      const op = "telemetrySet"
      const parsed = cliJsonParse(flags.updateJson, op, "updateJson")
      if (!parsed.success) cliFail(parsed)
      await cliRunApi(this, flags, (config) =>
        run({ config, update: parsed.data as Record<string, Record<string, unknown>> }),
      )
    },
    parameters: {
      flags: {
        ...cliConfigFlagParams,
        updateJson: cliScalarFlagParams.requiredString('Updates as JSON: {"singleton": {…patch…}}'),
      },
    },
    docs: { brief },
  })
}

export const telemetryCommands = buildRouteMap({
  routes: {
    log: buildRouteMap({
      routes: {
        get: getRoute("x:Log/get — fetch server log entries", logGet),
        query: buildCommand({
          async func(this: CommandContext, flags: LogQueryFlags) {
            await cliRunApi(this, flags, (config) =>
              logQuery({
                config,
                filter: flags.text === undefined ? undefined : { text: flags.text },
                limit: flags.limit,
                anchor: flags.anchor,
              }),
            )
          },
          parameters: {
            flags: {
              ...cliConfigFlagParams,
              text: cliScalarFlagParams.optionalString("Free-text match against the raw log line"),
              limit: cliScalarFlagParams.optionalNumber("Max ids to return"),
              anchor: cliScalarFlagParams.optionalString("Anchor id for pagination"),
            },
          },
          docs: { brief: "x:Log/query — list recent server log entry ids (text filter only)" },
        }),
      },
      docs: { brief: "Server log entries (read-only)" },
    }),
    trace: buildRouteMap({
      routes: {
        get: getRoute("x:Trace/get — fetch delivery traces (enterprise-only)", traceGet),
        query: queryRoute("x:Trace/query — list delivery trace ids (enterprise-only)", traceQuery),
      },
      docs: { brief: "Message delivery traces (read-only, enterprise-only)" },
    }),
    metric: buildRouteMap({
      routes: {
        get: getRoute("x:Metric/get — fetch collected metric data points (enterprise-only)", metricGet),
        query: queryRoute("x:Metric/query — list collected metric ids (enterprise-only)", metricQuery),
      },
      docs: { brief: "Collected metric data points (read-only, enterprise-only)" },
    }),
    tracer: buildRouteMap({
      routes: {
        get: getRoute("x:Tracer/get — fetch logging/tracing outputs", tracerGet),
        query: queryRoute("x:Tracer/query — list logging/tracing output ids", tracerQuery),
        set: setRoute("x:Tracer/set — create, update or destroy logging/tracing outputs", tracerSet),
      },
      docs: { brief: "Logging and tracing output definitions" },
    }),
    alert: buildRouteMap({
      routes: {
        get: getRoute("x:Alert/get — fetch metric-condition alert rules", alertGet),
        query: queryRoute("x:Alert/query — list alert rule ids", alertQuery),
        set: setRoute("x:Alert/set — create, update or destroy alert rules", alertSet),
      },
      docs: { brief: "Metric-condition alert rules" },
    }),
    "web-hook": buildRouteMap({
      routes: {
        get: getRoute("x:WebHook/get — fetch event-notification webhooks", webHookGet),
        query: queryRoute("x:WebHook/query — list webhook ids", webHookQuery),
        set: setRoute("x:WebHook/set — create, update or destroy webhooks", webHookSet),
      },
      docs: { brief: "Event-notification webhook endpoints" },
    }),
    metrics: buildRouteMap({
      routes: {
        get: singletonGetRoute("x:Metrics/get — fetch the metrics collection singleton", metricsGet),
        set: singletonSetRoute("x:Metrics/set — update the metrics collection singleton", metricsSet),
      },
      docs: { brief: "Metrics collection and export config (singleton)" },
    }),
    "metrics-store": buildRouteMap({
      routes: {
        get: singletonGetRoute("x:MetricsStore/get — fetch the metrics store singleton", metricsStoreGet),
        set: singletonSetRoute("x:MetricsStore/set — update the metrics store singleton", metricsStoreSet),
      },
      docs: { brief: "Metrics storage backend (singleton, repointing breaks the server)" },
    }),
    "tracing-store": buildRouteMap({
      routes: {
        get: singletonGetRoute("x:TracingStore/get — fetch the tracing store singleton", tracingStoreGet),
        set: singletonSetRoute("x:TracingStore/set — update the tracing store singleton", tracingStoreSet),
      },
      docs: { brief: "Tracing storage backend (singleton, repointing breaks the server)" },
    }),
    "event-tracing-level": buildRouteMap({
      routes: {
        get: getRoute("x:EventTracingLevel/get — fetch per-event level overrides", eventTracingLevelGet),
        query: queryRoute("x:EventTracingLevel/query — list per-event level override ids", eventTracingLevelQuery),
        set: setRoute("x:EventTracingLevel/set — create, update or destroy level overrides", eventTracingLevelSet),
      },
      docs: { brief: "Per-event logging level overrides" },
    }),
  },
  docs: { brief: "Telemetry: logs, traces, metrics, tracers, alerts, webhooks and stores" },
})
