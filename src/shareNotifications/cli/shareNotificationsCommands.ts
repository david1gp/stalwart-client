import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliJsonParse } from "../../cli/cliJsonParse.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import { shareNotificationChanges } from "../shareNotificationChanges.js"
import { shareNotificationGet } from "../shareNotificationGet.js"
import { shareNotificationQuery } from "../shareNotificationQuery.js"
import { shareNotificationQueryChanges } from "../shareNotificationQueryChanges.js"
import { shareNotificationSet } from "../shareNotificationSet.js"

const accountIdFlag = cliScalarFlagParams.optionalString("JMAP accountId (default: session primary account)")

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
      shareNotificationGet({ config, accountId: flags.accountId, ids: flags.ids, properties: flags.properties }),
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
  docs: { brief: "ShareNotification/get — fetch share notifications" },
})

const setCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { accountId?: string; destroy?: string[] }) {
    await cliRunApi(this, flags, (config) =>
      shareNotificationSet({ config, accountId: flags.accountId, destroy: flags.destroy }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: accountIdFlag,
      destroy: cliScalarFlagParams.optionalStringList("Comma-separated notification ids to acknowledge"),
    },
  },
  docs: { brief: "ShareNotification/set — acknowledge (destroy) notifications; create/update are forbidden" },
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
    const op = "shareNotificationQuery"
    const filter = jsonFlagRead(op, "filterJson", flags.filterJson)
    const sortRaw = jsonFlagRead(op, "sortJson", flags.sortJson)
    await cliRunApi(this, flags, (config) =>
      shareNotificationQuery({
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
      filterJson: cliScalarFlagParams.optionalString("Filter as JSON"),
      sortJson: cliScalarFlagParams.optionalString('Sort as JSON array, e.g. [{"property":"created"}]'),
      limit: cliScalarFlagParams.optionalNumber("Max ids to return"),
      position: cliScalarFlagParams.optionalNumber("Zero-based start position"),
    },
  },
  docs: { brief: "ShareNotification/query — list share notification ids" },
})

const changesCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { accountId?: string; sinceState: string; maxChanges?: number },
  ) {
    await cliRunApi(this, flags, (config) =>
      shareNotificationChanges({
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
  docs: { brief: "ShareNotification/changes — poll share notification changes" },
})

const queryChangesCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { accountId?: string; sinceQueryState: string }) {
    await cliRunApi(this, flags, (config) =>
      shareNotificationQueryChanges({ config, accountId: flags.accountId, sinceQueryState: flags.sinceQueryState }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: accountIdFlag,
      sinceQueryState: cliScalarFlagParams.requiredString("Query state to compare against"),
    },
  },
  docs: { brief: "ShareNotification/queryChanges — poll query-result changes" },
})

export const shareNotificationsCommands = buildRouteMap({
  routes: {
    get: getCommand,
    set: setCommand,
    query: queryCommand,
    changes: changesCommand,
    "query-changes": queryChangesCommand,
  },
  docs: { brief: "Share notification methods" },
})
