import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliJsonParse } from "../../cli/cliJsonParse.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import { quotaChanges } from "../quotaChanges.js"
import { quotaGet } from "../quotaGet.js"
import { quotaQuery } from "../quotaQuery.js"
import { quotaQueryChanges } from "../quotaQueryChanges.js"

const accountIdFlag = cliScalarFlagParams.optionalString("JMAP accountId (default: session primary account)")
const filterJsonFlag = cliScalarFlagParams.optionalString("Filter as JSON")
const sortJsonFlag = cliScalarFlagParams.optionalString('Sort as JSON array, e.g. [{"property":"name"}]')

function jsonFlagRead(op: string, flag: string, value: string | undefined): Record<string, unknown> | undefined {
  if (value === undefined) return undefined
  const parsed = cliJsonParse(value, op, flag)
  if (!parsed.success) cliFail(parsed)
  return parsed.data as Record<string, unknown>
}

const getCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { accountId?: string; ids?: string[]; properties?: string[] },
  ) {
    await cliRunApi(this, flags, (config) =>
      quotaGet({ config, accountId: flags.accountId, ids: flags.ids, properties: flags.properties }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: accountIdFlag,
      ids: cliScalarFlagParams.optionalStringList("Comma-separated ids"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "Quota/get — fetch quota objects" },
})

const changesCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { accountId?: string; sinceState: string; maxChanges?: number },
  ) {
    await cliRunApi(this, flags, (config) =>
      quotaChanges({
        config,
        accountId: flags.accountId,
        sinceState: flags.sinceState,
        maxChanges: flags.maxChanges,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: accountIdFlag,
      sinceState: cliScalarFlagParams.requiredString("State to compare against (usually a previous get state)"),
      maxChanges: cliScalarFlagParams.optionalNumber("Max changes to return"),
    },
  },
  docs: { brief: "Quota/changes — poll quota changes" },
})

const queryCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & {
      accountId?: string
      filterJson?: string
      sortJson?: string
      limit?: number
      position?: number
    },
  ) {
    const op = "quotaQuery"
    const filter = jsonFlagRead(op, "filterJson", flags.filterJson)
    const sortRaw = jsonFlagRead(op, "sortJson", flags.sortJson)
    await cliRunApi(this, flags, (config) =>
      quotaQuery({
        config,
        accountId: flags.accountId,
        filter: filter as Record<string, unknown> | undefined,
        sort: sortRaw as unknown as { property: string; isAscending?: boolean }[] | undefined,
        limit: flags.limit,
        position: flags.position,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: accountIdFlag,
      filterJson: filterJsonFlag,
      sortJson: sortJsonFlag,
      limit: cliScalarFlagParams.optionalNumber("Max ids to return"),
      position: cliScalarFlagParams.optionalNumber("Zero-based start position"),
    },
  },
  docs: { brief: "Quota/query — list quota ids" },
})

const queryChangesCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { accountId?: string; sinceQueryState: string }) {
    await cliRunApi(this, flags, (config) =>
      quotaQueryChanges({ config, accountId: flags.accountId, sinceQueryState: flags.sinceQueryState }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: accountIdFlag,
      sinceQueryState: cliScalarFlagParams.requiredString("Query state to compare against"),
    },
  },
  docs: { brief: "Quota/queryChanges — poll query-result changes (rejected by the community server)" },
})

export const quotasCommands = buildRouteMap({
  routes: { get: getCommand, changes: changesCommand, query: queryCommand, "query-changes": queryChangesCommand },
  docs: { brief: "Quota methods" },
})
