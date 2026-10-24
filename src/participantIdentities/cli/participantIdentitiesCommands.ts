import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { participantIdentityChanges } from "../participantIdentityChanges.js"
import { participantIdentityGet } from "../participantIdentityGet.js"
import { participantIdentitySet } from "../participantIdentitySet.js"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliJsonParse } from "../../cli/cliJsonParse.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"

function jsonFlagRead(
  op: string,
  flag: string,
  value: string | undefined,
): Record<string, Record<string, unknown>> | undefined {
  if (value === undefined) return undefined
  const parsed = cliJsonParse(value, op, flag)
  if (!parsed.success) cliFail(parsed)
  return parsed.data as Record<string, Record<string, unknown>>
}

const getCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { accountId?: string; ids?: string[]; properties?: string[] },
  ) {
    await cliRunApi(this, flags, (config) =>
      participantIdentityGet({ config, accountId: flags.accountId, ids: flags.ids, properties: flags.properties }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: cliScalarFlagParams.optionalString("Account id (default: session primary account)"),
      ids: cliScalarFlagParams.optionalStringList("Comma-separated identity ids"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "ParticipantIdentity/get — fetch scheduling identities by id" },
})

const setCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & {
      accountId?: string
      ifInState?: string
      createJson?: string
      updateJson?: string
      destroy?: string[]
      onSuccessSetIsDefault?: string
    },
  ) {
    const op = "participantIdentitySet"
    const create = jsonFlagRead(op, "createJson", flags.createJson)
    const update = jsonFlagRead(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      participantIdentitySet({
        config,
        accountId: flags.accountId,
        ifInState: flags.ifInState,
        create,
        update,
        destroy: flags.destroy,
        onSuccessSetIsDefault: flags.onSuccessSetIsDefault,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: cliScalarFlagParams.optionalString("Account id (default: session primary account)"),
      ifInState: cliScalarFlagParams.optionalString("Require this state before applying"),
      createJson: cliScalarFlagParams.optionalString('Creations as JSON: {"<creationId>": {…identity…}}'),
      updateJson: cliScalarFlagParams.optionalString('Updates as JSON: {"<id>": {…patch…}}'),
      destroy: cliScalarFlagParams.optionalStringList("Comma-separated ids to destroy"),
      onSuccessSetIsDefault: cliScalarFlagParams.optionalString(
        "Set this identity default on success (id or #creationId)",
      ),
    },
  },
  docs: { brief: "ParticipantIdentity/set — create, update and/or destroy scheduling identities" },
})

const changesCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { accountId?: string; sinceState: string; maxChanges?: number },
  ) {
    await cliRunApi(this, flags, (config) =>
      participantIdentityChanges({
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
      accountId: cliScalarFlagParams.optionalString("Account id (default: session primary account)"),
      sinceState: cliScalarFlagParams.requiredString("State to compare against"),
      maxChanges: cliScalarFlagParams.optionalNumber("Max changes to return"),
    },
  },
  docs: { brief: "ParticipantIdentity/changes — changed identity ids since a state" },
})

export const participantIdentitiesCommands = buildRouteMap({
  routes: {
    get: getCommand,
    set: setCommand,
    changes: changesCommand,
  },
  docs: { brief: "JMAP ParticipantIdentity methods" },
})
