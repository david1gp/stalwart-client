import { afterAll, beforeAll, describe, expect, test } from "bun:test"
import { stalwartClientConfig } from "../src/client/stalwartClientConfig.js"
import type { StalwartClientConfig } from "../src/client/stalwartClientConfigSchema.js"
import { liveDelivery } from "../src/live/liveDelivery.js"
import { liveDeliveryToken } from "../src/live/liveDeliveryToken.js"
import { liveMetrics } from "../src/live/liveMetrics.js"
import { liveMetricsToken } from "../src/live/liveMetricsToken.js"
import { liveTracing } from "../src/live/liveTracing.js"
import { liveTracingToken } from "../src/live/liveTracingToken.js"
import { managementAccount } from "../src/management/managementAccount.js"
import { managementDiscover } from "../src/management/managementDiscover.js"
import { managementSchema } from "../src/management/managementSchema.js"
import { managementSchemaRedirect } from "../src/management/managementSchemaRedirect.js"
import { oauthAuthCodeLogin } from "../src/oauth/oauthAuthCodeLogin.js"
import { oauthClientRegister } from "../src/oauth/oauthClientRegister.js"
import { oauthDeviceLogin } from "../src/oauth/oauthDeviceLogin.js"
import { oauthIntrospect } from "../src/oauth/oauthIntrospect.js"
import { oauthJwks } from "../src/oauth/oauthJwks.js"
import { oauthMetadata } from "../src/oauth/oauthMetadata.js"
import { oauthProtectedResource } from "../src/oauth/oauthProtectedResource.js"
import { oauthToken } from "../src/oauth/oauthToken.js"
import { oidcMetadata } from "../src/oauth/oidcMetadata.js"
import { oidcUserinfo } from "../src/oauth/oidcUserinfo.js"
import { registrySet } from "../src/registry/registrySet.js"
import { e2eRunId } from "./e2eRunId.js"
import { stalwartE2eSetup } from "./e2eSetup.js"

let adminConfig: StalwartClientConfig
let aliceConfig: StalwartClientConfig
let anonConfig: StalwartClientConfig
let aliceName = ""
let aliceSecret = ""
let bobName = ""

const runId = e2eRunId()
const clientId = `e2e-oauth-${runId}`
const redirectUri = `https://localhost/e2e-${runId}/callback`
const created: { oauthClientId?: string } = {}
let aliceAccessToken = ""
let aliceRefreshToken = ""

function requireConfig(result: ReturnType<typeof stalwartClientConfig>): StalwartClientConfig {
  if (!result.success) throw new Error(`e2e config invalid: ${result.errorMessage}`)
  return result.data
}

beforeAll(async () => {
  adminConfig = await stalwartE2eSetup()
  // Overlay parsing copied from e2eSetup.ts (that module only returns the admin config).
  const overlay: Record<string, string> = {}
  if ((process.env.STALWART_E2E_TARGET ?? "live") === "local") {
    const localFile = Bun.file(new URL("../ops/local-stalwart/.env.local", import.meta.url))
    for (const line of (await localFile.text()).split("\n")) {
      const trimmed = line.trim()
      if (trimmed === "" || trimmed.startsWith("#")) continue
      const eq = trimmed.indexOf("=")
      if (eq < 0) continue
      overlay[trimmed.slice(0, eq)] = trimmed.slice(eq + 1)
    }
  }
  aliceName = overlay.STALWART_USER_A ?? process.env.STALWART_USER_A ?? ""
  aliceSecret = overlay.STALWART_USER_A_PASSWORD ?? process.env.STALWART_USER_A_PASSWORD ?? ""
  bobName = overlay.STALWART_USER_B ?? process.env.STALWART_USER_B ?? ""
  if (!aliceName || !aliceSecret || !bobName) throw new Error("e2e user credentials missing from overlay/env")
  aliceConfig = requireConfig(
    stalwartClientConfig({ baseUrl: adminConfig.baseUrl, username: aliceName, password: aliceSecret }),
  )
  anonConfig = requireConfig(stalwartClientConfig({ baseUrl: adminConfig.baseUrl }))

  // Run-scoped OAuth client for the code + device flows (public: no secret).
  const createdClient = await registrySet({
    config: adminConfig,
    objectType: "OAuthClient",
    create: {
      [`c${runId}`]: {
        clientId,
        contacts: { [aliceName]: true },
        redirectUris: { [redirectUri]: true },
        grantTypes: { authorizationCode: true, refreshToken: true, deviceCode: true },
        scopes: { mail: true },
      },
    },
  })
  if (!createdClient.success) throw new Error(`OAuthClient create failed: ${createdClient.errorMessage}`)
  created.oauthClientId = createdClient.data.created?.[`c${runId}`]?.id
  expect(created.oauthClientId).toBeString()
})

