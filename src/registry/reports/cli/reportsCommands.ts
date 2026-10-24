import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { cliConfigFlagParams } from "../../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../../cli/cliConfigFlags.js"
import { cliJsonParse } from "../../../cli/cliJsonParse.js"
import { cliRunApi } from "../../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../../cli/cliScalarFlagParams.js"
import { cliFail } from "../../../cli/cliFail.js"
import { arfExternalReportGet } from "../arfExternalReportGet.js"
import { arfExternalReportQuery } from "../arfExternalReportQuery.js"
import { dmarcExternalReportGet } from "../dmarcExternalReportGet.js"
import { dmarcExternalReportQuery } from "../dmarcExternalReportQuery.js"
import { dmarcInternalReportGet } from "../dmarcInternalReportGet.js"
import { dmarcInternalReportQuery } from "../dmarcInternalReportQuery.js"
import { reportDestroy } from "../reportDestroy.js"
import { reportReschedule } from "../reportReschedule.js"
import { tlsExternalReportGet } from "../tlsExternalReportGet.js"
import { tlsExternalReportQuery } from "../tlsExternalReportQuery.js"
import { tlsInternalReportGet } from "../tlsInternalReportGet.js"
import { tlsInternalReportQuery } from "../tlsInternalReportQuery.js"
import type { RegistryFilter } from "../../registryFilterSchema.js"

// biome-ignore lint/suspicious/noExplicitAny: route builders share one shape across 6 report families.
type AnyOp = (options: any) => Promise<any>

type GetFlags = CliConfigFlags & { ids?: string[]; properties?: string[] }

type QueryFlags = CliConfigFlags & {
  filterJson?: string
  sortJson?: string
  limit?: number
  position?: number
}

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
    filterJson: cliScalarFlagParams.optionalString('Filter as JSON, e.g. {"domain":"example.com"}'),
    sortJson: cliScalarFlagParams.optionalString('Sort as JSON array, e.g. [{"property":"id"}]'),
    limit: cliScalarFlagParams.optionalNumber("Max ids to return"),
    position: cliScalarFlagParams.optionalNumber("Zero-based start position"),
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
  return { filter, sort, limit: flags.limit, position: flags.position }
}

function reportGetRoute(brief: string, run: AnyOp) {
  return buildCommand({
    async func(this: CommandContext, flags: GetFlags) {
      await cliRunApi(this, flags, (config) => run({ config, ids: flags.ids, properties: flags.properties }))
    },
    parameters: { flags: getFlags() },
    docs: { brief },
  })
}

function reportQueryRoute(brief: string, run: AnyOp) {
  return buildCommand({
    async func(this: CommandContext, flags: QueryFlags) {
      const args = queryArgs("reportQuery", flags)
      await cliRunApi(this, flags, (config) => run({ config, ...args }))
    },
    parameters: { flags: queryFlags() },
    docs: { brief },
  })
}

const destroyCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { type: string; ids?: string[] }) {
    if (flags.ids === undefined || flags.ids.length === 0) {
      cliFail({ op: "reportDestroy", errorMessage: "Missing required --ids (comma-separated report ids)" })
    }
    await cliRunApi(this, flags, (config) =>
      reportDestroy({ config, objectType: flags.type as "ArfExternalReport", ids: flags.ids as string[] }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      type: cliScalarFlagParams.requiredString(
        "Report type: ArfExternalReport, DmarcExternalReport, TlsExternalReport, DmarcInternalReport or TlsInternalReport",
      ),
      ids: cliScalarFlagParams.optionalStringList("Comma-separated report ids to destroy"),
    },
  },
  docs: { brief: "Destroy stored reports (reports cannot be created or, for external reports, updated)" },
})

const rescheduleCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { type: string; id: string; deliverAt: string }) {
    await cliRunApi(this, flags, (config) =>
      reportReschedule({
        config,
        objectType: flags.type as "DmarcInternalReport",
        id: flags.id,
        deliverAt: flags.deliverAt,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      type: cliScalarFlagParams.requiredString("Internal report type: DmarcInternalReport or TlsInternalReport"),
      id: cliScalarFlagParams.requiredString("Report id to reschedule"),
      deliverAt: cliScalarFlagParams.requiredString("New delivery time (future UTC date-time)"),
    },
  },
  docs: { brief: "Reschedule an outbound report by setting a future deliverAt" },
})

export const reportsCommands = buildRouteMap({
  routes: {
    "arf-external-report": buildRouteMap({
      routes: {
        get: reportGetRoute("x:ArfExternalReport/get — fetch stored ARF feedback reports", arfExternalReportGet),
        query: reportQueryRoute("x:ArfExternalReport/query — list stored ARF feedback reports", arfExternalReportQuery),
      },
      docs: { brief: "Inbound ARF feedback reports" },
    }),
    "dmarc-external-report": buildRouteMap({
      routes: {
        get: reportGetRoute("x:DmarcExternalReport/get — fetch stored inbound DMARC reports", dmarcExternalReportGet),
        query: reportQueryRoute(
          "x:DmarcExternalReport/query — list stored inbound DMARC reports",
          dmarcExternalReportQuery,
        ),
      },
      docs: { brief: "Inbound DMARC aggregate reports" },
    }),
    "tls-external-report": buildRouteMap({
      routes: {
        get: reportGetRoute("x:TlsExternalReport/get — fetch stored inbound TLS reports", tlsExternalReportGet),
        query: reportQueryRoute("x:TlsExternalReport/query — list stored inbound TLS reports", tlsExternalReportQuery),
      },
      docs: { brief: "Inbound TLS aggregate reports" },
    }),
    "dmarc-internal-report": buildRouteMap({
      routes: {
        get: reportGetRoute("x:DmarcInternalReport/get — fetch outbound DMARC reports", dmarcInternalReportGet),
        query: reportQueryRoute("x:DmarcInternalReport/query — list outbound DMARC reports", dmarcInternalReportQuery),
      },
      docs: { brief: "Outbound DMARC aggregate reports" },
    }),
    "tls-internal-report": buildRouteMap({
      routes: {
        get: reportGetRoute("x:TlsInternalReport/get — fetch outbound TLS reports", tlsInternalReportGet),
        query: reportQueryRoute("x:TlsInternalReport/query — list outbound TLS reports", tlsInternalReportQuery),
      },
      docs: { brief: "Outbound TLS aggregate reports" },
    }),
    report: buildRouteMap({
      routes: { destroy: destroyCommand, reschedule: rescheduleCommand },
      docs: { brief: "Destroy or reschedule stored reports" },
    }),
  },
  docs: { brief: "DMARC/TLS/ARF aggregate and feedback reports" },
})
