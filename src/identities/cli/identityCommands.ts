import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliJsonParse } from "../../cli/cliJsonParse.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import { identityChanges } from "../identityChanges.js"
import { identityGet } from "../identityGet.js"
import { identitySet } from "../identitySet.js"

type WithAccount = CliConfigFlags & { accountId?: string }

function jsonRecord(op: string, flag: string, value: string | undefined): Record<string, unknown> | undefined {
  if (value === undefined) return undefined
  const parsed = cliJsonParse(value, op, flag)
  if (!parsed.success) cliFail(parsed)
  return parsed.data as Record<string, unknown>
}

const getCommand = buildCommand({
  async func(this: CommandContext, flags: WithAccount & { ids?: string[]; properties?: string[] }) {
    await cliRunApi(this, flags, (config) =>
      identityGet({ config, accountId: flags.accountId, ids: flags.ids, properties: flags.properties }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: cliScalarFlagParams.optionalString("Account id (default: session primary account for submission)"),
      ids: cliScalarFlagParams.optionalStringList("Comma-separated identity ids (default: all)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "Identity/get — fetch sending identities" },
})

const changesCommand = buildCommand({
  async func(this: CommandContext, flags: WithAccount & { sinceState: string; maxChanges?: number }) {
    await cliRunApi(this, flags, (config) =>
      identityChanges({
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
      sinceState: cliScalarFlagParams.requiredString("State to compare against (from a previous get)"),
      maxChanges: cliScalarFlagParams.optionalNumber("Max changes to return"),
    },
  },
  docs: { brief: "Identity/changes — created/updated/destroyed ids since a state" },
})

const setCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: WithAccount & { ifInState?: string; createJson?: string; updateJson?: string; destroy?: string[] },
  ) {
    const op = "identitySet"
    await cliRunApi(this, flags, (config) =>
      identitySet({
        config,
        accountId: flags.accountId,
        ifInState: flags.ifInState,
        create: jsonRecord(op, "createJson", flags.createJson) as Record<string, Record<string, unknown>> | undefined,
        update: jsonRecord(op, "updateJson", flags.updateJson) as Record<string, Record<string, unknown>> | undefined,
        destroy: flags.destroy,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: cliScalarFlagParams.optionalString("Account id (default: session primary account for submission)"),
      ifInState: cliScalarFlagParams.optionalString("Only apply when the state matches"),
      createJson: cliScalarFlagParams.optionalString('Creations as JSON: {"<creationId>": {…identity…}}'),
      updateJson: cliScalarFlagParams.optionalString('Updates as JSON: {"<id>": {…patch…}}'),
      destroy: cliScalarFlagParams.optionalStringList("Comma-separated identity ids to destroy"),
    },
  },
  docs: { brief: "Identity/set — create, update and/or destroy identities" },
})

export const identityCommands = buildRouteMap({
  routes: {
    get: getCommand,
    changes: changesCommand,
    set: setCommand,
  },
  docs: { brief: "Standard Identity methods" },
})
