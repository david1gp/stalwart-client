import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliJsonParse } from "../../cli/cliJsonParse.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import { mailboxByRole } from "../mailboxByRole.js"
import { mailboxChanges } from "../mailboxChanges.js"
import { mailboxGet } from "../mailboxGet.js"
import { mailboxQuery } from "../mailboxQuery.js"
import { mailboxQueryChanges } from "../mailboxQueryChanges.js"
import { mailboxSet } from "../mailboxSet.js"

type WithAccount = CliConfigFlags & { accountId?: string }

function jsonFlagRead(op: string, flag: string, value: string | undefined): Record<string, unknown> | undefined {
  if (value === undefined) return undefined
  const parsed = cliJsonParse(value, op, flag)
  if (!parsed.success) cliFail(parsed)
  return parsed.data as Record<string, unknown>
}

const getCommand = buildCommand({
  async func(this: CommandContext, flags: WithAccount & { ids?: string[]; properties?: string[] }) {
    await cliRunApi(this, flags, (config) =>
      mailboxGet({ config, accountId: flags.accountId, ids: flags.ids, properties: flags.properties }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: cliScalarFlagParams.optionalString("Account id (default: session primary account for mail)"),
      ids: cliScalarFlagParams.optionalStringList("Comma-separated mailbox ids (default: all)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "Mailbox/get — fetch mailboxes by id" },
})

type QueryFlags = WithAccount & {
  filterJson?: string
  sortJson?: string
  position?: number
  anchor?: string
  anchorOffset?: number
  limit?: number
  calculateTotal?: boolean
  sortAsTree?: boolean
  filterAsTree?: boolean
}

const queryCommand = buildCommand({
  async func(this: CommandContext, flags: QueryFlags) {
    const op = "mailboxQuery"
    await cliRunApi(this, flags, (config) =>
      mailboxQuery({
        config,
        accountId: flags.accountId,
        filter: jsonFlagRead(op, "filterJson", flags.filterJson),
        sort: jsonFlagRead(op, "sortJson", flags.sortJson) as { property: string; isAscending?: boolean }[] | undefined,
        position: flags.position,
        anchor: flags.anchor,
        anchorOffset: flags.anchorOffset,
        limit: flags.limit,
        calculateTotal: flags.calculateTotal,
        sortAsTree: flags.sortAsTree,
        filterAsTree: flags.filterAsTree,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: cliScalarFlagParams.optionalString("Account id (default: session primary account for mail)"),
      filterJson: cliScalarFlagParams.optionalString('Filter as JSON, e.g. {"name":"Inbox"}'),
      sortJson: cliScalarFlagParams.optionalString('Sort as JSON array, e.g. [{"property":"name"}]'),
      position: cliScalarFlagParams.optionalNumber("Zero-based start position"),
      anchor: cliScalarFlagParams.optionalString("Anchor id for pagination"),
      anchorOffset: cliScalarFlagParams.optionalNumber("Offset relative to the anchor"),
      limit: cliScalarFlagParams.optionalNumber("Max ids to return"),
      calculateTotal: cliScalarFlagParams.optionalBoolean("Include the total count"),
      sortAsTree: cliScalarFlagParams.optionalBoolean("Return ids in tree order"),
      filterAsTree: cliScalarFlagParams.optionalBoolean("Apply the filter as a tree"),
    },
  },
  docs: { brief: "Mailbox/query — list mailbox ids" },
})

const changesCommand = buildCommand({
  async func(this: CommandContext, flags: WithAccount & { sinceState: string; maxChanges?: number }) {
    await cliRunApi(this, flags, (config) =>
      mailboxChanges({
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
      accountId: cliScalarFlagParams.optionalString("Account id (default: session primary account for mail)"),
      sinceState: cliScalarFlagParams.requiredString("State to compare against (from a previous get/query)"),
      maxChanges: cliScalarFlagParams.optionalNumber("Max changes to return"),
    },
  },
  docs: { brief: "Mailbox/changes — created/updated/destroyed ids since a state" },
})

const queryChangesCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & {
      accountId?: string
      filterJson?: string
      sortJson?: string
      calculateTotal?: boolean
      sinceQueryState: string
      maxChanges?: number
      upToId?: string
    },
  ) {
    const op = "mailboxQueryChanges"
    await cliRunApi(this, flags, (config) =>
      mailboxQueryChanges({
        config,
        accountId: flags.accountId,
        filter: jsonFlagRead(op, "filterJson", flags.filterJson),
        sort: jsonFlagRead(op, "sortJson", flags.sortJson) as { property: string; isAscending?: boolean }[] | undefined,
        sinceQueryState: flags.sinceQueryState,
        maxChanges: flags.maxChanges,
        upToId: flags.upToId,
        calculateTotal: flags.calculateTotal,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: cliScalarFlagParams.optionalString("Account id (default: session primary account for mail)"),
      filterJson: cliScalarFlagParams.optionalString("Filter as JSON"),
      sortJson: cliScalarFlagParams.optionalString("Sort as JSON array"),
      sinceQueryState: cliScalarFlagParams.requiredString("Query state to compare against"),
      maxChanges: cliScalarFlagParams.optionalNumber("Max changes to return"),
      upToId: cliScalarFlagParams.optionalString("Stop before this id"),
      calculateTotal: cliScalarFlagParams.optionalBoolean("Include the total count"),
    },
  },
  docs: { brief: "Mailbox/queryChanges — added/removed ids since a query state" },
})

const setCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: WithAccount & {
      ifInState?: string
      createJson?: string
      updateJson?: string
      destroy?: string[]
      onDestroyRemoveEmails?: boolean
    },
  ) {
    const op = "mailboxSet"
    await cliRunApi(this, flags, (config) =>
      mailboxSet({
        config,
        accountId: flags.accountId,
        ifInState: flags.ifInState,
        create: jsonFlagRead(op, "createJson", flags.createJson) as Record<string, Record<string, unknown>> | undefined,
        update: jsonFlagRead(op, "updateJson", flags.updateJson) as Record<string, Record<string, unknown>> | undefined,
        destroy: flags.destroy,
        onDestroyRemoveEmails: flags.onDestroyRemoveEmails,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: cliScalarFlagParams.optionalString("Account id (default: session primary account for mail)"),
      ifInState: cliScalarFlagParams.optionalString("Only apply when the state matches"),
      createJson: cliScalarFlagParams.optionalString('Creations as JSON: {"<creationId>": {…mailbox…}}'),
      updateJson: cliScalarFlagParams.optionalString('Updates as JSON: {"<id>": {…patch…}}'),
      destroy: cliScalarFlagParams.optionalStringList("Comma-separated mailbox ids to destroy"),
      onDestroyRemoveEmails: cliScalarFlagParams.optionalBoolean("Remove emails instead of moving them on destroy"),
    },
  },
  docs: { brief: "Mailbox/set — create, update and/or destroy mailboxes" },
})

const byRoleCommand = buildCommand({
  async func(this: CommandContext, flags: WithAccount & { role: string }) {
    await cliRunApi(this, flags, (config) => mailboxByRole({ config, accountId: flags.accountId, role: flags.role }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: cliScalarFlagParams.optionalString("Account id (default: session primary account for mail)"),
      role: cliScalarFlagParams.requiredString("Special-use role, e.g. inbox, sent, drafts, trash, junk"),
    },
  },
  docs: { brief: "Find a mailbox id by special-use role" },
})

export const mailboxCommands = buildRouteMap({
  routes: {
    get: getCommand,
    query: queryCommand,
    changes: changesCommand,
    "query-changes": queryChangesCommand,
    set: setCommand,
    "by-role": byRoleCommand,
  },
  docs: { brief: "Standard Mailbox methods" },
})
