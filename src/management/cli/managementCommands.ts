import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliJsonFlagParam } from "../../cli/cliJsonFlagParam.js"
import { cliJsonParse } from "../../cli/cliJsonParse.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import { managementAccount } from "../managementAccount.js"
import { managementDiscover } from "../managementDiscover.js"
import { managementLogin } from "../managementLogin.js"
import { managementSchema } from "../managementSchema.js"
import { managementSchemaRedirect } from "../managementSchemaRedirect.js"
import type { ManagementLoginOptions } from "../managementLoginOptionsSchema.js"

function managementJsonFlag(brief: string) {
  return cliJsonFlagParam(brief) as { kind: "parsed"; parse: typeof String; optional: true; brief: string }
}

const loginCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { loginJson?: string }) {
    const op = "managementLogin"
    const parsed = cliJsonParse(flags.loginJson ?? "{}", op, "loginJson")
    if (!parsed.success) cliFail(parsed)
    // Validation stays in the library op; the flag only transports JSON.
    const login = (parsed.data ?? {}) as ManagementLoginOptions["login"]
    await cliRunApi(this, flags, (config) => managementLogin({ config, login }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      loginJson: managementJsonFlag('Login request as JSON, e.g. {"type":"authCode",…} (default {})'),
    },
  },
  docs: { brief: "Authenticate for the OAuth flows (POST /api/auth)" },
})

const discoverCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { email: string }) {
    await cliRunApi(this, flags, (config) => managementDiscover({ config, email: flags.email }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      email: cliScalarFlagParams.requiredString("Email address or account name to discover"),
    },
  },
  docs: { brief: "Discover the OIDC provider for an email (GET /api/discover/{email})" },
})

const accountCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => managementAccount({ config }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "Authenticated account permissions, edition and locale (GET /api/account)" },
})

const schemaRedirectCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => managementSchemaRedirect({ config }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "Current configuration schema hash (GET /api/schema, 302 Location)" },
})

const schemaCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { hash: string }) {
    await cliRunApi(this, flags, (config) => managementSchema({ config, hash: flags.hash }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      hash: cliScalarFlagParams.requiredString("Schema SHA-256 from schema-redirect"),
    },
  },
  docs: { brief: "Configuration schema document at a hash (GET /api/schema/{hash})" },
})

export const managementCommands = buildRouteMap({
  routes: {
    login: loginCommand,
    discover: discoverCommand,
    account: accountCommand,
    "schema-redirect": schemaRedirectCommand,
    schema: schemaCommand,
  },
  docs: { brief: "Management helpers (login, discovery, account, schema)" },
})