afterAll(async () => {
  // Strict reverse-order, best-effort teardown of run-scoped objects only.
  if (created.oauthClientId === undefined) return
  const removed = await registrySet({
    config: adminConfig,
    objectType: "OAuthClient",
    destroy: [created.oauthClientId],
  })
  if (!removed.success) console.warn(`teardown: OAuthClient ${clientId} not removed: ${removed.errorMessage}`)
})

describe("e2e auth-oauth: discovery endpoints", () => {
  test(
    "oauthMetadata reports the supported grants and PKCE",
    async () => {
      const r = await oauthMetadata({ config: anonConfig })
      if (!r.success) throw new Error(r.errorMessage)
      expect(r.data.grant_types_supported).toContain("authorization_code")
      expect(r.data.grant_types_supported).toContain("urn:ietf:params:oauth:grant-type:device_code")
      expect(r.data.code_challenge_methods_supported).toContain("S256")
      expect(r.data.token_endpoint).toContain("/auth/token")
    },
    { timeout: 30_000 },
  )

  test(
    "oidcMetadata and oauthJwks are reachable; protected-resource pins 404 on untrusted hosts",
    async () => {
      // v1 only serves the protected-resource document to trusted hosts, so
      // the loopback base URL answers NotFound (`resource_origin` in
      // `crates/http/src/auth/oauth/authorize.rs`).
      const pr = await oauthProtectedResource({ config: anonConfig })
      expect(pr.success).toBe(false)
      if (!pr.success) expect(pr.errorData ?? pr.errorMessage).toContain("Not Found")
      const md = await oidcMetadata({ config: anonConfig })
      if (!md.success) throw new Error(md.errorMessage)
      expect(md.data.userinfo_endpoint).toContain("/auth/userinfo")
      const jwks = await oauthJwks({ config: anonConfig })
      if (!jwks.success) throw new Error(jwks.errorMessage)
      expect(jwks.data.keys.length).toBeGreaterThan(0)
    },
    { timeout: 30_000 },
  )

  test(
    "dynamic client registration (or pin it disabled)",
    async () => {
      const r = await oauthClientRegister({
        config: anonConfig,
        redirectUris: [`http://127.0.0.1:18081/e2e-${runId}-dyn/callback`],
        clientName: `e2e-${runId}`,
        anonymous: true,
      })
      if (r.success) {
        // Public registration is stateless: nothing to tear down.
        expect(r.data.client_id).toBeString()
      } else {
        expect(r.errorData ?? r.errorMessage).toMatch(/anonymous|permission|forbidden|disabled/i)
      }
    },
    { timeout: 30_000 },
  )
})

describe("e2e auth-oauth: authorization-code + PKCE login as alice", () => {
  test(
    "oauthAuthCodeLogin issues tokens",
    async () => {
      const r = await oauthAuthCodeLogin({
        config: anonConfig,
        accountName: aliceName,
        accountSecret: aliceSecret,
        clientId,
        redirectUri,
        scope: "openid offline_access",
        consent: true,
      })
      if (!r.success) throw new Error(`auth-code login failed: ${r.errorMessage} ${r.errorData ?? ""}`)
      expect(r.data.access_token).toBeString()
      expect(r.data.refresh_token).toBeString()
      aliceAccessToken = r.data.access_token
      aliceRefreshToken = r.data.refresh_token ?? ""
    },
    { timeout: 30_000 },
  )

  test(
    "oidcUserinfo and oauthIntrospect describe the new token",
    async () => {
      const tokenConfig = requireConfig(stalwartClientConfig({ baseUrl: adminConfig.baseUrl, token: aliceAccessToken }))
      const info = await oidcUserinfo({ config: tokenConfig })
      if (!info.success) throw new Error(info.errorMessage)
      expect(info.data.preferred_username).toBe(aliceName)
      const introspect = await oauthIntrospect({ config: tokenConfig, token: aliceAccessToken })
      if (!introspect.success) throw new Error(introspect.errorMessage)
      expect(introspect.data.active).toBe(true)
      expect(introspect.data.token_type).toBe("bearer")
    },
    { timeout: 30_000 },
  )

  test(
    "oauthToken refreshes the access token",
    async () => {
      const r = await oauthToken({
        config: anonConfig,
        grantType: "refresh_token",
        refreshToken: aliceRefreshToken,
        clientId,
      })
      if (!r.success) throw new Error(`refresh failed: ${r.errorMessage} ${r.errorData ?? ""}`)
      expect(r.data.access_token).toBeString()
    },
    { timeout: 30_000 },
  )
})

