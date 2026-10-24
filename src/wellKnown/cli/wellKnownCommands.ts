import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import { autoconfigMailConfig } from "../../wellKnown/autoconfigMailConfig.js"
import { autoconfigMailV1 } from "../../wellKnown/autoconfigMailV1.js"
import { autoconfigThunderbird } from "../../wellKnown/autoconfigThunderbird.js"
import { robotsTxt } from "../../wellKnown/robotsTxt.js"
import { wellKnownAcmeChallenge } from "../../wellKnown/wellKnownAcmeChallenge.js"
import { wellKnownCaldav } from "../../wellKnown/wellKnownCaldav.js"
import { wellKnownCarddav } from "../../wellKnown/wellKnownCarddav.js"
import { wellKnownJmap } from "../../wellKnown/wellKnownJmap.js"
import { wellKnownMtaSts } from "../../wellKnown/wellKnownMtaSts.js"
import { wellKnownUserAgentConfig } from "../../wellKnown/wellKnownUserAgentConfig.js"

const jmapCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => wellKnownJmap({ config }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "GET /.well-known/jmap — JMAP discovery redirect (not followed)" },
})

const caldavCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => wellKnownCaldav({ config }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "GET /.well-known/caldav — CalDAV discovery redirect (not followed)" },
})

const carddavCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => wellKnownCarddav({ config }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "GET /.well-known/carddav — CardDAV discovery redirect (not followed)" },
})

const acmeChallengeCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { token: string }) {
    await cliRunApi(this, flags, (config) => wellKnownAcmeChallenge({ config, token: flags.token }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      token: cliScalarFlagParams.requiredString("ACME HTTP-01 challenge token"),
    },
  },
  docs: { brief: "GET /.well-known/acme-challenge/{token} — ACME challenge proof" },
})

const mtaStsCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => wellKnownMtaSts({ config }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "GET /.well-known/mta-sts.txt — MTA-STS policy (parsed key/value + raw)" },
})

const userAgentConfigCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => wellKnownUserAgentConfig({ config }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "GET /.well-known/user-agent-configuration.json — PACC document" },
})

const mailV1Command = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { email: string }) {
    await cliRunApi(this, flags, (config) => autoconfigMailV1({ config, email: flags.email }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      email: cliScalarFlagParams.requiredString("Email address for the autoconfig lookup"),
    },
  },
  docs: { brief: "GET /.well-known/mail-v1.xml — Thunderbird autoconfig" },
})

const thunderbirdCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { email: string }) {
    await cliRunApi(this, flags, (config) => autoconfigThunderbird({ config, email: flags.email }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      email: cliScalarFlagParams.requiredString("Email address for the autoconfig lookup"),
    },
  },
  docs: { brief: "GET /.well-known/autoconfig/mail/config-v1.1.xml — Thunderbird autoconfig" },
})

const mailConfigCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { email: string }) {
    await cliRunApi(this, flags, (config) => autoconfigMailConfig({ config, email: flags.email }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      email: cliScalarFlagParams.requiredString("Email address for the autoconfig lookup"),
    },
  },
  docs: { brief: "GET /mail/config-v1.1.xml — Thunderbird autoconfig" },
})

const robotsCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => robotsTxt({ config }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "GET /robots.txt — static crawler policy" },
})

export const wellKnownCommands = buildRouteMap({
  routes: {
    jmap: jmapCommand,
    caldav: caldavCommand,
    carddav: carddavCommand,
    "acme-challenge": acmeChallengeCommand,
    "mta-sts": mtaStsCommand,
    "user-agent-config": userAgentConfigCommand,
    "mail-v1": mailV1Command,
    thunderbird: thunderbirdCommand,
    "mail-config": mailConfigCommand,
    robots: robotsCommand,
  },
  docs: { brief: "Well-known discovery, autoconfig and crawler endpoints" },
})
