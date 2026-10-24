import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import { autodiscoverJson } from "../../autodiscover/autodiscoverJson.js"
import { autodiscoverXml } from "../../autodiscover/autodiscoverXml.js"

const xmlCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { requestXml: string }) {
    await cliRunApi(this, flags, (config) => autodiscoverXml({ config, requestXml: flags.requestXml }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      requestXml: cliScalarFlagParams.requiredString("Outlook autodiscover request XML document"),
    },
  },
  docs: { brief: "POST /autodiscover/autodiscover.xml — Outlook autodiscover" },
})

const jsonCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { email: string; protocol?: string }) {
    await cliRunApi(this, flags, (config) => autodiscoverJson({ config, email: flags.email, protocol: flags.protocol }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      email: cliScalarFlagParams.requiredString("Email address to look up"),
      protocol: cliScalarFlagParams.optionalString("Protocol (AutodiscoverV1; default unset)"),
    },
  },
  docs: { brief: "GET /autodiscover/autodiscover.json — Autodiscover V2" },
})

export const autodiscoverCommands = buildRouteMap({
  routes: {
    xml: xmlCommand,
    json: jsonCommand,
  },
  docs: { brief: "Outlook autodiscover (XML) and Autodiscover V2 (JSON)" },
})
