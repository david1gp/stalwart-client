import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import { liveDelivery } from "../liveDelivery.js"
import { liveDeliveryToken } from "../liveDeliveryToken.js"
import { liveMetrics } from "../liveMetrics.js"
import { liveMetricsToken } from "../liveMetricsToken.js"
import { liveTracing } from "../liveTracing.js"
import { liveTracingToken } from "../liveTracingToken.js"

const deliveryTokenCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => liveDeliveryToken({ config }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "Short-lived token for live delivery diagnostics (GET /api/token/delivery)" },
})

const tracingTokenCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => liveTracingToken({ config }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "Short-lived token for live tracing (GET /api/token/tracing, enterprise)" },
})

const metricsTokenCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => liveMetricsToken({ config }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "Short-lived token for live metrics (GET /api/token/metrics, enterprise)" },
})

const deliveryCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { target: string; timeout?: number; token?: string; maxEvents?: number },
  ) {
    await cliRunApi(this, flags, (config) =>
      liveDelivery({
        config,
        target: flags.target,
        timeout: flags.timeout,
        token: flags.token,
        maxEvents: flags.maxEvents,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      target: cliScalarFlagParams.requiredString("Target domain or email address to diagnose"),
      timeout: cliScalarFlagParams.optionalNumber("Max stream lifetime in seconds (min 1, default 30)"),
      token: cliScalarFlagParams.optionalString("Delivery token from delivery-token (instead of the header)"),
      maxEvents: cliScalarFlagParams.optionalNumber("Max stages to collect (default 500)"),
    },
  },
  docs: { brief: "Stream delivery diagnostics stages (GET /api/live/delivery/{target})" },
})

const tracingCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { token?: string; maxEvents?: number }) {
    await cliRunApi(this, flags, (config) => liveTracing({ config, token: flags.token, maxEvents: flags.maxEvents }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      token: cliScalarFlagParams.optionalString("Tracing token from tracing-token (instead of the header)"),
      maxEvents: cliScalarFlagParams.optionalNumber("Max events to collect (default 50)"),
    },
  },
  docs: { brief: "Read live tracing events (GET /api/live/tracing, enterprise)" },
})

const metricsCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { token?: string; maxEvents?: number }) {
    await cliRunApi(this, flags, (config) => liveMetrics({ config, token: flags.token, maxEvents: flags.maxEvents }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      token: cliScalarFlagParams.optionalString("Metrics token from metrics-token (instead of the header)"),
      maxEvents: cliScalarFlagParams.optionalNumber("Max events to collect (default 50)"),
    },
  },
  docs: { brief: "Read live metrics events (GET /api/live/metrics, enterprise)" },
})

export const liveCommands = buildRouteMap({
  routes: {
    "delivery-token": deliveryTokenCommand,
    "tracing-token": tracingTokenCommand,
    "metrics-token": metricsTokenCommand,
    delivery: deliveryCommand,
    tracing: tracingCommand,
    metrics: metricsCommand,
  },
  docs: { brief: "Live tokens and Server-Sent Events telemetry streams" },
})
