import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import { threadChanges } from "../threadChanges.js"
import { threadGet } from "../threadGet.js"

type WithAccount = CliConfigFlags & { accountId?: string }

const getCommand = buildCommand({
  async func(this: CommandContext, flags: WithAccount & { ids?: string[] }) {
    await cliRunApi(this, flags, (config) => threadGet({ config, accountId: flags.accountId, ids: flags.ids }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: cliScalarFlagParams.optionalString("Account id (default: session primary account for mail)"),
      ids: cliScalarFlagParams.optionalStringList("Comma-separated thread ids (default: all)"),
    },
  },
  docs: { brief: "Thread/get — fetch threads by id" },
})

const changesCommand = buildCommand({
  async func(this: CommandContext, flags: WithAccount & { sinceState: string; maxChanges?: number }) {
    await cliRunApi(this, flags, (config) =>
      threadChanges({ config, accountId: flags.accountId, sinceState: flags.sinceState, maxChanges: flags.maxChanges }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: cliScalarFlagParams.optionalString("Account id (default: session primary account for mail)"),
      sinceState: cliScalarFlagParams.requiredString("State to compare against (from a previous get)"),
      maxChanges: cliScalarFlagParams.optionalNumber("Max changes to return"),
    },
  },
  docs: { brief: "Thread/changes — created/updated/destroyed ids since a state" },
})

export const threadCommands = buildRouteMap({
  routes: {
    get: getCommand,
    changes: changesCommand,
  },
  docs: { brief: "Standard Thread methods" },
})
