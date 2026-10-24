import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import type { PromiseResult } from "#result"
import type { StalwartClientConfig } from "../../../client/stalwartClientConfigSchema.js"
import { cliConfigFlagParams } from "../../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../../cli/cliConfigFlags.js"
import { cliFail } from "../../../cli/cliFail.js"
import { cliJsonParse } from "../../../cli/cliJsonParse.js"
import { cliRunApi } from "../../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../../cli/cliScalarFlagParams.js"
import { actionClassifySpam } from "../actionClassifySpam.js"
import type { ActionClassifySpamOptions } from "../actionClassifySpamOptionsSchema.js"
import { actionGet } from "../actionGet.js"
import { actionInvalidateCaches } from "../actionInvalidateCaches.js"
import { actionInvalidateNegativeCaches } from "../actionInvalidateNegativeCaches.js"
import { actionPauseMtaQueue } from "../actionPauseMtaQueue.js"
import { actionReloadBlockedIps } from "../actionReloadBlockedIps.js"
import { actionReloadLookupStores } from "../actionReloadLookupStores.js"
import { actionReloadSettings } from "../actionReloadSettings.js"
import { actionReloadTlsCertificates } from "../actionReloadTlsCertificates.js"
import { actionResumeMtaQueue } from "../actionResumeMtaQueue.js"
import { actionRun } from "../actionRun.js"
import { actionSet } from "../actionSet.js"
import { actionTroubleshootDmarc } from "../actionTroubleshootDmarc.js"
import { actionUpdateApps } from "../actionUpdateApps.js"

function noParamCommand(brief: string, run: (config: StalwartClientConfig) => PromiseResult<unknown>) {
  return buildCommand({
    async func(this: CommandContext, flags: CliConfigFlags) {
      await cliRunApi(this, flags, run)
    },
    parameters: { flags: { ...cliConfigFlagParams } },
    docs: { brief },
  })
}

function addressSetList(value: string): Record<string, true> {
  return Object.fromEntries(
    value
      .split(",")
      .map((address) => address.trim())
      .filter((address) => address.length > 0)
      .map((address) => [address, true]),
  )
}

const getCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { ids?: string[]; properties?: string[] }) {
    await cliRunApi(this, flags, (config) => actionGet({ config, ids: flags.ids, properties: flags.properties }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      ids: cliScalarFlagParams.optionalStringList("Comma-separated action ids (default: all)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "Fetch management action records by id" },
})

const setCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { createJson?: string; updateJson?: string; destroy?: string[] },
  ) {
    const create = cliJsonParse(flags.createJson, "action set", "createJson")
    if (!create.success) cliFail(create)
    const update = cliJsonParse(flags.updateJson, "action set", "updateJson")
    if (!update.success) cliFail(update)
    await cliRunApi(this, flags, (config) =>
      actionSet({
        config,
        ...(create.data !== undefined ? { create: create.data as Record<string, Record<string, unknown>> } : {}),
        ...(update.data !== undefined ? { update: update.data as Record<string, Record<string, unknown>> } : {}),
        ...(flags.destroy !== undefined ? { destroy: flags.destroy } : {}),
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      createJson: cliScalarFlagParams.optionalString("Creations as JSON (updates/destroys always fail server-side)"),
      updateJson: cliScalarFlagParams.optionalString("Updates as JSON (always rejected: actions cannot be updated)"),
      destroy: cliScalarFlagParams.optionalStringList("Ids to destroy (always rejected: actions cannot be destroyed)"),
    },
  },
  docs: { brief: "Raw x:Action/set (create-only server-side)" },
})

const runCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { actionJson: string }) {
    const parsed = cliJsonParse(flags.actionJson, "action run", "actionJson")
    if (!parsed.success) cliFail(parsed)
    await cliRunApi(this, flags, (config) =>
      actionRun({ config, action: parsed.data as Parameters<typeof actionRun>[0]["action"] }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      actionJson: cliScalarFlagParams.requiredString('Action as JSON, e.g. {"@type":"ReloadSettings"}'),
    },
  },
  docs: { brief: "Run a typed management action, print the created action id" },
})

const troubleshootDmarcCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & {
      ehloDomain: string
      mailFrom: string
      message?: string
      remoteIp: string
      spfEhloDomain: string
      spfMailFromDomain: string
      to: string
    },
  ) {
    await cliRunApi(this, flags, (config) =>
      actionTroubleshootDmarc({
        config,
        ehloDomain: flags.ehloDomain,
        mailFrom: flags.mailFrom,
        ...(flags.message !== undefined ? { message: flags.message } : {}),
        remoteIp: flags.remoteIp,
        spfEhloDomain: flags.spfEhloDomain,
        spfMailFromDomain: flags.spfMailFromDomain,
        to: addressSetList(flags.to),
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      ehloDomain: cliScalarFlagParams.requiredString("EHLO domain of the SMTP client"),
      mailFrom: cliScalarFlagParams.requiredString("MAIL FROM address"),
      message: cliScalarFlagParams.optionalString("Message body for DMARC troubleshooting"),
      remoteIp: cliScalarFlagParams.requiredString("Remote IP of the SMTP client"),
      spfEhloDomain: cliScalarFlagParams.requiredString("Domain for the EHLO SPF check"),
      spfMailFromDomain: cliScalarFlagParams.requiredString("Domain for the MAIL FROM SPF check"),
      to: cliScalarFlagParams.requiredString("Comma-separated RCPT TO addresses"),
    },
  },
  docs: { brief: "Run DMARC troubleshooting diagnostics (local domain only)" },
})

const classifySpamCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & {
      authenticatedAs?: string
      ehloDomain: string
      envFrom: string
      envFromParameters?: string
      envRcptTo: string
      isTls?: boolean
      message: string
      remoteIp: string
    },
  ) {
    await cliRunApi(this, flags, (config) =>
      actionClassifySpam({
        config,
        ...(flags.authenticatedAs !== undefined ? { authenticatedAs: flags.authenticatedAs } : {}),
        ehloDomain: flags.ehloDomain,
        envFrom: flags.envFrom,
        ...(flags.envFromParameters !== undefined
          ? {
              envFromParameters: flags.envFromParameters as NonNullable<ActionClassifySpamOptions["envFromParameters"]>,
            }
          : {}),
        envRcptTo: addressSetList(flags.envRcptTo),
        ...(flags.isTls !== undefined ? { isTls: flags.isTls } : {}),
        message: flags.message,
        remoteIp: flags.remoteIp,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      authenticatedAs: cliScalarFlagParams.optionalString("Authentication identity of the SMTP client"),
      ehloDomain: cliScalarFlagParams.requiredString("EHLO domain of the SMTP client"),
      envFrom: cliScalarFlagParams.requiredString("MAIL FROM address"),
      envFromParameters: cliScalarFlagParams.optionalString("Parameters related to the MAIL FROM address"),
      envRcptTo: cliScalarFlagParams.requiredString("Comma-separated RCPT TO addresses"),
      isTls: cliScalarFlagParams.optionalBoolean("Whether the SMTP connection uses TLS"),
      message: cliScalarFlagParams.requiredString("Raw email message to classify"),
      remoteIp: cliScalarFlagParams.requiredString("Remote IP of the SMTP client"),
    },
  },
  docs: { brief: "Classify a raw message with the spam filter" },
})

export const actionsCommands = buildRouteMap({
  routes: {
    get: getCommand,
    set: setCommand,
    run: runCommand,
    "reload-settings": noParamCommand("Reload server settings", (config) => actionReloadSettings({ config })),
    "reload-tls-certificates": noParamCommand("Reload TLS certificates (never in tests)", (config) =>
      actionReloadTlsCertificates({ config }),
    ),
    "reload-lookup-stores": noParamCommand("Reload lookup stores", (config) => actionReloadLookupStores({ config })),
    "reload-blocked-ips": noParamCommand("Reload blocked IPs", (config) => actionReloadBlockedIps({ config })),
    "update-apps": noParamCommand("Update applications (downloads from the internet; never in tests)", (config) =>
      actionUpdateApps({ config }),
    ),
    "invalidate-caches": noParamCommand("Invalidate all caches", (config) => actionInvalidateCaches({ config })),
    "invalidate-negative-caches": noParamCommand("Invalidate negative caches", (config) =>
      actionInvalidateNegativeCaches({ config }),
    ),
    "pause-mta-queue": noParamCommand("Pause MTA queue processing (never in tests)", (config) =>
      actionPauseMtaQueue({ config }),
    ),
    "resume-mta-queue": noParamCommand("Resume MTA queue processing (never in tests)", (config) =>
      actionResumeMtaQueue({ config }),
    ),
    "troubleshoot-dmarc": troubleshootDmarcCommand,
    "classify-spam": classifySpamCommand,
  },
  docs: { brief: "Server management actions (create-only: reloads, caches, diagnostics)" },
})
