import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { cliConfigFlagParams } from "../../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../../cli/cliConfigFlags.js"
import { cliFail } from "../../../cli/cliFail.js"
import { cliJsonParse } from "../../../cli/cliJsonParse.js"
import { cliRunApi } from "../../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../../cli/cliScalarFlagParams.js"
import { archivedItemGet } from "../archivedItemGet.js"
import { archivedItemQuery } from "../archivedItemQuery.js"
import { archivedItemSet } from "../archivedItemSet.js"
import { blobStoreGet } from "../blobStoreGet.js"
import { blobStoreSet } from "../blobStoreSet.js"
import { cacheGet } from "../cacheGet.js"
import { cacheSet } from "../cacheSet.js"
import { dataRetentionGet } from "../dataRetentionGet.js"
import { dataRetentionSet } from "../dataRetentionSet.js"
import { dataStoreGet } from "../dataStoreGet.js"
import { dataStoreSet } from "../dataStoreSet.js"
import { fileStorageGet } from "../fileStorageGet.js"
import { fileStorageSet } from "../fileStorageSet.js"
import { inMemoryStoreGet } from "../inMemoryStoreGet.js"
import { inMemoryStoreSet } from "../inMemoryStoreSet.js"
import type { RegistryFilter } from "../../registryFilterSchema.js"
import { searchGet } from "../searchGet.js"
import { searchSet } from "../searchSet.js"
import { searchStoreGet } from "../searchStoreGet.js"
import { searchStoreSet } from "../searchStoreSet.js"

// biome-ignore lint/suspicious/noExplicitAny: route builders share one shape across 9 storage families.
type AnyOp = (options: any) => Promise<any>

type GetFlags = CliConfigFlags & { ids?: string[]; properties?: string[] }

type SingletonGetFlags = CliConfigFlags & { properties?: string[] }

type QueryFlags = CliConfigFlags & {
  filterJson?: string
  sortJson?: string
  limit?: number
  position?: number
}

type SetFlags = CliConfigFlags & {
  createJson?: string
  updateJson?: string
  destroy?: string[]
}

type SingletonSetFlags = CliConfigFlags & { updateJson: string }

function getFlags() {
  return {
    ...cliConfigFlagParams,
    ids: cliScalarFlagParams.optionalStringList("Comma-separated ids to fetch (default: all)"),
    properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
  }
}

function queryFlags() {
  return {
    ...cliConfigFlagParams,
    filterJson: cliScalarFlagParams.optionalString('Filter as JSON, e.g. {"accountId":"b"}'),
    sortJson: cliScalarFlagParams.optionalString('Sort as JSON array, e.g. [{"property":"id"}]'),
    limit: cliScalarFlagParams.optionalNumber("Max ids to return"),
    position: cliScalarFlagParams.optionalNumber("Zero-based start position"),
  }
}

function setFlags() {
  return {
    ...cliConfigFlagParams,
    createJson: cliScalarFlagParams.optionalString('Creations as JSON: {"<creationId>": {…object…}}'),
    updateJson: cliScalarFlagParams.optionalString('Updates as JSON: {"<id>": {…patch…}}'),
    destroy: cliScalarFlagParams.optionalStringList("Comma-separated ids to destroy"),
  }
}

function queryArgs(op: string, flags: QueryFlags) {
  const filter =
    flags.filterJson === undefined
      ? undefined
      : (() => {
          const parsed = cliJsonParse(flags.filterJson, op, "filterJson")
          if (!parsed.success) cliFail(parsed)
          return parsed.data as RegistryFilter
        })()
  const sort =
    flags.sortJson === undefined
      ? undefined
      : (() => {
          const parsed = cliJsonParse(flags.sortJson, op, "sortJson")
          if (!parsed.success) cliFail(parsed)
          return parsed.data as { property: string; isAscending?: boolean }[]
        })()
  return { filter, sort, limit: flags.limit, position: flags.position }
}

function setArgs(op: string, flags: SetFlags) {
  const create =
    flags.createJson === undefined
      ? undefined
      : (() => {
          const parsed = cliJsonParse(flags.createJson, op, "createJson")
          if (!parsed.success) cliFail(parsed)
          return parsed.data as Record<string, Record<string, unknown>>
        })()
  const update =
    flags.updateJson === undefined
      ? undefined
      : (() => {
          const parsed = cliJsonParse(flags.updateJson, op, "updateJson")
          if (!parsed.success) cliFail(parsed)
          return parsed.data as Record<string, Record<string, unknown>>
        })()
  return { create, update, destroy: flags.destroy }
}

function getRoute(brief: string, run: AnyOp) {
  return buildCommand({
    async func(this: CommandContext, flags: GetFlags) {
      await cliRunApi(this, flags, (config) => run({ config, ids: flags.ids, properties: flags.properties }))
    },
    parameters: { flags: getFlags() },
    docs: { brief },
  })
}