describe("e2e auth-oauth: device flow as alice", () => {
  test(
    "oauthDeviceLogin authorizes, approves and polls to tokens",
    async () => {
      const r = await oauthDeviceLogin({
        config: anonConfig,
        clientId,
        accountName: aliceName,
        accountSecret: aliceSecret,
        consent: true,
        pollIntervalMs: 500,
        maxAttempts: 20,
      })
      if (!r.success) throw new Error(`device login failed: ${r.errorMessage} ${r.errorData ?? ""}`)
      expect(r.data.access_token).toBeString()
    },
    { timeout: 60_000 },
  )
})

describe("e2e auth-oauth: management helpers", () => {
  test(
    "managementAccount reports edition and permissions",
    async () => {
      const admin = await managementAccount({ config: adminConfig })
      if (!admin.success) throw new Error(admin.errorMessage)
      expect(admin.data.edition).toBe("community")
      expect(admin.data.permissions.length).toBeGreaterThan(0)
      const alice = await managementAccount({ config: aliceConfig })
      if (!alice.success) throw new Error(alice.errorMessage)
      expect(alice.data.locale).toBeString()
    },
    { timeout: 30_000 },
  )

  test(
    "managementDiscover returns the server OIDC document for alice",
    async () => {
      const r = await managementDiscover({ config: anonConfig, email: aliceName })
      if (!r.success) throw new Error(r.errorMessage)
      expect(r.data.token_endpoint).toContain("/auth/token")
    },
    { timeout: 30_000 },
  )

  test(
    "managementSchemaRedirect hash fetches a parseable schema",
    async () => {
      const redirect = await managementSchemaRedirect({ config: adminConfig })
      if (!redirect.success) throw new Error(redirect.errorMessage)
      // The hash is an opaque server id, not hex: pin only that it is non-empty.
      expect(redirect.data.hash.length).toBeGreaterThan(0)
      const schema = await managementSchema({ config: adminConfig, hash: redirect.data.hash })
      if (!schema.success) throw new Error(schema.errorMessage)
      expect(schema.data.hash).toBe(redirect.data.hash)
      expect(schema.data.schema["objects"]).toBeObject()
    },
    { timeout: 60_000 },
  )
})

describe("e2e auth-oauth: live delivery diagnostics", () => {
  test(
    "liveDeliveryToken issues a token and liveDelivery streams to completed",
    async () => {
      const token = await liveDeliveryToken({ config: adminConfig })
      if (!token.success) throw new Error(token.errorMessage)
      expect(token.data.length).toBeGreaterThan(0)
      const stages = await liveDelivery({ config: adminConfig, target: bobName, timeout: 30, token: token.data })
      if (!stages.success) throw new Error(`live delivery failed: ${stages.errorMessage} ${stages.errorData ?? ""}`)
      expect(stages.data.length).toBeGreaterThan(0)
      expect(stages.data[0]?.type).toBe("mxLookupStart")
      expect(stages.data[stages.data.length - 1]?.type).toBe("completed")
    },
    { timeout: 120_000 },
  )

  test(
    "tracing and metrics stay enterprise-gated",
    async () => {
      // Community build has no tracing/metrics arms at all: the server answers
      // a generic 404 ("The requested resource does not exist on this server.")
      // rather than "Enterprise feature".
      const tracingToken = await liveTracingToken({ config: adminConfig })
      expect(tracingToken.success).toBe(false)
      if (!tracingToken.success) expect(tracingToken.errorData ?? "").toContain("does not exist")
      const metricsToken = await liveMetricsToken({ config: adminConfig })
      expect(metricsToken.success).toBe(false)
      if (!metricsToken.success) expect(metricsToken.errorData ?? "").toContain("does not exist")
      const tracing = await liveTracing({ config: adminConfig, maxEvents: 1 })
      expect(tracing.success).toBe(false)
      if (!tracing.success) expect(tracing.errorData ?? "").toContain("does not exist")
      const metrics = await liveMetrics({ config: adminConfig, maxEvents: 1 })
      expect(metrics.success).toBe(false)
      if (!metrics.success) expect(metrics.errorData ?? "").toContain("does not exist")
    },
    { timeout: 60_000 },
  )
})
