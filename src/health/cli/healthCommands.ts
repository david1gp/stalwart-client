import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { healthLive } from "../healthLive.js"
import { healthReady } from "../healthReady.js"

const liveCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => healthLive({ config }))
  },
  parameters: {
    flags: { ...cliConfigFlagParams },
  },
  docs: { brief: "Liveness probe (GET /healthz/live, anonymous)" },
})

const readyCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => healthReady({ config }))
  },
  parameters: {
    flags: { ...cliConfigFlagParams },
  },
  docs: { brief: "Readiness probe (GET /healthz/ready, anonymous)" },
})

export const healthCommands = buildRouteMap({
  routes: {
    live: liveCommand,
    ready: readyCommand,
  },
  docs: { brief: "Server liveness and readiness probes" },
})