function singletonGetRoute(brief: string, run: AnyOp) {
  return buildCommand({
    async func(this: CommandContext, flags: SingletonGetFlags) {
      await cliRunApi(this, flags, (config) => run({ config, properties: flags.properties }))
    },
    parameters: {
      flags: {
        ...cliConfigFlagParams,
        properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
      },
    },
    docs: { brief },
  })
}

function queryRoute(brief: string, run: AnyOp) {
  return buildCommand({
    async func(this: CommandContext, flags: QueryFlags) {
      const args = queryArgs("storageQuery", flags)
      await cliRunApi(this, flags, (config) => run({ config, ...args }))
    },
    parameters: { flags: queryFlags() },
    docs: { brief },
  })
}

function setRoute(brief: string, run: AnyOp) {
  return buildCommand({
    async func(this: CommandContext, flags: SetFlags) {
      const args = setArgs("storageSet", flags)
      await cliRunApi(this, flags, (config) => run({ config, ...args }))
    },
    parameters: { flags: setFlags() },
    docs: { brief },
  })
}

function singletonSetRoute(brief: string, run: AnyOp) {
  return buildCommand({
    async func(this: CommandContext, flags: SingletonSetFlags) {
      const op = "storageSet"
      const parsed = cliJsonParse(flags.updateJson, op, "updateJson")
      if (!parsed.success) cliFail(parsed)
      await cliRunApi(this, flags, (config) =>
        run({ config, update: parsed.data as Record<string, Record<string, unknown>> }),
      )
    },
    parameters: {
      flags: {
        ...cliConfigFlagParams,
        updateJson: cliScalarFlagParams.requiredString('Updates as JSON: {"singleton": {…patch…}}'),
      },
    },
    docs: { brief },
  })
}

export const storageCommands = buildRouteMap({
  routes: {
    "archived-item": buildRouteMap({
      routes: {
        get: getRoute("x:ArchivedItem/get — fetch archived items (enterprise-only)", archivedItemGet),
        query: queryRoute("x:ArchivedItem/query — list archived item ids (enterprise-only)", archivedItemQuery),
        set: setRoute("x:ArchivedItem/set — update or destroy archived items (enterprise-only)", archivedItemSet),
      },
      docs: { brief: "Archived items (enterprise-only)" },
    }),
    "blob-store": buildRouteMap({
      routes: {
        get: singletonGetRoute("x:BlobStore/get — fetch the blob store singleton", blobStoreGet),
        set: singletonSetRoute("x:BlobStore/set — update the blob store singleton (dangerous)", blobStoreSet),
      },
      docs: { brief: "Blob storage backend (singleton)" },
    }),
    "data-store": buildRouteMap({
      routes: {
        get: singletonGetRoute("x:DataStore/get — fetch the data store singleton", dataStoreGet),
        set: singletonSetRoute("x:DataStore/set — update the data store singleton (dangerous)", dataStoreSet),
      },
      docs: { brief: "Primary data store backend (singleton)" },
    }),
    cache: buildRouteMap({
      routes: {
        get: singletonGetRoute("x:Cache/get — fetch the cache size singleton", cacheGet),
        set: singletonSetRoute("x:Cache/set — update the cache size singleton", cacheSet),
      },
      docs: { brief: "In-memory cache sizes (singleton)" },
    }),
    search: buildRouteMap({
      routes: {
        get: singletonGetRoute("x:Search/get — fetch the search indexing singleton", searchGet),
        set: singletonSetRoute("x:Search/set — update the search indexing singleton", searchSet),
      },
      docs: { brief: "Full-text search indexing config (singleton)" },
    }),
    "search-store": buildRouteMap({
      routes: {
        get: singletonGetRoute("x:SearchStore/get — fetch the search store singleton", searchStoreGet),
        set: singletonSetRoute("x:SearchStore/set — update the search store singleton (dangerous)", searchStoreSet),
      },
      docs: { brief: "Full-text search backend (singleton)" },
    }),
    "in-memory-store": buildRouteMap({
      routes: {
        get: singletonGetRoute("x:InMemoryStore/get — fetch the in-memory store singleton", inMemoryStoreGet),
        set: singletonSetRoute(
          "x:InMemoryStore/set — update the in-memory store singleton (dangerous)",
          inMemoryStoreSet,
        ),
      },
      docs: { brief: "In-memory cache/lookup store (singleton)" },
    }),
    "file-storage": buildRouteMap({
      routes: {
        get: singletonGetRoute("x:FileStorage/get — fetch the file storage limits singleton", fileStorageGet),
        set: singletonSetRoute("x:FileStorage/set — update the file storage limits singleton", fileStorageSet),
      },
      docs: { brief: "File storage limits (singleton)" },
    }),
    "data-retention": buildRouteMap({
      routes: {
        get: singletonGetRoute("x:DataRetention/get — fetch the data retention singleton", dataRetentionGet),
        set: singletonSetRoute("x:DataRetention/set — update the data retention singleton", dataRetentionSet),
      },
      docs: { brief: "Data retention policies (singleton)" },
    }),
  },
  docs: { brief: "Storage: archived items and store/index/retention singletons" },
})
