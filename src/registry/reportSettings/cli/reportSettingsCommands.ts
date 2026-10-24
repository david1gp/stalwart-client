import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { cliConfigFlagParams } from "../../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../../cli/cliConfigFlags.js"
import { cliFail } from "../../../cli/cliFail.js"
import { cliJsonParse } from "../../../cli/cliJsonParse.js"
import { cliRunApi } from "../../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../../cli/cliScalarFlagParams.js"
import { senderAuthGet } from "../senderAuthGet.js"
import { senderAuthSet } from "../senderAuthSet.js"
import { reportSettingsGet } from "../reportSettingsGet.js"
import { reportSettingsSet } from "../reportSettingsSet.js"
import { dkimReportSettingsGet } from "../dkimReportSettingsGet.js"
import { dkimReportSettingsSet } from "../dkimReportSettingsSet.js"
import { dmarcReportSettingsGet } from "../dmarcReportSettingsGet.js"
import { dmarcReportSettingsSet } from "../dmarcReportSettingsSet.js"
import { dsnReportSettingsGet } from "../dsnReportSettingsGet.js"
import { dsnReportSettingsSet } from "../dsnReportSettingsSet.js"
import { spfReportSettingsGet } from "../spfReportSettingsGet.js"
import { spfReportSettingsSet } from "../spfReportSettingsSet.js"
import { tlsReportSettingsGet } from "../tlsReportSettingsGet.js"
import { tlsReportSettingsSet } from "../tlsReportSettingsSet.js"

function flagJson(op: string, flag: string, value: string | undefined): unknown {
  if (value === undefined) return undefined
  const parsed = cliJsonParse(value, op, flag)
  if (!parsed.success) cliFail(parsed)
  return parsed.data
}

const senderAuthGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { properties?: string[] }) {
    await cliRunApi(this, flags, (config) => senderAuthGet({ config, properties: flags.properties }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:SenderAuth/get — fetch SenderAuth (singletons: the singleton)" },
})

const senderAuthSetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { updateJson: string }) {
    const op = "senderAuthSet"
    const update = flagJson(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      senderAuthSet({
        config,
        update: update as Record<string, Record<string, unknown>>,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      updateJson: cliScalarFlagParams.requiredString('Update as JSON: {"singleton": {"prop": value}}'),
    },
  },
  docs: { brief: "x:SenderAuth/set — update the SenderAuth singleton" },
})

const reportSettingsGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { properties?: string[] }) {
    await cliRunApi(this, flags, (config) => reportSettingsGet({ config, properties: flags.properties }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:ReportSettings/get — fetch ReportSettings (singletons: the singleton)" },
})

const reportSettingsSetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { updateJson: string }) {
    const op = "reportSettingsSet"
    const update = flagJson(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      reportSettingsSet({
        config,
        update: update as Record<string, Record<string, unknown>>,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      updateJson: cliScalarFlagParams.requiredString('Update as JSON: {"singleton": {"prop": value}}'),
    },
  },
  docs: { brief: "x:ReportSettings/set — update the ReportSettings singleton" },
})

const dkimReportSettingsGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { properties?: string[] }) {
    await cliRunApi(this, flags, (config) => dkimReportSettingsGet({ config, properties: flags.properties }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:DkimReportSettings/get — fetch DkimReportSettings (singletons: the singleton)" },
})

const dkimReportSettingsSetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { updateJson: string }) {
    const op = "dkimReportSettingsSet"
    const update = flagJson(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      dkimReportSettingsSet({
        config,
        update: update as Record<string, Record<string, unknown>>,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      updateJson: cliScalarFlagParams.requiredString('Update as JSON: {"singleton": {"prop": value}}'),
    },
  },
  docs: { brief: "x:DkimReportSettings/set — update the DkimReportSettings singleton" },
})

const dmarcReportSettingsGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { properties?: string[] }) {
    await cliRunApi(this, flags, (config) => dmarcReportSettingsGet({ config, properties: flags.properties }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:DmarcReportSettings/get — fetch DmarcReportSettings (singletons: the singleton)" },
})

const dmarcReportSettingsSetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { updateJson: string }) {
    const op = "dmarcReportSettingsSet"
    const update = flagJson(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      dmarcReportSettingsSet({
        config,
        update: update as Record<string, Record<string, unknown>>,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      updateJson: cliScalarFlagParams.requiredString('Update as JSON: {"singleton": {"prop": value}}'),
    },
  },
  docs: { brief: "x:DmarcReportSettings/set — update the DmarcReportSettings singleton" },
})

const dsnReportSettingsGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { properties?: string[] }) {
    await cliRunApi(this, flags, (config) => dsnReportSettingsGet({ config, properties: flags.properties }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:DsnReportSettings/get — fetch DsnReportSettings (singletons: the singleton)" },
})

const dsnReportSettingsSetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { updateJson: string }) {
    const op = "dsnReportSettingsSet"
    const update = flagJson(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      dsnReportSettingsSet({
        config,
        update: update as Record<string, Record<string, unknown>>,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      updateJson: cliScalarFlagParams.requiredString('Update as JSON: {"singleton": {"prop": value}}'),
    },
  },
  docs: { brief: "x:DsnReportSettings/set — update the DsnReportSettings singleton" },
})

const spfReportSettingsGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { properties?: string[] }) {
    await cliRunApi(this, flags, (config) => spfReportSettingsGet({ config, properties: flags.properties }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:SpfReportSettings/get — fetch SpfReportSettings (singletons: the singleton)" },
})

const spfReportSettingsSetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { updateJson: string }) {
    const op = "spfReportSettingsSet"
    const update = flagJson(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      spfReportSettingsSet({
        config,
        update: update as Record<string, Record<string, unknown>>,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      updateJson: cliScalarFlagParams.requiredString('Update as JSON: {"singleton": {"prop": value}}'),
    },
  },
  docs: { brief: "x:SpfReportSettings/set — update the SpfReportSettings singleton" },
})

const tlsReportSettingsGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { properties?: string[] }) {
    await cliRunApi(this, flags, (config) => tlsReportSettingsGet({ config, properties: flags.properties }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:TlsReportSettings/get — fetch TlsReportSettings (singletons: the singleton)" },
})

const tlsReportSettingsSetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { updateJson: string }) {
    const op = "tlsReportSettingsSet"
    const update = flagJson(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      tlsReportSettingsSet({
        config,
        update: update as Record<string, Record<string, unknown>>,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      updateJson: cliScalarFlagParams.requiredString('Update as JSON: {"singleton": {"prop": value}}'),
    },
  },
  docs: { brief: "x:TlsReportSettings/set — update the TlsReportSettings singleton" },
})

const senderAuthSubCommands = buildRouteMap({
  routes: { get: senderAuthGetCommand, set: senderAuthSetCommand },
  docs: { brief: "SenderAuth objects" },
})

const reportSettingsSubCommands = buildRouteMap({
  routes: { get: reportSettingsGetCommand, set: reportSettingsSetCommand },
  docs: { brief: "ReportSettings objects" },
})

const dkimReportSettingsSubCommands = buildRouteMap({
  routes: { get: dkimReportSettingsGetCommand, set: dkimReportSettingsSetCommand },
  docs: { brief: "DkimReportSettings objects" },
})

const dmarcReportSettingsSubCommands = buildRouteMap({
  routes: { get: dmarcReportSettingsGetCommand, set: dmarcReportSettingsSetCommand },
  docs: { brief: "DmarcReportSettings objects" },
})

const dsnReportSettingsSubCommands = buildRouteMap({
  routes: { get: dsnReportSettingsGetCommand, set: dsnReportSettingsSetCommand },
  docs: { brief: "DsnReportSettings objects" },
})

const spfReportSettingsSubCommands = buildRouteMap({
  routes: { get: spfReportSettingsGetCommand, set: spfReportSettingsSetCommand },
  docs: { brief: "SpfReportSettings objects" },
})

const tlsReportSettingsSubCommands = buildRouteMap({
  routes: { get: tlsReportSettingsGetCommand, set: tlsReportSettingsSetCommand },
  docs: { brief: "TlsReportSettings objects" },
})

export const reportSettingsCommands = buildRouteMap({
  routes: {
    "sender-auth": senderAuthSubCommands,
    settings: reportSettingsSubCommands,
    dkim: dkimReportSettingsSubCommands,
    dmarc: dmarcReportSettingsSubCommands,
    dsn: dsnReportSettingsSubCommands,
    spf: spfReportSettingsSubCommands,
    tls: tlsReportSettingsSubCommands,
  },
  docs: { brief: "Sender authentication and report settings management" },
})
