import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliJsonParse } from "../../cli/cliJsonParse.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import { sieveScriptActivate } from "../sieveScriptActivate.js"
import { sieveScriptGet } from "../sieveScriptGet.js"
import { sieveScriptQuery } from "../sieveScriptQuery.js"
import { sieveScriptSet } from "../sieveScriptSet.js"
import { sieveScriptValidate } from "../sieveScriptValidate.js"

const accountIdFlag = cliScalarFlagParams.optionalString("JMAP accountId (default: session primary account)")
const idsFlag = cliScalarFlagParams.optionalStringList("Comma-separated ids")
const propertiesFlag = cliScalarFlagParams.optionalStringList("Comma-separated properties to return")
const filterJsonFlag = cliScalarFlagParams.optionalString('Filter as JSON, e.g. {"name":"script"}')
const sortJsonFlag = cliScalarFlagParams.optionalString('Sort as JSON array, e.g. [{"property":"name"}]')
const createJsonFlag = cliScalarFlagParams.optionalString('Creations as JSON: {"<creationId>": {name, blobId}}')
const updateJsonFlag = cliScalarFlagParams.optionalString('Updates as JSON: {"<id>": {…patch…}}')
const destroyFlag = cliScalarFlagParams.optionalStringList("Comma-separated ids to destroy")

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
      sieveScriptGet({ config, accountId: flags.accountId, ids: flags.ids, properties: flags.properties }),
    )
  },
  parameters: { flags: { ...cliConfigFlagParams, accountId: accountIdFlag, ids: idsFlag, properties: propertiesFlag } },
  docs: { brief: "SieveScript/get — fetch Sieve scripts" },
})

const setCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & {
      accountId?: string
      createJson?: string
      updateJson?: string
      destroy?: string[]
      onSuccessActivateScript?: string
      onSuccessDeactivateScript?: boolean
    },
  ) {
    const op = "sieveScriptSet"
    const create = jsonFlagRead(op, "createJson", flags.createJson)
    const update = jsonFlagRead(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      sieveScriptSet({
        config,
        accountId: flags.accountId,
        create: create as Record<string, Record<string, unknown>> | undefined,
        update: update as Record<string, Record<string, unknown>> | undefined,
        destroy: flags.destroy,
        onSuccessActivateScript: flags.onSuccessActivateScript,
        onSuccessDeactivateScript: flags.onSuccessDeactivateScript,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: accountIdFlag,
      createJson: createJsonFlag,
      updateJson: updateJsonFlag,
      destroy: destroyFlag,
      onSuccessActivateScript: cliScalarFlagParams.optionalString("Activate this script id on success"),
      onSuccessDeactivateScript: cliScalarFlagParams.optionalBoolean("Deactivate the active script on success"),
    },
  },
  docs: { brief: "SieveScript/set — create, update, destroy or (de)activate scripts" },
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
    const op = "sieveScriptQuery"
    const filter = jsonFlagRead(op, "filterJson", flags.filterJson)
    const sortRaw = jsonFlagRead(op, "sortJson", flags.sortJson)
    await cliRunApi(this, flags, (config) =>
      sieveScriptQuery({
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
  docs: { brief: "SieveScript/query — list Sieve script ids" },
})

const validateCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { accountId?: string; blobId: string }) {
    await cliRunApi(this, flags, (config) =>
      sieveScriptValidate({ config, accountId: flags.accountId, blobId: flags.blobId }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: accountIdFlag,
      blobId: cliScalarFlagParams.requiredString("Blob id holding the script source"),
    },
  },
  docs: { brief: "SieveScript/validate — compile-check a script blob" },
})

const activateCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { accountId?: string; id: string }) {
    await cliRunApi(this, flags, (config) => sieveScriptActivate({ config, accountId: flags.accountId, id: flags.id }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: accountIdFlag,
      id: cliScalarFlagParams.requiredString("Sieve script id to activate"),
    },
  },
  docs: { brief: "Activate a Sieve script (SieveScript/set with onSuccessActivateScript)" },
})

export const sieveScriptsCommands = buildRouteMap({
  routes: {
    get: getCommand,
    set: setCommand,
    query: queryCommand,
    validate: validateCommand,
    activate: activateCommand,
  },
  docs: { brief: "Sieve script methods" },
})
