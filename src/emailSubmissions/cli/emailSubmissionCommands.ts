import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliJsonParse } from "../../cli/cliJsonParse.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import { emailSubmissionChanges } from "../emailSubmissionChanges.js"
import { emailSubmissionGet } from "../emailSubmissionGet.js"
import { emailSubmissionQuery } from "../emailSubmissionQuery.js"
import { emailSubmissionQueryChanges } from "../emailSubmissionQueryChanges.js"
import { emailSubmissionSet } from "../emailSubmissionSet.js"

type WithAccount = CliConfigFlags & { accountId?: string }

function jsonRecord(op: string, flag: string, value: string | undefined): Record<string, unknown> | undefined {
  if (value === undefined) return undefined
  const parsed = cliJsonParse(value, op, flag)
  if (!parsed.success) cliFail(parsed)
  return parsed.data as Record<string, unknown>
}

function jsonSort(op: string, value: string | undefined): { property: string; isAscending?: boolean }[] | undefined {
  return jsonRecord(op, "sortJson", value) as { property: string; isAscending?: boolean }[] | undefined
}

const getCommand = buildCommand({
  async func(this: CommandContext, flags: WithAccount & { ids?: string[]; properties?: string[] }) {
    await cliRunApi(this, flags, (config) =>
      emailSubmissionGet({ config, accountId: flags.accountId, ids: flags.ids, properties: flags.properties }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: cliScalarFlagParams.optionalString("Account id (default: session primary account for submission)"),
      ids: cliScalarFlagParams.optionalStringList("Comma-separated submission ids (default: all)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "EmailSubmission/get — fetch submissions by id" },
})

type QueryFlags = WithAccount & {
  filterJson?: string
  sortJson?: string
  position?: number
  anchor?: string
  anchorOffset?: number
  limit?: number
  calculateTotal?: boolean
}

const queryCommand = buildCommand({
  async func(this: CommandContext, flags: QueryFlags) {
    const op = "emailSubmissionQuery"
    await cliRunApi(this, flags, (config) =>
      emailSubmissionQuery({
        config,
        accountId: flags.accountId,
        filter: jsonRecord(op, "filterJson", flags.filterJson),
        sort: jsonSort(op, flags.sortJson),
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
      accountId: cliScalarFlagParams.optionalString("Account id (default: session primary account for submission)"),
      filterJson: cliScalarFlagParams.optionalString("Filter as JSON"),
      sortJson: cliScalarFlagParams.optionalString("Sort as JSON array"),
      position: cliScalarFlagParams.optionalNumber("Zero-based start position"),
      anchor: cliScalarFlagParams.optionalString("Anchor id for pagination"),
      anchorOffset: cliScalarFlagParams.optionalNumber("Offset relative to the anchor"),
      limit: cliScalarFlagParams.optionalNumber("Max ids to return"),
      calculateTotal: cliScalarFlagParams.optionalBoolean("Include the total count"),
    },
  },
  docs: { brief: "EmailSubmission/query — list submission ids" },
})

const changesCommand = buildCommand({
  async func(this: CommandContext, flags: WithAccount & { sinceState: string; maxChanges?: number }) {
    await cliRunApi(this, flags, (config) =>
      emailSubmissionChanges({
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
      accountId: cliScalarFlagParams.optionalString("Account id (default: session primary account for submission)"),
      sinceState: cliScalarFlagParams.requiredString("State to compare against (from a previous get/query)"),
      maxChanges: cliScalarFlagParams.optionalNumber("Max changes to return"),
    },
  },
  docs: { brief: "EmailSubmission/changes — created/updated/destroyed ids since a state" },
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
    const op = "emailSubmissionQueryChanges"
    await cliRunApi(this, flags, (config) =>
      emailSubmissionQueryChanges({
        config,
        accountId: flags.accountId,
        filter: jsonRecord(op, "filterJson", flags.filterJson),
        sort: jsonSort(op, flags.sortJson),
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
      accountId: cliScalarFlagParams.optionalString("Account id (default: session primary account for submission)"),
      filterJson: cliScalarFlagParams.optionalString("Filter as JSON"),
      sortJson: cliScalarFlagParams.optionalString("Sort as JSON array"),
      sinceQueryState: cliScalarFlagParams.requiredString("Query state to compare against"),
      maxChanges: cliScalarFlagParams.optionalNumber("Max changes to return"),
      upToId: cliScalarFlagParams.optionalString("Stop before this id"),
      calculateTotal: cliScalarFlagParams.optionalBoolean("Include the total count"),
    },
  },
  docs: { brief: "EmailSubmission/queryChanges — added/removed ids since a query state" },
})

const setCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: WithAccount & {
      ifInState?: string
      createJson?: string
      updateJson?: string
      destroy?: string[]
      onSuccessUpdateEmailJson?: string
      onSuccessDestroyEmail?: string[]
    },
  ) {
    const op = "emailSubmissionSet"
    await cliRunApi(this, flags, (config) =>
      emailSubmissionSet({
        config,
        accountId: flags.accountId,
        ifInState: flags.ifInState,
        create: jsonRecord(op, "createJson", flags.createJson) as Record<string, Record<string, unknown>> | undefined,
        update: jsonRecord(op, "updateJson", flags.updateJson) as Record<string, Record<string, unknown>> | undefined,
        destroy: flags.destroy,
        onSuccessUpdateEmail: jsonRecord(op, "onSuccessUpdateEmailJson", flags.onSuccessUpdateEmailJson) as
          | Record<string, Record<string, unknown>>
          | undefined,
        onSuccessDestroyEmail: flags.onSuccessDestroyEmail,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: cliScalarFlagParams.optionalString("Account id (default: session primary account for submission)"),
      ifInState: cliScalarFlagParams.optionalString("Only apply when the state matches"),
      createJson: cliScalarFlagParams.optionalString('Creations as JSON: {"<creationId>": {…submission…}}'),
      updateJson: cliScalarFlagParams.optionalString('Updates as JSON: {"<id>": {…patch…}}'),
      destroy: cliScalarFlagParams.optionalStringList("Comma-separated submission ids to destroy"),
      onSuccessUpdateEmailJson: cliScalarFlagParams.optionalString('Email patches as JSON: {"#e1": {…patch…}}'),
      onSuccessDestroyEmail: cliScalarFlagParams.optionalStringList("Comma-separated email creation ids to destroy"),
    },
  },
  docs: { brief: "EmailSubmission/set — submit emails for sending" },
})

export const emailSubmissionCommands = buildRouteMap({
  routes: {
    get: getCommand,
    query: queryCommand,
    changes: changesCommand,
    "query-changes": queryChangesCommand,
    set: setCommand,
  },
  docs: { brief: "Standard EmailSubmission methods" },
})
