import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { calendarEventNotificationChanges } from "../calendarEventNotificationChanges.js"
import { calendarEventNotificationGet } from "../calendarEventNotificationGet.js"
import { calendarEventNotificationQuery } from "../calendarEventNotificationQuery.js"
import { calendarEventNotificationQueryChanges } from "../calendarEventNotificationQueryChanges.js"
import { calendarEventNotificationSet } from "../calendarEventNotificationSet.js"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliJsonParse } from "../../cli/cliJsonParse.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"

function jsonFlagRead(
  op: string,
  flag: string,
  value: string | undefined,
): Record<string, Record<string, unknown>> | undefined {
  if (value === undefined) return undefined
  const parsed = cliJsonParse(value, op, flag)
  if (!parsed.success) cliFail(parsed)
  return parsed.data as Record<string, Record<string, unknown>>
}

const getCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { accountId?: string; ids?: string[]; properties?: string[] },
  ) {
    await cliRunApi(this, flags, (config) =>
      calendarEventNotificationGet({
        config,
        accountId: flags.accountId,
        ids: flags.ids,
        properties: flags.properties,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: cliScalarFlagParams.optionalString("Account id (default: session primary account)"),
      ids: cliScalarFlagParams.optionalStringList("Comma-separated notification ids"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "CalendarEventNotification/get — fetch notifications by id" },
})

const setCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & {
      accountId?: string
      ifInState?: string
      createJson?: string
      updateJson?: string
      destroy?: string[]
    },
  ) {
    const op = "calendarEventNotificationSet"
    const create = jsonFlagRead(op, "createJson", flags.createJson)
    const update = jsonFlagRead(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      calendarEventNotificationSet({
        config,
        accountId: flags.accountId,
        ifInState: flags.ifInState,
        create,
        update,
        destroy: flags.destroy,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: cliScalarFlagParams.optionalString("Account id (default: session primary account)"),
      ifInState: cliScalarFlagParams.optionalString("Require this state before applying"),
      createJson: cliScalarFlagParams.optionalString('Creations as JSON: {"<creationId>": {…notification…}}'),
      updateJson: cliScalarFlagParams.optionalString('Updates as JSON: {"<id>": {…patch…}}'),
      destroy: cliScalarFlagParams.optionalStringList("Comma-separated ids to destroy (acknowledge)"),
    },
  },
  docs: { brief: "CalendarEventNotification/set — destroy (acknowledge) notifications" },
})

const queryCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & {
      accountId?: string
      filterJson?: string
      sortJson?: string
      position?: number
      anchor?: string
      anchorOffset?: number
      limit?: number
      calculateTotal?: boolean
    },
  ) {
    const op = "calendarEventNotificationQuery"
    const filter = jsonFlagRead(op, "filterJson", flags.filterJson)
    const sortParsed =
      flags.sortJson === undefined
        ? undefined
        : (() => {
            const parsed = cliJsonParse(flags.sortJson, op, "sortJson")
            if (!parsed.success) cliFail(parsed)
            return parsed.data as { property: string; isAscending?: boolean }[]
          })()
    await cliRunApi(this, flags, (config) =>
      calendarEventNotificationQuery({
        config,
        accountId: flags.accountId,
        filter,
        sort: sortParsed,
        position: flags.position,
        anchor: flags.anchor,
        anchorOffset: flags.anchorOffset,
        limit: flags.limit,
        calculateTotal: flags.calculateTotal,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: cliScalarFlagParams.optionalString("Account id (default: session primary account)"),
      filterJson: cliScalarFlagParams.optionalString('Filter as JSON, e.g. {"type":"created"}'),
      sortJson: cliScalarFlagParams.optionalString('Sort as JSON array, e.g. [{"property":"created"}]'),
      position: cliScalarFlagParams.optionalNumber("Zero-based start position"),
      anchor: cliScalarFlagParams.optionalString("Anchor id for pagination"),
      anchorOffset: cliScalarFlagParams.optionalNumber("Offset relative to the anchor"),
      limit: cliScalarFlagParams.optionalNumber("Max ids to return"),
      calculateTotal: cliScalarFlagParams.optionalBoolean("Return the total match count"),
    },
  },
  docs: { brief: "CalendarEventNotification/query — list notification ids matching a filter" },
})

const changesCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { accountId?: string; sinceState: string; maxChanges?: number },
  ) {
    await cliRunApi(this, flags, (config) =>
      calendarEventNotificationChanges({
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
      accountId: cliScalarFlagParams.optionalString("Account id (default: session primary account)"),
      sinceState: cliScalarFlagParams.requiredString("State to compare against"),
      maxChanges: cliScalarFlagParams.optionalNumber("Max changes to return"),
    },
  },
  docs: { brief: "CalendarEventNotification/changes — changed notification ids since a state" },
})

const queryChangesCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { accountId?: string; sinceQueryState: string; maxChanges?: number },
  ) {
    await cliRunApi(this, flags, (config) =>
      calendarEventNotificationQueryChanges({
        config,
        accountId: flags.accountId,
        sinceQueryState: flags.sinceQueryState,
        maxChanges: flags.maxChanges,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: cliScalarFlagParams.optionalString("Account id (default: session primary account)"),
      sinceQueryState: cliScalarFlagParams.requiredString("Query state to compare against"),
      maxChanges: cliScalarFlagParams.optionalNumber("Max changes to return"),
    },
  },
  docs: { brief: "CalendarEventNotification/queryChanges — changes to a previous query result" },
})

export const calendarEventNotificationsCommands = buildRouteMap({
  routes: {
    get: getCommand,
    set: setCommand,
    query: queryCommand,
    changes: changesCommand,
    "query-changes": queryChangesCommand,
  },
  docs: { brief: "JMAP CalendarEventNotification methods" },
})
