import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { metricsPrometheus } from "../metricsPrometheus.js"

const prometheusCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => metricsPrometheus({ config }))
  },
  parameters: {
    flags: { ...cliConfigFlagParams },
  },
  docs: { brief: "Prometheus exposition feed (GET /metrics/prometheus)" },
})

export const metricsCommands = buildRouteMap({
  routes: {
    prometheus: prometheusCommand,
  },
  docs: { brief: "Server metrics feeds" },
})
