import { readFile } from "node:fs/promises"
import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { createResultError } from "#result"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import { cliConfigLoad } from "../../cli/cliConfigLoad.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import { cliWriteJson } from "../../cli/cliWriteJson.js"
import { passkeyRegistrationOptions } from "../passkeyRegistrationOptions.js"

const registrationOptionsCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & {
      accountId?: string
      currentSecret?: string
      currentSecretFile?: string
      otpCode?: string
    },
  ) {
    const op = "passkeyRegistrationOptions"
    if (flags.currentSecret !== undefined && flags.currentSecretFile !== undefined) {
      cliFail(createResultError(op, "Pass --currentSecret or --currentSecretFile, not both"))
    }
    let currentSecret = flags.currentSecret
    if (flags.currentSecretFile !== undefined) {
      const loaded = await readFile(flags.currentSecretFile, "utf8").catch((error: unknown) => {
        cliFail({
          op,
          errorMessage: `Cannot read file ${flags.currentSecretFile}`,
          errorData: error instanceof Error ? error.message : String(error),
        })
      })
      currentSecret = loaded.replace(/\r?\n$/, "")
    }
    const configResult = cliConfigLoad(flags)
    if (!configResult.success) cliFail(configResult)
    const result = await passkeyRegistrationOptions({
      config: configResult.data,
      accountId: flags.accountId,
      currentSecret,
      otpCode: flags.otpCode,
    })
    if (!result.success) cliFail(result)
    cliWriteJson(this, result.data)
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: cliScalarFlagParams.optionalString("Account id (default: session primary account)"),
      currentSecret: cliScalarFlagParams.optionalString("Current password (prefer --currentSecretFile)"),
      currentSecretFile: cliScalarFlagParams.optionalString("File holding the current password (not echoed)"),
      otpCode: cliScalarFlagParams.optionalString("One-time code when the account has TOTP enabled"),
    },
  },
  docs: { brief: "Passkey/registrationOptions — WebAuthn creation options for a new passkey" },
})

export const passkeysCommands = buildRouteMap({
  routes: {
    "registration-options": registrationOptionsCommand,
  },
  docs: { brief: "Passkey registration helpers" },
})
