import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliJsonParse } from "../../cli/cliJsonParse.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import { webSocketConnect } from "../webSocketConnect.js"

const callCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { method: string; argsJson?: string; dataTypes?: string[] },
  ) {
    const op = "webSocketConnect"
    const parsed = cliJsonParse(flags.argsJson ?? "{}", op, "argsJson")
    if (!parsed.success) cliFail(parsed)
    const args = (parsed.data ?? {}) as Record<string, unknown>
    await cliRunApi(this, flags, async (config) => {
      const connected = await webSocketConnect({ config })
      if (!connected.success) return connected
      const client = connected.data
      try {
        if (flags.dataTypes !== undefined) {
          const enabled = client.pushEnable(flags.dataTypes)
          if (!enabled.success) return enabled
        }
        return await client.send({ methodName: flags.method, arguments: args })
      } finally {
        client.close()
      }
    })
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      method: cliScalarFlagParams.requiredString("JMAP method name, e.g. Core/echo"),
      argsJson: cliScalarFlagParams.optionalString("Method arguments as JSON (default {})"),
      dataTypes: cliScalarFlagParams.optionalStringList(
        'Enable pushes first, e.g. "Mailbox,Email" (empty enables all)',
      ),
    },
  },
  docs: { brief: "Send one JMAP request over WebSocket (GET /jmap/ws)" },
})

export const webSocketCommands = buildRouteMap({
  routes: {
    call: callCommand,
  },
  docs: { brief: "JMAP over WebSocket (RFC 8887)" },
})
