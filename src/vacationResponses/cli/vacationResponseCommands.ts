import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliJsonParse } from "../../cli/cliJsonParse.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import { vacationResponseGet } from "../vacationResponseGet.js"
import { vacationResponseSet } from "../vacationResponseSet.js"

type WithAccount = CliConfigFlags & { accountId?: string }

const getCommand = buildCommand({
  async func(this: CommandContext, flags: WithAccount & { ids?: string[]; properties?: string[] }) {
    await cliRunApi(this, flags, (config) =>
      vacationResponseGet({ config, accountId: flags.accountId, ids: flags.ids, properties: flags.properties }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: cliScalarFlagParams.optionalString("Account id (default: session primary account)"),
      ids: cliScalarFlagParams.optionalStringList("Comma-separated ids (default: the singleton)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "VacationResponse/get — fetch the vacation response" },
})

const setCommand = buildCommand({
  async func(this: CommandContext, flags: WithAccount & { updateJson: string; ifInState?: string }) {
    const op = "vacationResponseSet"
    const parsed = cliJsonParse(flags.updateJson, op, "updateJson")
    if (!parsed.success) cliFail(parsed)
    await cliRunApi(this, flags, (config) =>
      vacationResponseSet({
        config,
        accountId: flags.accountId,
        ifInState: flags.ifInState,
        update: parsed.data as Record<string, Record<string, unknown>>,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: cliScalarFlagParams.optionalString("Account id (default: session primary account)"),
      updateJson: cliScalarFlagParams.requiredString('Update as JSON: {"<singletonId>": {…patch…}}'),
      ifInState: cliScalarFlagParams.optionalString("Only apply when the state matches"),
    },
  },
  docs: { brief: "VacationResponse/set — update the vacation response (update-only)" },
})

export const vacationResponseCommands = buildRouteMap({
  routes: {
    get: getCommand,
    set: setCommand,
  },
  docs: { brief: "Standard VacationResponse methods" },
})
