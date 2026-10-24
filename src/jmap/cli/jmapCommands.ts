import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { coreEcho } from "../../jmap/coreEcho.js"
import { jmapMethodCall } from "../../jmap/jmapMethodCall.js"
import { jmapRequest } from "../../jmap/jmapRequest.js"
import { jmapSessionGet } from "../../jmap/jmapSessionGet.js"
import { stalwartCapabilityResolver } from "../../client/stalwartCapabilityResolver.js"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliJsonFlagParam } from "../../cli/cliJsonFlagParam.js"
import { cliJsonParse } from "../../cli/cliJsonParse.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"

function jmapOptionalJsonFlag(brief: string) {
  return cliJsonFlagParam(brief) as { kind: "parsed"; parse: typeof String; optional: true; brief: string }
}

function jmapRequiredJsonFlag(brief: string) {
  return cliJsonFlagParam(brief, false) as { kind: "parsed"; parse: typeof String; brief: string }
}

const sessionGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => jmapSessionGet({ config }))
  },
  parameters: {
    flags: { ...cliConfigFlagParams },
  },
  docs: { brief: "Fetch the JMAP session (GET /jmap/session)" },
})

const jmapCallCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { method: string; argsJson?: string }) {
    const op = "jmapCall"
    const parsed = cliJsonParse(flags.argsJson ?? "{}", op, "argsJson")
    if (!parsed.success) cliFail(parsed)
    const args = (parsed.data ?? {}) as Record<string, unknown>
    await cliRunApi(this, flags, (config) =>
      jmapMethodCall({
        config,
        methodName: flags.method,
        arguments: args,
        capabilityResolvers: [stalwartCapabilityResolver],
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      method: cliScalarFlagParams.requiredString("JMAP method name, e.g. Core/echo or x:Domain/query"),
      argsJson: jmapOptionalJsonFlag("Method arguments as JSON (default {})"),
    },
  },
  docs: { brief: "Call a single JMAP method (raw escape hatch; using is derived automatically)" },
})

const jmapRequestCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { requestJson: string }) {
    const op = "jmapRequest"
    const parsed = cliJsonParse(flags.requestJson, op, "requestJson")
    if (!parsed.success) cliFail(parsed)
    const body = parsed.data as { methodCalls?: unknown; using?: unknown; createdIds?: unknown }
    const methodCalls = Array.isArray(body.methodCalls) ? body.methodCalls : []
    const calls = methodCalls.map((call, index) => {
      const triple = call as unknown[]
      return {
        methodName: String(triple[0]),
        arguments: (triple[1] ?? {}) as Record<string, unknown>,
        callId: typeof triple[2] === "string" ? triple[2] : `c${index + 1}`,
      }
    })
    await cliRunApi(this, flags, (config) =>
      jmapRequest({
        config,
        calls,
        capabilityResolvers: [stalwartCapabilityResolver],
        ...(Array.isArray(body.using) ? { using: body.using as string[] } : {}),
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      requestJson: jmapRequiredJsonFlag("Full JMAP request body as JSON ({methodCalls, using?, createdIds?})"),
    },
  },
  docs: { brief: "Send a raw batched JMAP request (POST /jmap/)" },
})

const coreEchoCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { argsJson?: string }) {
    const op = "coreEcho"
    const parsed = cliJsonParse(flags.argsJson ?? "{}", op, "argsJson")
    if (!parsed.success) cliFail(parsed)
    const args = (parsed.data ?? {}) as Record<string, unknown>
    await cliRunApi(this, flags, (config) => coreEcho({ config, args }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      argsJson: jmapOptionalJsonFlag("Echo arguments as JSON (returned verbatim; default {})"),
    },
  },
  docs: { brief: "Core/echo ping (connectivity + auth smoke test)" },
})

export const sessionCommands = buildRouteMap({
  routes: {
    get: sessionGetCommand,
  },
  docs: { brief: "Inspect the JMAP session" },
})

export const jmapCommands = buildRouteMap({
  routes: {
    call: jmapCallCommand,
    request: jmapRequestCommand,
  },
  docs: { brief: "Raw JMAP access (escape hatches)" },
})

export const coreCommands = buildRouteMap({
  routes: {
    echo: coreEchoCommand,
  },
  docs: { brief: "Standard Core methods" },
})
