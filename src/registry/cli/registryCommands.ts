import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliJsonParse } from "../../cli/cliJsonParse.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import type { RegistryObjectType } from "../generated/RegistryObjectType.js"
import { registryObjectTypes } from "../generated/registryObjectTypes.js"
import { registryGet } from "../registryGet.js"
import { registryQuery } from "../registryQuery.js"
import { registrySet } from "../registrySet.js"

const objectTypeFlag = cliScalarFlagParams.requiredString('Registry object type without the x: prefix, e.g. "Domain"')

function jsonFlagRead(op: string, flag: string, value: string | undefined): Record<string, unknown> | undefined {
  if (value === undefined) return undefined
  const parsed = cliJsonParse(value, op, flag)
  if (!parsed.success) cliFail(parsed)
  return parsed.data as Record<string, unknown>
}

const typesCommand = buildCommand({
  async func(this: CommandContext) {
    this.process.stdout.write(`${JSON.stringify(registryObjectTypes, null, 2)}\n`)
  },
  parameters: { flags: {} },
  docs: { brief: "List all registry object types with kind, methods and description (offline)" },
})

const getCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { type: string; ids?: string[]; properties?: string[] }) {
    await cliRunApi(this, flags, (config) =>
      registryGet({
        config,
        objectType: flags.type as RegistryObjectType,
        ids: flags.ids,
        properties: flags.properties,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      type: objectTypeFlag,
      ids: cliScalarFlagParams.optionalStringList("Comma-separated ids (default: all; singletons: the singleton)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:<Type>/get — fetch management objects" },
})

const queryCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { type: string; filterJson?: string; sortJson?: string; limit?: number; position?: number },
  ) {
    const op = "registryQuery"
    const filter = jsonFlagRead(op, "filterJson", flags.filterJson)
    const sort = jsonFlagRead(op, "sortJson", flags.sortJson)
    await cliRunApi(this, flags, (config) =>
      registryQuery({
        config,
        objectType: flags.type as RegistryObjectType,
        filter: filter as Record<string, string | number | boolean | null> | undefined,
        sort: sort as unknown as { property: string; isAscending?: boolean }[] | undefined,
        limit: flags.limit,
        position: flags.position,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      type: objectTypeFlag,
      filterJson: cliScalarFlagParams.optionalString(
        'Filter as JSON, e.g. {"name":"example.com"} or {"createdAtIsGreaterThan":"…"}',
      ),
      sortJson: cliScalarFlagParams.optionalString('Sort as JSON array, e.g. [{"property":"name"}]'),
      limit: cliScalarFlagParams.optionalNumber("Max ids to return"),
      position: cliScalarFlagParams.optionalNumber("Zero-based start position"),
    },
  },
  docs: { brief: "x:<Type>/query — list management object ids (not for singletons)" },
})

const setCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { type: string; createJson?: string; updateJson?: string; destroy?: string[] },
  ) {
    const op = "registrySet"
    const create = jsonFlagRead(op, "createJson", flags.createJson)
    const update = jsonFlagRead(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      registrySet({
        config,
        objectType: flags.type as RegistryObjectType,
        create: create as Record<string, Record<string, unknown>> | undefined,
        update: update as Record<string, Record<string, unknown>> | undefined,
        destroy: flags.destroy,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      type: objectTypeFlag,
      createJson: cliScalarFlagParams.optionalString('Creations as JSON: {"<creationId>": {…object…}}'),
      updateJson: cliScalarFlagParams.optionalString(
        'Updates as JSON: {"<id>": {…patch…}} (singletons: id "singleton")',
      ),
      destroy: cliScalarFlagParams.optionalStringList("Comma-separated ids to destroy"),
    },
  },
  docs: { brief: "x:<Type>/set — create, update and/or destroy management objects" },
})

export const registryCommands = buildRouteMap({
  routes: { types: typesCommand, get: getCommand, query: queryCommand, set: setCommand },
  docs: { brief: "Generic Stalwart management (registry) access for every x:* object type" },
})
