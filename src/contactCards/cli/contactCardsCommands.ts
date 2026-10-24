import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliJsonParse } from "../../cli/cliJsonParse.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import { contactCardChanges } from "../contactCardChanges.js"
import { contactCardCopy } from "../contactCardCopy.js"
import { contactCardGet } from "../contactCardGet.js"
import { contactCardParse } from "../contactCardParse.js"
import { contactCardQuery } from "../contactCardQuery.js"
import { contactCardQueryChanges } from "../contactCardQueryChanges.js"
import { contactCardSet } from "../contactCardSet.js"

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
      contactCardGet({ config, accountId: flags.accountId, ids: flags.ids, properties: flags.properties }),
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
  docs: { brief: "ContactCard/get — fetch contact cards" },
})

const setCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { accountId?: string; createJson?: string; updateJson?: string; destroy?: string[] },
  ) {
    const op = "contactCardSet"
    const create = jsonFlagRead(op, "createJson", flags.createJson)
    const update = jsonFlagRead(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      contactCardSet({
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
      createJson: cliScalarFlagParams.optionalString('Creations as JSON: {"<creationId>": {…JSContact…}}'),
      updateJson: cliScalarFlagParams.optionalString('Updates as JSON: {"<id>": {…patch…}}'),
      destroy: cliScalarFlagParams.optionalStringList("Comma-separated ids to destroy"),
    },
  },
  docs: { brief: "ContactCard/set — create, update or destroy contact cards" },
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
    const op = "contactCardQuery"
    const filter = jsonFlagRead(op, "filterJson", flags.filterJson)
    const sortRaw = jsonFlagRead(op, "sortJson", flags.sortJson)
    await cliRunApi(this, flags, (config) =>
      contactCardQuery({
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
      sortJson: cliScalarFlagParams.optionalString('Sort as JSON array, e.g. [{"property":"uid"}]'),
      limit: cliScalarFlagParams.optionalNumber("Max ids to return"),
      position: cliScalarFlagParams.optionalNumber("Zero-based start position"),
    },
  },
  docs: { brief: "ContactCard/query — list contact card ids" },
})

const changesCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { accountId?: string; sinceState: string; maxChanges?: number },
  ) {
    await cliRunApi(this, flags, (config) =>
      contactCardChanges({
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
  docs: { brief: "ContactCard/changes — poll contact card changes" },
})

const queryChangesCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { accountId?: string; sinceQueryState: string }) {
    await cliRunApi(this, flags, (config) =>
      contactCardQueryChanges({ config, accountId: flags.accountId, sinceQueryState: flags.sinceQueryState }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: accountIdFlag,
      sinceQueryState: cliScalarFlagParams.requiredString("Query state to compare against"),
    },
  },
  docs: { brief: "ContactCard/queryChanges — poll query-result changes" },
})

const copyCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { accountId?: string; fromAccountId?: string; createJson?: string },
  ) {
    const op = "contactCardCopy"
    const create = jsonFlagRead(op, "createJson", flags.createJson)
    await cliRunApi(this, flags, (config) =>
      contactCardCopy({
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
  docs: { brief: "ContactCard/copy — copy cards between accounts" },
})

const parseCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { accountId?: string; blobIds?: string[]; properties?: string[] },
  ) {
    const op = "contactCardParse"
    const blobIds = flags.blobIds
    if (blobIds === undefined || blobIds.length === 0) cliFail({ op, errorMessage: "Missing required --blobIds" })
    await cliRunApi(this, flags, (config) =>
      contactCardParse({ config, accountId: flags.accountId, blobIds, properties: flags.properties }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: accountIdFlag,
      blobIds: cliScalarFlagParams.optionalStringList("Comma-separated vCard blob ids (required)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated JSContact properties to return"),
    },
  },
  docs: { brief: "ContactCard/parse — parse vCard blobs into JSContact cards" },
})

export const contactCardsCommands = buildRouteMap({
  routes: {
    get: getCommand,
    set: setCommand,
    query: queryCommand,
    changes: changesCommand,
    "query-changes": queryChangesCommand,
    copy: copyCommand,
    parse: parseCommand,
  },
  docs: { brief: "Contact card methods (JSContact, RFC 9553)" },
})
