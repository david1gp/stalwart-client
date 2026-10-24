import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliJsonParse } from "../../cli/cliJsonParse.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import { fileNodeChanges } from "../fileNodeChanges.js"
import { fileNodeCopy } from "../fileNodeCopy.js"
import { fileNodeGet } from "../fileNodeGet.js"
import { fileNodeQuery } from "../fileNodeQuery.js"
import { fileNodeQueryChanges } from "../fileNodeQueryChanges.js"
import { fileNodeSet } from "../fileNodeSet.js"

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
      fileNodeGet({ config, accountId: flags.accountId, ids: flags.ids, properties: flags.properties }),
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
  docs: { brief: "FileNode/get — fetch file nodes" },
})

const setCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { accountId?: string; createJson?: string; updateJson?: string; destroy?: string[] },
  ) {
    const op = "fileNodeSet"
    const create = jsonFlagRead(op, "createJson", flags.createJson)
    const update = jsonFlagRead(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      fileNodeSet({
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
      createJson: cliScalarFlagParams.optionalString('Creations as JSON: {"<creationId>": {name, blobId, …}}'),
      updateJson: cliScalarFlagParams.optionalString('Updates as JSON: {"<id>": {…patch…}}'),
      destroy: cliScalarFlagParams.optionalStringList("Comma-separated ids to destroy"),
    },
  },
  docs: { brief: "FileNode/set — create, update or destroy file nodes" },
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
    const op = "fileNodeQuery"
    const filter = jsonFlagRead(op, "filterJson", flags.filterJson)
    const sortRaw = jsonFlagRead(op, "sortJson", flags.sortJson)
    await cliRunApi(this, flags, (config) =>
      fileNodeQuery({
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
  docs: { brief: "FileNode/query — list file node ids" },
})

const changesCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { accountId?: string; sinceState: string; maxChanges?: number },
  ) {
    await cliRunApi(this, flags, (config) =>
      fileNodeChanges({
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
  docs: { brief: "FileNode/changes — poll file node changes" },
})

const queryChangesCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { accountId?: string; sinceQueryState: string }) {
    await cliRunApi(this, flags, (config) =>
      fileNodeQueryChanges({ config, accountId: flags.accountId, sinceQueryState: flags.sinceQueryState }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: accountIdFlag,
      sinceQueryState: cliScalarFlagParams.requiredString("Query state to compare against"),
    },
  },
  docs: { brief: "FileNode/queryChanges — poll query-result changes" },
})

const copyCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { accountId?: string; fromAccountId?: string; createJson?: string },
  ) {
    const op = "fileNodeCopy"
    const create = jsonFlagRead(op, "createJson", flags.createJson)
    await cliRunApi(this, flags, (config) =>
      fileNodeCopy({
        config,
        accountId: flags.accountId,
        fromAccountId: flags.fromAccountId,
        create: create as Record<string, Record<string, unknown>> | undefined,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: accountIdFlag,
      fromAccountId: cliScalarFlagParams.optionalString("Source account (default: target account)"),
      createJson: cliScalarFlagParams.optionalString('Copies as JSON: {"<newId>": {"id": "<sourceId>"}}'),
    },
  },
  docs: { brief: "FileNode/copy — copy file nodes between accounts" },
})

export const fileNodesCommands = buildRouteMap({
  routes: {
    get: getCommand,
    set: setCommand,
    query: queryCommand,
    changes: changesCommand,
    "query-changes": queryChangesCommand,
    copy: copyCommand,
  },
  docs: { brief: "File node methods" },
})
