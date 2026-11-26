import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { createResultError } from "#result"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliJsonParse } from "../../cli/cliJsonParse.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import type { Mdn } from "../Mdn.js"
import { mdnParse } from "../mdnParse.js"
import { mdnSend } from "../mdnSend.js"

type WithAccount = CliConfigFlags & { accountId?: string }

function jsonObjectMap(
  op: string,
  flag: string,
  value: string | undefined,
): Record<string, Record<string, unknown>> | undefined {
  if (value === undefined) return undefined
  const parsed = cliJsonParse(value, op, flag)
  if (!parsed.success) cliFail(parsed)
  const data = parsed.data
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    cliFail(createResultError(op, `--${flag} must be a JSON object of "<id>": {...}`))
  }
  for (const [key, entry] of Object.entries(data as Record<string, unknown>)) {
    if (typeof entry !== "object" || entry === null || Array.isArray(entry)) {
      cliFail(createResultError(op, `--${flag} entry ${JSON.stringify(key)} must be a JSON object`))
    }
  }
  return data as Record<string, Record<string, unknown>>
}

const sendCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: WithAccount & { identityId?: string; sendJson?: string; onSuccessUpdateEmailJson?: string },
  ) {
    const op = "mdnSend"
    const identityId = flags.identityId
    if (identityId === undefined) cliFail(createResultError(op, "Missing required --identityId"))
    const sendJson = flags.sendJson
    if (sendJson === undefined) cliFail(createResultError(op, "Missing required --sendJson"))
    await cliRunApi(this, flags, (config) =>
      mdnSend({
        config,
        accountId: flags.accountId,
        identityId,
        send: jsonObjectMap(op, "sendJson", sendJson) as unknown as Record<string, Mdn>,
        onSuccessUpdateEmail: jsonObjectMap(op, "onSuccessUpdateEmailJson", flags.onSuccessUpdateEmailJson),
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: cliScalarFlagParams.optionalString(
        "Account id (default: session primary account for mdn, fallback mail)",
      ),
      identityId: cliScalarFlagParams.optionalString("Identity id sending the MDN (required by the server)"),
      sendJson: cliScalarFlagParams.optionalString('MDNs as JSON: {"<creationId>": {forEmailId, disposition, …}}'),
      onSuccessUpdateEmailJson: cliScalarFlagParams.optionalString(
        'Email patches setting $mdnsent as JSON: {"#m1": {"keywords/$mdnsent": true}}',
      ),
    },
  },
  docs: { brief: "MDN/send — send disposition notifications" },
})

const parseCommand = buildCommand({
  async func(this: CommandContext, flags: WithAccount & { blobIds?: string[] }) {
    const op = "mdnParse"
    const blobIds = flags.blobIds
    if (blobIds === undefined) cliFail(createResultError(op, "Missing required --blobIds"))
    await cliRunApi(this, flags, (config) => mdnParse({ config, accountId: flags.accountId, blobIds }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: cliScalarFlagParams.optionalString(
        "Account id (default: session primary account for mdn, fallback mail)",
      ),
      blobIds: cliScalarFlagParams.optionalStringList("Comma-separated MDN blob ids to parse"),
    },
  },
  docs: { brief: "MDN/parse — parse uploaded MDN blobs" },
})

export const mdnCommands = buildRouteMap({
  routes: {
    send: sendCommand,
    parse: parseCommand,
  },
  docs: { brief: "Standard MDN methods" },
})
