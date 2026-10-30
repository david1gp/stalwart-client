import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import { cliWriteJson } from "../../cli/cliWriteJson.js"
import { oauthAuthCodeLogin } from "../oauthAuthCodeLogin.js"
import { oauthClientRegister } from "../oauthClientRegister.js"
import { oauthDeviceApprove } from "../oauthDeviceApprove.js"
import { oauthDeviceAuthorize } from "../oauthDeviceAuthorize.js"
import { oauthDeviceLogin } from "../oauthDeviceLogin.js"
import { oauthIntrospect } from "../oauthIntrospect.js"
import { oauthJwks } from "../oauthJwks.js"
import { oauthLogout } from "../oauthLogout.js"
import { oauthMetadata } from "../oauthMetadata.js"
import { oauthRevoke } from "../oauthRevoke.js"
import { oauthPkcePairCreate } from "../oauthPkcePairCreate.js"
import { oauthProtectedResource } from "../oauthProtectedResource.js"
import { oauthToken } from "../oauthToken.js"
import { oidcMetadata } from "../oidcMetadata.js"
import { oidcUserinfo } from "../oidcUserinfo.js"

const metadataCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => oauthMetadata({ config }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "OAuth authorization server metadata (GET /.well-known/oauth-authorization-server)" },
})

const protectedResourceCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => oauthProtectedResource({ config }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "OAuth protected resource metadata (GET /.well-known/oauth-protected-resource)" },
})

const openidConfigurationCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => oidcMetadata({ config }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "OpenID Connect discovery document (GET /.well-known/openid-configuration)" },
})

const deviceAuthorizeCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { clientId: string; scope?: string; nonce?: string }) {
    await cliRunApi(this, flags, (config) =>
      oauthDeviceAuthorize({ config, clientId: flags.clientId, scope: flags.scope, nonce: flags.nonce }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      clientId: cliScalarFlagParams.requiredString("OAuth client identifier"),
      scope: cliScalarFlagParams.optionalString("Space-separated scope list"),
      nonce: cliScalarFlagParams.optionalString("OIDC nonce"),
    },
  },
  docs: { brief: "Start the device flow (POST /auth/device)" },
})

const deviceApproveCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { accountName: string; accountSecret: string; code: string; mfaToken?: string },
  ) {
    await cliRunApi(this, flags, (config) =>
      oauthDeviceApprove({
        config,
        accountName: flags.accountName,
        accountSecret: flags.accountSecret,
        code: flags.code,
        mfaToken: flags.mfaToken,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountName: cliScalarFlagParams.requiredString("Account name (email) approving the device code"),
      accountSecret: cliScalarFlagParams.requiredString("Account password"),
      code: cliScalarFlagParams.requiredString("User-facing user_code from device-authorize"),
      mfaToken: cliScalarFlagParams.optionalString("MFA token from a previous mfaRequired response"),
    },
  },
  docs: { brief: "Approve a device code (POST /api/auth type authDevice)" },
})

const tokenCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & {
      grantType: string
      code?: string
      deviceCode?: string
      refreshToken?: string
      clientId?: string
      clientSecret?: string
      redirectUri?: string
      codeVerifier?: string
      clientAuth?: string
    },
  ) {
    await cliRunApi(this, flags, (config) =>
      oauthToken({
        config,
        grantType: flags.grantType as
          | "authorization_code"
          | "urn:ietf:params:oauth:grant-type:device_code"
          | "refresh_token",
        code: flags.code,
        deviceCode: flags.deviceCode,
        refreshToken: flags.refreshToken,
        clientId: flags.clientId,
        clientSecret: flags.clientSecret,
        redirectUri: flags.redirectUri,
        codeVerifier: flags.codeVerifier,
        clientAuth: flags.clientAuth as "none" | "client_secret_post" | "client_secret_basic" | undefined,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      grantType: cliScalarFlagParams.requiredString(
        "Grant type: authorization_code | urn:ietf:params:oauth:grant-type:device_code | refresh_token",
      ),
      code: cliScalarFlagParams.optionalString("Authorization code (authorization_code grant)"),
      deviceCode: cliScalarFlagParams.optionalString("Device code (device_code grant)"),
      refreshToken: cliScalarFlagParams.optionalString("Refresh token (refresh_token grant)"),
      clientId: cliScalarFlagParams.optionalString("OAuth client identifier"),
      clientSecret: cliScalarFlagParams.optionalString("OAuth client secret (confidential clients)"),
      redirectUri: cliScalarFlagParams.optionalString("Redirect URI (must match the authorization request)"),
      codeVerifier: cliScalarFlagParams.optionalString("PKCE code verifier (S256)"),
      clientAuth: cliScalarFlagParams.optionalString("Client auth: none | client_secret_post | client_secret_basic"),
    },
  },
  docs: { brief: "Exchange a grant for tokens (POST /auth/token)" },
})

const introspectCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { token: string }) {
    await cliRunApi(this, flags, (config) => oauthIntrospect({ config, token: flags.token }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      token: cliScalarFlagParams.requiredString("Access token to introspect"),
    },
  },
  docs: { brief: "Introspect an access token (POST /auth/introspect)" },
})

const revokeCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { token: string; clientId?: string; clientSecret?: string; clientAuth?: string },
  ) {
    await cliRunApi(this, flags, (config) =>
      oauthRevoke({
        config,
        token: flags.token,
        clientId: flags.clientId,
        clientSecret: flags.clientSecret,
        clientAuth: flags.clientAuth as "none" | "client_secret_post" | "client_secret_basic" | undefined,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      token: cliScalarFlagParams.requiredString("Access or refresh token to revoke"),
      clientId: cliScalarFlagParams.optionalString("OAuth client identifier"),
      clientSecret: cliScalarFlagParams.optionalString("OAuth client secret (confidential clients)"),
      clientAuth: cliScalarFlagParams.optionalString("Client auth: none | client_secret_post | client_secret_basic"),
    },
  },
  docs: { brief: "Revoke a token, signing the application out (POST /auth/revoke)" },
})

const logoutCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & {
      clientId?: string
      postLogoutRedirectUri?: string
      state?: string
      idTokenHint?: string
    },
  ) {
    await cliRunApi(this, flags, (config) =>
      oauthLogout({
        config,
        clientId: flags.clientId,
        postLogoutRedirectUri: flags.postLogoutRedirectUri,
        state: flags.state,
        idTokenHint: flags.idTokenHint,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      clientId: cliScalarFlagParams.optionalString("OAuth client identifier"),
      postLogoutRedirectUri: cliScalarFlagParams.optionalString("Registered post-logout URI to observe"),
      state: cliScalarFlagParams.optionalString("State echoed back at the post-logout URI"),
      idTokenHint: cliScalarFlagParams.optionalString("ID token hint for the session"),
    },
  },
  docs: { brief: "End the SSO session, observing the redirect (GET /auth/logout)" },
})

const userinfoCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => oidcUserinfo({ config }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "OIDC userinfo claims for the configured token (GET /auth/userinfo)" },
})

const registerCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { redirectUris: string; clientName?: string; scope?: string; anonymous?: boolean },
  ) {
    const op = "oauthClientRegister"
    const redirectUris = flags.redirectUris
      .split(",")
      .map((uri) => uri.trim())
      .filter((uri) => uri !== "")
    if (redirectUris.length === 0) cliFail({ op, errorMessage: "--redirectUris must list at least one URI" })
    await cliRunApi(this, flags, (config) =>
      oauthClientRegister({
        config,
        redirectUris,
        clientName: flags.clientName,
        scope: flags.scope,
        anonymous: flags.anonymous,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      redirectUris: cliScalarFlagParams.requiredString("Comma-separated redirect URIs"),
      clientName: cliScalarFlagParams.optionalString("Human-readable client name"),
      scope: cliScalarFlagParams.optionalString("Space-separated scope list"),
      anonymous: cliScalarFlagParams.optionalBoolean("Register without credentials (server must allow it)"),
    },
  },
  docs: { brief: "Register an OAuth client dynamically (POST /auth/register)" },
})

const jwksCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => oauthJwks({ config }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "OIDC JSON Web Key Set (GET /auth/jwks.json)" },
})

const pkceCommand = buildCommand({
  async func(this: CommandContext, flags: { length?: number }) {
    const result = await oauthPkcePairCreate(flags.length === undefined ? undefined : { length: flags.length })
    if (!result.success) cliFail(result)
    cliWriteJson(this, result.data)
  },
  parameters: {
    flags: {
      length: cliScalarFlagParams.optionalNumber("Verifier length, 43-128 (default 64)"),
    },
  },
  docs: { brief: "Generate a PKCE verifier/challenge pair (offline)" },
})

const authcodeLoginCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & {
      accountName: string
      accountSecret: string
      clientId: string
      redirectUri: string
      scope?: string
      nonce?: string
      consent?: boolean
    },
  ) {
    await cliRunApi(this, flags, (config) =>
      oauthAuthCodeLogin({
        config,
        accountName: flags.accountName,
        accountSecret: flags.accountSecret,
        clientId: flags.clientId,
        redirectUri: flags.redirectUri,
        scope: flags.scope,
        nonce: flags.nonce,
        consent: flags.consent,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountName: cliScalarFlagParams.requiredString("Account name (email)"),
      accountSecret: cliScalarFlagParams.requiredString("Account password"),
      clientId: cliScalarFlagParams.requiredString("OAuth client identifier"),
      redirectUri: cliScalarFlagParams.requiredString("Redirect URI (https, matching the client registration)"),
      scope: cliScalarFlagParams.optionalString("Space-separated scope list"),
      nonce: cliScalarFlagParams.optionalString("OIDC nonce"),
      consent: cliScalarFlagParams.optionalBoolean("Pre-approve the scope consent screen"),
    },
  },
  docs: { brief: "Full authorization-code + PKCE login returning tokens" },
})

const deviceLoginCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & {
      clientId: string
      accountName: string
      accountSecret: string
      scope?: string
      consent?: boolean
      pollIntervalMs?: number
      maxAttempts?: number
    },
  ) {
    await cliRunApi(this, flags, (config) =>
      oauthDeviceLogin({
        config,
        clientId: flags.clientId,
        accountName: flags.accountName,
        accountSecret: flags.accountSecret,
        scope: flags.scope,
        consent: flags.consent,
        pollIntervalMs: flags.pollIntervalMs,
        maxAttempts: flags.maxAttempts,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      clientId: cliScalarFlagParams.requiredString("OAuth client identifier"),
      accountName: cliScalarFlagParams.requiredString("Account name (email) approving the device code"),
      accountSecret: cliScalarFlagParams.requiredString("Account password"),
      scope: cliScalarFlagParams.optionalString("Space-separated scope list"),
      consent: cliScalarFlagParams.optionalBoolean("Pre-approve the scope consent screen"),
      pollIntervalMs: cliScalarFlagParams.optionalNumber("Token poll interval in ms (default: server interval)"),
      maxAttempts: cliScalarFlagParams.optionalNumber("Max token polls (default 12)"),
    },
  },
  docs: { brief: "Full device flow (authorize, approve, poll) returning tokens" },
})

export const oauthCommands = buildRouteMap({
  routes: {
    metadata: metadataCommand,
    "protected-resource": protectedResourceCommand,
    "openid-configuration": openidConfigurationCommand,
    "device-authorize": deviceAuthorizeCommand,
    "device-approve": deviceApproveCommand,
    token: tokenCommand,
    introspect: introspectCommand,
    revoke: revokeCommand,
    logout: logoutCommand,
    userinfo: userinfoCommand,
    register: registerCommand,
    jwks: jwksCommand,
    pkce: pkceCommand,
    "authcode-login": authcodeLoginCommand,
    "device-login": deviceLoginCommand,
  },
  docs: { brief: "OAuth2 / OpenID Connect (discovery, flows, tokens, registration)" },
})
