import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { cliConfigFlagParams } from "../../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../../cli/cliConfigFlags.js"
import { cliFail } from "../../../cli/cliFail.js"
import { cliJsonParse } from "../../../cli/cliJsonParse.js"
import { cliRunApi } from "../../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../../cli/cliScalarFlagParams.js"
import { asnGet } from "../asnGet.js"
import { asnSet } from "../asnSet.js"
import { memoryLookupKeyGet } from "../memoryLookupKeyGet.js"
import { memoryLookupKeySet } from "../memoryLookupKeySet.js"
import { memoryLookupKeyValueGet } from "../memoryLookupKeyValueGet.js"
import { memoryLookupKeyValueSet } from "../memoryLookupKeyValueSet.js"
import { storeLookupGet } from "../storeLookupGet.js"
import { storeLookupSet } from "../storeLookupSet.js"
import { httpLookupGet } from "../httpLookupGet.js"
import { httpLookupSet } from "../httpLookupSet.js"
import { memoryLookupKeyQuery } from "../memoryLookupKeyQuery.js"
import { memoryLookupKeyValueQuery } from "../memoryLookupKeyValueQuery.js"
import { storeLookupQuery } from "../storeLookupQuery.js"
import { httpLookupQuery } from "../httpLookupQuery.js"

function flagJson(op: string, flag: string, value: string | undefined): unknown {
  if (value === undefined) return undefined
  const parsed = cliJsonParse(value, op, flag)
  if (!parsed.success) cliFail(parsed)
  return parsed.data
}

const asnGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { properties?: string[] }) {
    await cliRunApi(this, flags, (config) => asnGet({ config, properties: flags.properties }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:Asn/get — fetch Asn (singletons: the singleton)" },
})

const asnSetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { updateJson: string }) {
    const op = "asnSet"
    const update = flagJson(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      asnSet({
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
  docs: { brief: "x:Asn/set — update the Asn singleton" },
})

const memoryLookupKeyGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { ids?: string[]; properties?: string[] }) {
    await cliRunApi(this, flags, (config) =>
      memoryLookupKeyGet({ config, ids: flags.ids, properties: flags.properties }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      ids: cliScalarFlagParams.optionalStringList("Comma-separated ids to fetch (default: all)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:MemoryLookupKey/get — fetch MemoryLookupKey objects" },
})

const memoryLookupKeyQueryCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { filterJson?: string; sortJson?: string; limit?: number; position?: number },
  ) {
    const op = "memoryLookupKeyQuery"
    const filter = flagJson(op, "filterJson", flags.filterJson)
    const sort = flagJson(op, "sortJson", flags.sortJson)
    await cliRunApi(this, flags, (config) =>
      memoryLookupKeyQuery({
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
  docs: { brief: "x:MemoryLookupKey/query — list MemoryLookupKey ids" },
})

const memoryLookupKeySetCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { createJson?: string; updateJson?: string; destroy?: string[] },
  ) {
    const op = "memoryLookupKeySet"
    const create = flagJson(op, "createJson", flags.createJson)
    const update = flagJson(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      memoryLookupKeySet({
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
  docs: { brief: "x:MemoryLookupKey/set — create, update and/or destroy MemoryLookupKey objects" },
})

const memoryLookupKeyValueGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { ids?: string[]; properties?: string[] }) {
    await cliRunApi(this, flags, (config) =>
      memoryLookupKeyValueGet({ config, ids: flags.ids, properties: flags.properties }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      ids: cliScalarFlagParams.optionalStringList("Comma-separated ids to fetch (default: all)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:MemoryLookupKeyValue/get — fetch MemoryLookupKeyValue objects" },
})

const memoryLookupKeyValueQueryCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { filterJson?: string; sortJson?: string; limit?: number; position?: number },
  ) {
    const op = "memoryLookupKeyValueQuery"
    const filter = flagJson(op, "filterJson", flags.filterJson)
    const sort = flagJson(op, "sortJson", flags.sortJson)
    await cliRunApi(this, flags, (config) =>
      memoryLookupKeyValueQuery({
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
  docs: { brief: "x:MemoryLookupKeyValue/query — list MemoryLookupKeyValue ids" },
})

const memoryLookupKeyValueSetCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { createJson?: string; updateJson?: string; destroy?: string[] },
  ) {
    const op = "memoryLookupKeyValueSet"
    const create = flagJson(op, "createJson", flags.createJson)
    const update = flagJson(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      memoryLookupKeyValueSet({
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
  docs: { brief: "x:MemoryLookupKeyValue/set — create, update and/or destroy MemoryLookupKeyValue objects" },
})

const storeLookupGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { ids?: string[]; properties?: string[] }) {
    await cliRunApi(this, flags, (config) => storeLookupGet({ config, ids: flags.ids, properties: flags.properties }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      ids: cliScalarFlagParams.optionalStringList("Comma-separated ids to fetch (default: all)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:StoreLookup/get — fetch StoreLookup objects" },
})

const storeLookupQueryCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { filterJson?: string; sortJson?: string; limit?: number; position?: number },
  ) {
    const op = "storeLookupQuery"
    const filter = flagJson(op, "filterJson", flags.filterJson)
    const sort = flagJson(op, "sortJson", flags.sortJson)
    await cliRunApi(this, flags, (config) =>
      storeLookupQuery({
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
  docs: { brief: "x:StoreLookup/query — list StoreLookup ids" },
})

const storeLookupSetCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { createJson?: string; updateJson?: string; destroy?: string[] },
  ) {
    const op = "storeLookupSet"
    const create = flagJson(op, "createJson", flags.createJson)
    const update = flagJson(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      storeLookupSet({
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
  docs: { brief: "x:StoreLookup/set — create, update and/or destroy StoreLookup objects" },
})

const httpLookupGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { ids?: string[]; properties?: string[] }) {
    await cliRunApi(this, flags, (config) => httpLookupGet({ config, ids: flags.ids, properties: flags.properties }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      ids: cliScalarFlagParams.optionalStringList("Comma-separated ids to fetch (default: all)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:HttpLookup/get — fetch HttpLookup objects" },
})

const httpLookupQueryCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { filterJson?: string; sortJson?: string; limit?: number; position?: number },
  ) {
    const op = "httpLookupQuery"
    const filter = flagJson(op, "filterJson", flags.filterJson)
    const sort = flagJson(op, "sortJson", flags.sortJson)
    await cliRunApi(this, flags, (config) =>
      httpLookupQuery({
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
  docs: { brief: "x:HttpLookup/query — list HttpLookup ids" },
})

const httpLookupSetCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { createJson?: string; updateJson?: string; destroy?: string[] },
  ) {
    const op = "httpLookupSet"
    const create = flagJson(op, "createJson", flags.createJson)
    const update = flagJson(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      httpLookupSet({
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
  docs: { brief: "x:HttpLookup/set — create, update and/or destroy HttpLookup objects" },
})

const asnSubCommands = buildRouteMap({
  routes: { get: asnGetCommand, set: asnSetCommand },
  docs: { brief: "Asn objects" },
})

const memoryLookupKeySubCommands = buildRouteMap({
  routes: { get: memoryLookupKeyGetCommand, query: memoryLookupKeyQueryCommand, set: memoryLookupKeySetCommand },
  docs: { brief: "MemoryLookupKey objects" },
})

const memoryLookupKeyValueSubCommands = buildRouteMap({
  routes: {
    get: memoryLookupKeyValueGetCommand,
    query: memoryLookupKeyValueQueryCommand,
    set: memoryLookupKeyValueSetCommand,
  },
  docs: { brief: "MemoryLookupKeyValue objects" },
})

const storeLookupSubCommands = buildRouteMap({
  routes: { get: storeLookupGetCommand, query: storeLookupQueryCommand, set: storeLookupSetCommand },
  docs: { brief: "StoreLookup objects" },
})

const httpLookupSubCommands = buildRouteMap({
  routes: { get: httpLookupGetCommand, query: httpLookupQueryCommand, set: httpLookupSetCommand },
  docs: { brief: "HttpLookup objects" },
})

export const lookupCommands = buildRouteMap({
  routes: {
    asn: asnSubCommands,
    "memory-key": memoryLookupKeySubCommands,
    "memory-key-value": memoryLookupKeyValueSubCommands,
    "store-lookup": storeLookupSubCommands,
    "http-lookup": httpLookupSubCommands,
  },
  docs: { brief: "Lookup management (ASN, memory keys, store and HTTP lookups)" },
})
