import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { principalChanges } from "../principalChanges.js"
import { principalGet } from "../principalGet.js"
import { principalGetAvailability } from "../principalGetAvailability.js"
import { principalQuery } from "../principalQuery.js"
import { principalQueryChanges } from "../principalQueryChanges.js"
import { principalSet } from "../principalSet.js"
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
      principalGet({ config, accountId: flags.accountId, ids: flags.ids, properties: flags.properties }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: cliScalarFlagParams.optionalString("Account id (default: session primary account)"),
      ids: cliScalarFlagParams.optionalStringList("Comma-separated principal ids"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "Principal/get — fetch principals by id" },
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
    const op = "principalSet"
    const create = jsonFlagRead(op, "createJson", flags.createJson)
    const update = jsonFlagRead(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      principalSet({
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
      createJson: cliScalarFlagParams.optionalString('Creations as JSON: {"<creationId>": {…principal…}}'),
      updateJson: cliScalarFlagParams.optionalString('Updates as JSON: {"<id>": {…patch…}}'),
      destroy: cliScalarFlagParams.optionalStringList("Comma-separated ids to destroy"),
    },
  },
  docs: { brief: "Principal/set — create, update and/or destroy principals" },
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
    const op = "principalQuery"
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
      principalQuery({
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
      filterJson: cliScalarFlagParams.optionalString('Filter as JSON, e.g. {"email":"bob@example.test"}'),
      sortJson: cliScalarFlagParams.optionalString('Sort as JSON array, e.g. [{"property":"name"}]'),
      position: cliScalarFlagParams.optionalNumber("Zero-based start position"),
      anchor: cliScalarFlagParams.optionalString("Anchor id for pagination"),
      anchorOffset: cliScalarFlagParams.optionalNumber("Offset relative to the anchor"),
      limit: cliScalarFlagParams.optionalNumber("Max ids to return"),
      calculateTotal: cliScalarFlagParams.optionalBoolean("Return the total match count"),
    },
  },
  docs: { brief: "Principal/query — list principal ids matching a filter" },
})

const changesCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { accountId?: string; sinceState: string; maxChanges?: number },
  ) {
    await cliRunApi(this, flags, (config) =>
      principalChanges({
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
  docs: { brief: "Principal/changes — changed principal ids since a state" },
})

const queryChangesCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { accountId?: string; sinceQueryState: string; maxChanges?: number },
  ) {
    await cliRunApi(this, flags, (config) =>
      principalQueryChanges({
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
  docs: { brief: "Principal/queryChanges — changes to a previous Principal/query result" },
})

const getAvailabilityCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & {
      accountId?: string
      id: string
      utcStart: string
      utcEnd: string
      showDetails?: boolean
      eventProperties?: string[]
    },
  ) {
    await cliRunApi(this, flags, (config) =>
      principalGetAvailability({
        config,
        accountId: flags.accountId,
        id: flags.id,
        utcStart: flags.utcStart,
        utcEnd: flags.utcEnd,
        showDetails: flags.showDetails,
        eventProperties: flags.eventProperties,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: cliScalarFlagParams.optionalString("Account id (default: session primary account)"),
      id: cliScalarFlagParams.requiredString("Principal id to check"),
      utcStart: cliScalarFlagParams.requiredString("Range start, e.g. 2026-10-26T00:00:00Z"),
      utcEnd: cliScalarFlagParams.requiredString("Range end, e.g. 2026-10-27T00:00:00Z"),
      showDetails: cliScalarFlagParams.optionalBoolean("Include event details in busy periods"),
      eventProperties: cliScalarFlagParams.optionalStringList("Event properties to return (only id is supported)"),
    },
  },
  docs: { brief: "Principal/getAvailability — busy periods for a principal" },
})

export const principalsCommands = buildRouteMap({
  routes: {
    get: getCommand,
    set: setCommand,
    query: queryCommand,
    changes: changesCommand,
    "query-changes": queryChangesCommand,
    "get-availability": getAvailabilityCommand,
  },
  docs: { brief: "JMAP Principal methods" },
})
