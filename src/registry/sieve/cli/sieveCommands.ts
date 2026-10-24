import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { cliConfigFlagParams } from "../../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../../cli/cliConfigFlags.js"
import { cliFail } from "../../../cli/cliFail.js"
import { cliJsonParse } from "../../../cli/cliJsonParse.js"
import { cliRunApi } from "../../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../../cli/cliScalarFlagParams.js"
import { sieveSystemInterpreterGet } from "../sieveSystemInterpreterGet.js"
import { sieveSystemInterpreterSet } from "../sieveSystemInterpreterSet.js"
import { sieveSystemScriptGet } from "../sieveSystemScriptGet.js"
import { sieveSystemScriptSet } from "../sieveSystemScriptSet.js"
import { sieveUserInterpreterGet } from "../sieveUserInterpreterGet.js"
import { sieveUserInterpreterSet } from "../sieveUserInterpreterSet.js"
import { sieveUserScriptGet } from "../sieveUserScriptGet.js"
import { sieveUserScriptSet } from "../sieveUserScriptSet.js"
import { sieveSystemScriptQuery } from "../sieveSystemScriptQuery.js"
import { sieveUserScriptQuery } from "../sieveUserScriptQuery.js"
import { sieveSystemScriptCreate } from "../sieveSystemScriptCreate.js"

function flagJson(op: string, flag: string, value: string | undefined): unknown {
  if (value === undefined) return undefined
  const parsed = cliJsonParse(value, op, flag)
  if (!parsed.success) cliFail(parsed)
  return parsed.data
}

const sieveSystemInterpreterGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { properties?: string[] }) {
    await cliRunApi(this, flags, (config) => sieveSystemInterpreterGet({ config, properties: flags.properties }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:SieveSystemInterpreter/get — fetch SieveSystemInterpreter (singletons: the singleton)" },
})

const sieveSystemInterpreterSetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { updateJson: string }) {
    const op = "sieveSystemInterpreterSet"
    const update = flagJson(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      sieveSystemInterpreterSet({
        config,
        update: update as Record<string, Record<string, unknown>>,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      updateJson: cliScalarFlagParams.requiredString('Update as JSON: {"singleton": {"prop": value}}'),
    },
  },
  docs: { brief: "x:SieveSystemInterpreter/set — update the SieveSystemInterpreter singleton" },
})

const sieveSystemScriptGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { ids?: string[]; properties?: string[] }) {
    await cliRunApi(this, flags, (config) =>
      sieveSystemScriptGet({ config, ids: flags.ids, properties: flags.properties }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      ids: cliScalarFlagParams.optionalStringList("Comma-separated ids to fetch (default: all)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:SieveSystemScript/get — fetch SieveSystemScript objects" },
})

const sieveSystemScriptQueryCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { filterJson?: string; sortJson?: string; limit?: number; position?: number },
  ) {
    const op = "sieveSystemScriptQuery"
    const filter = flagJson(op, "filterJson", flags.filterJson)
    const sort = flagJson(op, "sortJson", flags.sortJson)
    await cliRunApi(this, flags, (config) =>
      sieveSystemScriptQuery({
        config,
        filter: filter as Record<string, string | number | boolean | null> | undefined,
        sort: sort as { property: string; isAscending?: boolean }[] | undefined,
        limit: flags.limit,
        position: flags.position,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      filterJson: cliScalarFlagParams.optionalString("Filter as JSON (AND of property matches)"),
      sortJson: cliScalarFlagParams.optionalString('Sort as JSON array, e.g. [{"property":"name"}]'),
      limit: cliScalarFlagParams.optionalNumber("Max ids to return"),
      position: cliScalarFlagParams.optionalNumber("Zero-based start position"),
    },
  },
  docs: { brief: "x:SieveSystemScript/query — list SieveSystemScript ids" },
})

const sieveSystemScriptSetCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { createJson?: string; updateJson?: string; destroy?: string[] },
  ) {
    const op = "sieveSystemScriptSet"
    const create = flagJson(op, "createJson", flags.createJson)
    const update = flagJson(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      sieveSystemScriptSet({
        config,
        create: create as Record<string, Record<string, unknown>> | undefined,
        update: update as Record<string, Record<string, unknown>> | undefined,
        destroy: flags.destroy,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      createJson: cliScalarFlagParams.optionalString('Creations as JSON: {"<creationId>": {...object...}}'),
      updateJson: cliScalarFlagParams.optionalString('Updates as JSON: {"<id>": {...patch...}}'),
      destroy: cliScalarFlagParams.optionalStringList("Comma-separated ids to destroy"),
    },
  },
  docs: { brief: "x:SieveSystemScript/set — create, update and/or destroy SieveSystemScript objects" },
})

const sieveUserInterpreterGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { properties?: string[] }) {
    await cliRunApi(this, flags, (config) => sieveUserInterpreterGet({ config, properties: flags.properties }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:SieveUserInterpreter/get — fetch SieveUserInterpreter (singletons: the singleton)" },
})

const sieveUserInterpreterSetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { updateJson: string }) {
    const op = "sieveUserInterpreterSet"
    const update = flagJson(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      sieveUserInterpreterSet({
        config,
        update: update as Record<string, Record<string, unknown>>,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      updateJson: cliScalarFlagParams.requiredString('Update as JSON: {"singleton": {"prop": value}}'),
    },
  },
  docs: { brief: "x:SieveUserInterpreter/set — update the SieveUserInterpreter singleton" },
})

const sieveUserScriptGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { ids?: string[]; properties?: string[] }) {
    await cliRunApi(this, flags, (config) =>
      sieveUserScriptGet({ config, ids: flags.ids, properties: flags.properties }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      ids: cliScalarFlagParams.optionalStringList("Comma-separated ids to fetch (default: all)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:SieveUserScript/get — fetch SieveUserScript objects" },
})

const sieveUserScriptQueryCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { filterJson?: string; sortJson?: string; limit?: number; position?: number },
  ) {
    const op = "sieveUserScriptQuery"
    const filter = flagJson(op, "filterJson", flags.filterJson)
    const sort = flagJson(op, "sortJson", flags.sortJson)
    await cliRunApi(this, flags, (config) =>
      sieveUserScriptQuery({
        config,
        filter: filter as Record<string, string | number | boolean | null> | undefined,
        sort: sort as { property: string; isAscending?: boolean }[] | undefined,
        limit: flags.limit,
        position: flags.position,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      filterJson: cliScalarFlagParams.optionalString("Filter as JSON (AND of property matches)"),
      sortJson: cliScalarFlagParams.optionalString('Sort as JSON array, e.g. [{"property":"name"}]'),
      limit: cliScalarFlagParams.optionalNumber("Max ids to return"),
      position: cliScalarFlagParams.optionalNumber("Zero-based start position"),
    },
  },
  docs: { brief: "x:SieveUserScript/query — list SieveUserScript ids" },
})

const sieveUserScriptSetCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { createJson?: string; updateJson?: string; destroy?: string[] },
  ) {
    const op = "sieveUserScriptSet"
    const create = flagJson(op, "createJson", flags.createJson)
    const update = flagJson(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      sieveUserScriptSet({
        config,
        create: create as Record<string, Record<string, unknown>> | undefined,
        update: update as Record<string, Record<string, unknown>> | undefined,
        destroy: flags.destroy,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      createJson: cliScalarFlagParams.optionalString('Creations as JSON: {"<creationId>": {...object...}}'),
      updateJson: cliScalarFlagParams.optionalString('Updates as JSON: {"<id>": {...patch...}}'),
      destroy: cliScalarFlagParams.optionalStringList("Comma-separated ids to destroy"),
    },
  },
  docs: { brief: "x:SieveUserScript/set — create, update and/or destroy SieveUserScript objects" },
})

const sieveSystemScriptCreateCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { name: string; contents: string; isActive: boolean; description?: string },
  ) {
    await cliRunApi(this, flags, (config) =>
      sieveSystemScriptCreate({
        config,
        script: {
          name: flags.name,
          contents: flags.contents,
          isActive: flags.isActive,
          description: flags.description ?? null,
        },
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      name: cliScalarFlagParams.requiredString("Script name"),
      contents: cliScalarFlagParams.requiredString("Sieve script source"),
      isActive: {
        ...cliScalarFlagParams.requiredBoolean("Whether the script is active (--isActive or --no-isActive)"),
        withNegated: true,
      },
      description: cliScalarFlagParams.optionalString("Script description"),
    },
  },
  docs: { brief: "x:SieveSystemScript/set — create one system Sieve script (contents are compiled)" },
})

const sieveSystemInterpreterSubCommands = buildRouteMap({
  routes: { get: sieveSystemInterpreterGetCommand, set: sieveSystemInterpreterSetCommand },
  docs: { brief: "SieveSystemInterpreter objects" },
})

const sieveSystemScriptSubCommands = buildRouteMap({
  routes: {
    get: sieveSystemScriptGetCommand,
    query: sieveSystemScriptQueryCommand,
    set: sieveSystemScriptSetCommand,
    create: sieveSystemScriptCreateCommand,
  },
  docs: { brief: "SieveSystemScript objects" },
})

const sieveUserInterpreterSubCommands = buildRouteMap({
  routes: { get: sieveUserInterpreterGetCommand, set: sieveUserInterpreterSetCommand },
  docs: { brief: "SieveUserInterpreter objects" },
})

const sieveUserScriptSubCommands = buildRouteMap({
  routes: { get: sieveUserScriptGetCommand, query: sieveUserScriptQueryCommand, set: sieveUserScriptSetCommand },
  docs: { brief: "SieveUserScript objects" },
})

export const sieveCommands = buildRouteMap({
  routes: {
    "system-interpreter": sieveSystemInterpreterSubCommands,
    "system-script": sieveSystemScriptSubCommands,
    "user-interpreter": sieveUserInterpreterSubCommands,
    "user-script": sieveUserScriptSubCommands,
  },
  docs: { brief: "Sieve script management (system and user interpreters and scripts)" },
})
