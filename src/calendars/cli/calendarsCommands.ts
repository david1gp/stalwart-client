import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { calendarChanges } from "../calendarChanges.js"
import { calendarGet } from "../calendarGet.js"
import { calendarQuery } from "../calendarQuery.js"
import { calendarSet } from "../calendarSet.js"
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
      calendarGet({ config, accountId: flags.accountId, ids: flags.ids, properties: flags.properties }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: cliScalarFlagParams.optionalString("Account id (default: session primary account)"),
      ids: cliScalarFlagParams.optionalStringList("Comma-separated calendar ids"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "Calendar/get — fetch calendars by id" },
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
      onDestroyRemoveEvents?: boolean
      onSuccessSetIsDefault?: string
    },
  ) {
    const op = "calendarSet"
    const create = jsonFlagRead(op, "createJson", flags.createJson)
    const update = jsonFlagRead(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      calendarSet({
        config,
        accountId: flags.accountId,
        ifInState: flags.ifInState,
        create,
        update,
        destroy: flags.destroy,
        onDestroyRemoveEvents: flags.onDestroyRemoveEvents,
        onSuccessSetIsDefault: flags.onSuccessSetIsDefault,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: cliScalarFlagParams.optionalString("Account id (default: session primary account)"),
      ifInState: cliScalarFlagParams.optionalString("Require this state before applying"),
      createJson: cliScalarFlagParams.optionalString('Creations as JSON: {"<creationId>": {…calendar…}}'),
      updateJson: cliScalarFlagParams.optionalString('Updates as JSON: {"<id>": {…patch…}}'),
      destroy: cliScalarFlagParams.optionalStringList("Comma-separated ids to destroy"),
      onDestroyRemoveEvents: cliScalarFlagParams.optionalBoolean("Also remove events when destroying calendars"),
      onSuccessSetIsDefault: cliScalarFlagParams.optionalString(
        "Set this calendar default on success (id or #creationId)",
      ),
    },
  },
  docs: { brief: "Calendar/set — create, update and/or destroy calendars" },
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
    const op = "calendarQuery"
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
      calendarQuery({
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
      filterJson: cliScalarFlagParams.optionalString("Filter as JSON (ignored server-side for calendars)"),
      sortJson: cliScalarFlagParams.optionalString('Sort as JSON array, e.g. [{"property":"name"}]'),
      position: cliScalarFlagParams.optionalNumber("Zero-based start position"),
      anchor: cliScalarFlagParams.optionalString("Anchor id for pagination"),
      anchorOffset: cliScalarFlagParams.optionalNumber("Offset relative to the anchor"),
      limit: cliScalarFlagParams.optionalNumber("Max ids to return"),
      calculateTotal: cliScalarFlagParams.optionalBoolean("Return the total match count"),
    },
  },
  docs: { brief: "Calendar/query — list calendar ids" },
})

const changesCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { accountId?: string; sinceState: string; maxChanges?: number },
  ) {
    await cliRunApi(this, flags, (config) =>
      calendarChanges({
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
  docs: { brief: "Calendar/changes — changed calendar ids since a state" },
})

export const calendarsCommands = buildRouteMap({
  routes: {
    get: getCommand,
    set: setCommand,
    query: queryCommand,
    changes: changesCommand,
  },
  docs: { brief: "JMAP Calendar methods" },
})
