import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliJsonParse } from "../../cli/cliJsonParse.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import { addressBookChanges } from "../addressBookChanges.js"
import { addressBookGet } from "../addressBookGet.js"
import { addressBookQuery } from "../addressBookQuery.js"
import { addressBookSet } from "../addressBookSet.js"

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
      addressBookGet({ config, accountId: flags.accountId, ids: flags.ids, properties: flags.properties }),
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
  docs: { brief: "AddressBook/get — fetch address books" },
})

const setCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { accountId?: string; createJson?: string; updateJson?: string; destroy?: string[] },
  ) {
    const op = "addressBookSet"
    const create = jsonFlagRead(op, "createJson", flags.createJson)
    const update = jsonFlagRead(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      addressBookSet({
        config,
        accountId: flags.accountId,
        create: create as Record<string, Record<string, unknown>> | undefined,
        update: update as Record<string, Record<string, unknown>> | undefined,
        destroy: flags.destroy,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: accountIdFlag,
      createJson: cliScalarFlagParams.optionalString('Creations as JSON: {"<creationId>": {name, …}}'),
      updateJson: cliScalarFlagParams.optionalString('Updates as JSON: {"<id>": {…patch…}}'),
      destroy: cliScalarFlagParams.optionalStringList("Comma-separated ids to destroy"),
    },
  },
  docs: { brief: "AddressBook/set — create, update or destroy address books" },
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
    const op = "addressBookQuery"
    const filter = jsonFlagRead(op, "filterJson", flags.filterJson)
    const sortRaw = jsonFlagRead(op, "sortJson", flags.sortJson)
    await cliRunApi(this, flags, (config) =>
      addressBookQuery({
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
      sortJson: cliScalarFlagParams.optionalString('Sort as JSON array, e.g. [{"property":"name"}]'),
      limit: cliScalarFlagParams.optionalNumber("Max ids to return"),
      position: cliScalarFlagParams.optionalNumber("Zero-based start position"),
    },
  },
  docs: { brief: "AddressBook/query — list address book ids" },
})

const changesCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { accountId?: string; sinceState: string; maxChanges?: number },
  ) {
    await cliRunApi(this, flags, (config) =>
      addressBookChanges({
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
  docs: { brief: "AddressBook/changes — poll address book changes" },
})

export const addressBooksCommands = buildRouteMap({
  routes: { get: getCommand, set: setCommand, query: queryCommand, changes: changesCommand },
  docs: { brief: "Address book methods" },
})
