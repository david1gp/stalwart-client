import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { createResultError } from "#result"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliConfigLoad } from "../../cli/cliConfigLoad.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import { cliWriteJson } from "../../cli/cliWriteJson.js"
import { eventSourceListen } from "../eventSourceListen.js"

const listenCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { types?: string; closeafter?: string; ping?: number }) {
    const op = "eventSourceListen"
    const configResult = cliConfigLoad(flags)
    if (!configResult.success) cliFail(configResult)
    if (flags.closeafter !== undefined && flags.closeafter !== "state" && flags.closeafter !== "no") {
      cliFail(createResultError(op, '--closeafter must be "state" or "no"'))
    }
    const closeafter = flags.closeafter as "state" | "no" | undefined
    const subscription = await eventSourceListen({
      config: configResult.data,
      ...(flags.types !== undefined ? { types: flags.types } : {}),
      ...(closeafter !== undefined ? { closeafter } : {}),
      ...(flags.ping !== undefined ? { ping: flags.ping } : {}),
    })
    if (!subscription.success) cliFail(subscription)
    try {
      for await (const change of subscription.data.stateChanges) cliWriteJson(this, change)
    } finally {
      subscription.data.close()
    }
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      types: cliScalarFlagParams.optionalString('Comma-separated DataTypes to subscribe to, or "*" (default "*")'),
      closeafter: cliScalarFlagParams.optionalString(
        'Server closes the stream after the first state push ("state") or never ("no", default)',
      ),
      ping: cliScalarFlagParams.optionalNumber("Heartbeat interval in seconds (0 disables)"),
    },
  },
  docs: { brief: "Subscribe to JMAP StateChange pushes (GET /jmap/eventsource)" },
})

export const eventSourceCommands = buildRouteMap({
  routes: {
    listen: listenCommand,
  },
  docs: { brief: "JMAP server-sent events (SSE)" },
})
