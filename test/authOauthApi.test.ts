import { afterEach, describe, expect, test } from "bun:test"
import { stalwartClientConfig } from "../src/client/stalwartClientConfig.js"
import { managementAccount } from "../src/management/managementAccount.js"
import { managementClientInfo } from "../src/management/managementClientInfo.js"
import { managementDiscover } from "../src/management/managementDiscover.js"
import { managementLogin } from "../src/management/managementLogin.js"
import { managementSchema } from "../src/management/managementSchema.js"
import { managementSchemaRedirect } from "../src/management/managementSchemaRedirect.js"
import { oauthAuthCodeLogin } from "../src/oauth/oauthAuthCodeLogin.js"
import { oauthClientRegister } from "../src/oauth/oauthClientRegister.js"
import { oauthDeviceApprove } from "../src/oauth/oauthDeviceApprove.js"
import { oauthDeviceAuthorize } from "../src/oauth/oauthDeviceAuthorize.js"
import { oauthDeviceLogin } from "../src/oauth/oauthDeviceLogin.js"
import { oauthIntrospect } from "../src/oauth/oauthIntrospect.js"
import { oauthJwks } from "../src/oauth/oauthJwks.js"
import { oauthLogout } from "../src/oauth/oauthLogout.js"
import { oauthMetadata } from "../src/oauth/oauthMetadata.js"
import { oauthRevoke } from "../src/oauth/oauthRevoke.js"
import { oauthPkcePairCreate } from "../src/oauth/oauthPkcePairCreate.js"
import { oauthProtectedResource } from "../src/oauth/oauthProtectedResource.js"
import { oauthToken } from "../src/oauth/oauthToken.js"
import { oidcMetadata } from "../src/oauth/oidcMetadata.js"
import { oidcUserinfo } from "../src/oauth/oidcUserinfo.js"
import { fetchMockCreate, fetchMockJson } from "./fetchMock.js"

const configResult = stalwartClientConfig({ baseUrl: "https://mail.example.test" })
if (!configResult.success) throw new Error("fixture config invalid")
const config = configResult.data

const authedResult = stalwartClientConfig({
  baseUrl: "https://mail.example.test",
  username: "admin@example.test",
  password: "secret",
})
if (!authedResult.success) throw new Error("fixture config invalid")
const authedConfig = authedResult.data

let mock: ReturnType<typeof fetchMockCreate> | undefined
afterEach(() => {
  mock?.restore()
  mock = undefined
})

function formBody(request: { body: unknown }): URLSearchParams {
  return new URLSearchParams(String(request.body))
}

describe("OAuth discovery endpoints", () => {
  test("oauthMetadata fetches the authorization server document anonymously", async () => {
    mock = fetchMockCreate((request) => {
      expect(new URL(request.url).pathname).toBe("/.well-known/oauth-authorization-server")
      expect(request.method).toBe("GET")
      expect(request.headers["Authorization"] ?? request.headers["Authorization"]).toBeUndefined()
      return fetchMockJson({ issuer: "https://mail.example.test", grant_types_supported: ["authorization_code"] })
    })
    const r = await oauthMetadata({ config })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.issuer).toBe("https://mail.example.test")
    expect(mock?.requests).toHaveLength(1)
  })

  test("oauthProtectedResource fetches the protected resource document", async () => {
    mock = fetchMockCreate((request) => {
      expect(new URL(request.url).pathname).toBe("/.well-known/oauth-protected-resource")
      return fetchMockJson({ resource: "https://mail.example.test", bearer_methods_supported: ["header"] })
    })
    const r = await oauthProtectedResource({ config })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.bearer_methods_supported).toEqual(["header"])
  })

  test("oidcMetadata fetches the OpenID discovery document", async () => {
    mock = fetchMockCreate((request) => {
      expect(new URL(request.url).pathname).toBe("/.well-known/openid-configuration")
      return fetchMockJson({ issuer: "https://mail.example.test", userinfo_endpoint: "https://x/auth/userinfo" })
    })
    const r = await oidcMetadata({ config })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.userinfo_endpoint).toBe("https://x/auth/userinfo")
  })

  test("oauthJwks fetches the key set", async () => {
    mock = fetchMockCreate((request) => {
      expect(new URL(request.url).pathname).toBe("/auth/jwks.json")
      return fetchMockJson({ keys: [{ kty: "RSA", kid: "default" }] })
    })
    const r = await oauthJwks({ config })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.keys).toHaveLength(1)
  })
})

describe("OAuth device flow", () => {
  test("oauthDeviceAuthorize posts client_id as a form body", async () => {
    mock = fetchMockCreate((request) => {
      const url = new URL(request.url)
      expect(url.pathname).toBe("/auth/device")
      expect(request.method).toBe("POST")
      expect(request.headers["Content-Type"]).toContain("application/x-www-form-urlencoded")
      const form = formBody(request)
      expect(form.get("client_id")).toBe("e2e-client")
      expect(form.get("scope")).toBe("openid")
      return fetchMockJson({
        device_code: "dev1",
        user_code: "ABCD-EFGH",
        verification_uri: "https://x/device",
        verification_uri_complete: "https://x/device/?code=ABCD-EFGH",
        expires_in: 600,
        interval: 5,
      })
    })
    const r = await oauthDeviceAuthorize({ config, clientId: "e2e-client", scope: "openid" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.user_code).toBe("ABCD-EFGH")
  })

  test("oauthDeviceApprove posts the authDevice login request", async () => {
    let seenBody: unknown
    mock = fetchMockCreate((request) => {
      expect(new URL(request.url).pathname).toBe("/api/auth")
      expect(request.headers["Content-Type"]).toContain("application/json")
      seenBody = JSON.parse(String(request.body))
      return fetchMockJson({ type: "verified" })
    })
    const r = await oauthDeviceApprove({
      config,
      accountName: "alice@example.test",
      accountSecret: "pw",
      code: "ABCD-EFGH",
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual({ type: "verified" })
    expect(seenBody).toEqual({
      type: "authDevice",
      accountName: "alice@example.test",
      accountSecret: "pw",
      code: "ABCD-EFGH",
    })
  })
})

describe("OAuth token endpoint", () => {
  test("oauthToken exchanges an authorization code with PKCE verifier", async () => {
    mock = fetchMockCreate((request) => {
      expect(new URL(request.url).pathname).toBe("/auth/token")
      expect(request.method).toBe("POST")
      const form = formBody(request)
      expect(form.get("grant_type")).toBe("authorization_code")
      expect(form.get("code")).toBe("code1")
      expect(form.get("client_id")).toBe("web")
      expect(form.get("redirect_uri")).toBe("https://localhost/cb")
      expect(form.get("code_verifier")).toBe("verifier1")
      return fetchMockJson({ access_token: "at", token_type: "bearer", expires_in: 3600 })
    })
    const r = await oauthToken({
      config,
      grantType: "authorization_code",
      code: "code1",
      clientId: "web",
      redirectUri: "https://localhost/cb",
      codeVerifier: "verifier1",
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.access_token).toBe("at")
  })

  test("oauthToken sends confidential client auth as HTTP Basic", async () => {
    mock = fetchMockCreate((request) => {
      expect(request.headers["Authorization"]).toBe(`Basic ${Buffer.from("web:s3cret").toString("base64")}`)
      const form = formBody(request)
      expect(form.get("client_secret")).toBeNull()
      expect(form.get("refresh_token")).toBe("rt1")
      return fetchMockJson({ access_token: "at2", token_type: "bearer", expires_in: 3600 })
    })
    const r = await oauthToken({
      config,
      grantType: "refresh_token",
      refreshToken: "rt1",
      clientId: "web",
      clientSecret: "s3cret",
      clientAuth: "client_secret_basic",
    })
    expect(r.success).toBe(true)
  })

  test("oauthToken sends confidential client auth in the form body", async () => {
    mock = fetchMockCreate((request) => {
      const form = formBody(request)
      expect(form.get("client_secret")).toBe("s3cret")
      return fetchMockJson({ access_token: "at3", token_type: "bearer", expires_in: 3600 })
    })
    const r = await oauthToken({
      config,
      grantType: "refresh_token",
      refreshToken: "rt1",
      clientId: "web",
      clientSecret: "s3cret",
      clientAuth: "client_secret_post",
    })
    expect(r.success).toBe(true)
  })

  test("oauthToken sends scope for refresh narrowing", async () => {
    mock = fetchMockCreate((request) => {
      const form = formBody(request)
      expect(form.get("grant_type")).toBe("refresh_token")
      expect(form.get("refresh_token")).toBe("rt1")
      expect(form.get("scope")).toBe("openid")
      return fetchMockJson({ access_token: "at4", token_type: "bearer", expires_in: 3600 })
    })
    const r = await oauthToken({
      config,
      grantType: "refresh_token",
      refreshToken: "rt1",
      clientId: "web",
      scope: "openid",
    })
    expect(r.success).toBe(true)
  })

  test("oauthToken surfaces error grants as a ResultErr with the server JSON", async () => {
    mock = fetchMockCreate(() => fetchMockJson({ error: "authorization_pending" }, 400, "Bad Request"))
    const r = await oauthToken({
      config,
      grantType: "urn:ietf:params:oauth:grant-type:device_code",
      deviceCode: "dev1",
      clientId: "web",
    })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.op.startsWith("jmapHttpRequest")).toBe(true)
      expect(r.errorData).toContain("authorization_pending")
    }
  })
})

describe("OAuth introspection, userinfo and registration", () => {
  test("oauthIntrospect posts the token as a form field with auth", async () => {
    mock = fetchMockCreate((request) => {
      expect(new URL(request.url).pathname).toBe("/auth/introspect")
      expect(request.headers["Authorization"]).toStartWith("Basic ")
      expect(formBody(request).get("token")).toBe("at")
      return fetchMockJson({ active: true, username: "alice@example.test", token_type: "bearer" })
    })
    const r = await oauthIntrospect({ config: authedConfig, token: "at" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.username).toBe("alice@example.test")
  })

  test("oidcUserinfo fetches claims with the Bearer [REDACTED]", async () => {
    const tokenResult = stalwartClientConfig({ baseUrl: "https://mail.example.test", token: "at" })
    if (!tokenResult.success) throw new Error("fixture config invalid")
    mock = fetchMockCreate((request) => {
      expect(new URL(request.url).pathname).toBe("/auth/userinfo")
      expect(request.headers["Authorization"]).toBe("Bearer at")
      return fetchMockJson({ sub: "c", preferred_username: "alice@example.test", email_verified: true })
    })
    const r = await oidcUserinfo({ config: tokenResult.data })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.preferred_username).toBe("alice@example.test")
  })

  test("oauthClientRegister posts redirect URIs as JSON", async () => {
    let seenBody: unknown
    mock = fetchMockCreate((request) => {
      expect(new URL(request.url).pathname).toBe("/auth/register")
      expect(request.method).toBe("POST")
      seenBody = JSON.parse(String(request.body))
      return fetchMockJson({ client_id: "stateless-id", redirect_uris: ["https://localhost/cb"] }, 201, "Created")
    })
    const r = await oauthClientRegister({
      config,
      redirectUris: ["https://localhost/cb"],
      clientName: "e2e",
      anonymous: true,
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.client_id).toBe("stateless-id")
    expect(seenBody).toEqual({ redirect_uris: ["https://localhost/cb"], client_name: "e2e" })
  })
})

describe("OAuth revocation and logout", () => {
  test("oauthRevoke posts the token form anonymously", async () => {
    mock = fetchMockCreate((request) => {
      expect(new URL(request.url).pathname).toBe("/auth/revoke")
      expect(request.method).toBe("POST")
      expect(request.headers["Authorization"]).toBeUndefined()
      const form = formBody(request)
      expect(form.get("token")).toBe("rt1")
      expect(form.get("client_id")).toBe("web")
      return new Response(null, { status: 200, statusText: "OK" })
    })
    const r = await oauthRevoke({ config, token: "rt1", clientId: "web" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual({ revoked: true })
  })

  test("oauthRevoke sends confidential client auth as HTTP Basic", async () => {
    mock = fetchMockCreate((request) => {
      expect(request.headers["Authorization"]).toBe(`Basic ${Buffer.from("web:s3cret").toString("base64")}`)
      expect(formBody(request).get("client_secret")).toBeNull()
      return new Response(null, { status: 200, statusText: "OK" })
    })
    const r = await oauthRevoke({
      config,
      token: "rt1",
      clientId: "web",
      clientSecret: "s3cret",
      clientAuth: "client_secret_basic",
    })
    expect(r.success).toBe(true)
  })

  test("oauthRevoke surfaces invalid_client as a ResultErr", async () => {
    mock = fetchMockCreate(() => fetchMockJson({ error: "invalid_client" }, 401, "Unauthorized"))
    const r = await oauthRevoke({ config, token: "rt1", clientId: "nope" })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.errorData).toContain("invalid_client")
  })

  test("oauthLogout observes the post-logout redirect without following it", async () => {
    mock = fetchMockCreate((request) => {
      const url = new URL(request.url)
      expect(url.pathname).toBe("/auth/logout")
      expect(url.searchParams.get("client_id")).toBe("web")
      expect(url.searchParams.get("post_logout_redirect_uri")).toBe("https://app.example.test/signed-out")
      expect(url.searchParams.get("state")).toBe("s1")
      return new Response(null, {
        status: 303,
        statusText: "See Other",
        headers: { location: "https://app.example.test/signed-out?state=s1" },
      })
    })
    const r = await oauthLogout({
      config,
      clientId: "web",
      postLogoutRedirectUri: "https://app.example.test/signed-out",
      state: "s1",
    })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.ended).toBe(true)
      expect(r.data.location).toBe("https://app.example.test/signed-out?state=s1")
    }
  })

  test("oauthLogout treats the signed-out page as success", async () => {
    mock = fetchMockCreate((request) => {
      expect(new URL(request.url).pathname).toBe("/auth/logout")
      return new Response("<h1>You have been signed out</h1>", { status: 200, statusText: "OK" })
    })
    const r = await oauthLogout({ config })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.ended).toBe(true)
      expect(r.data.location).toBeUndefined()
    }
  })
})

describe("OAuth PKCE helper", () => {
  test("oauthPkcePairCreate returns a verifier and matching S256 challenge", async () => {
    const r = await oauthPkcePairCreate()
    expect(r.success).toBe(true)
    if (!r.success) return
    expect(r.data.verifier).toMatch(/^[A-Za-z0-9\-._~]{64}$/)
    expect(r.data.method).toBe("S256")
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(r.data.verifier))
    expect(r.data.challenge).toBe(Buffer.from(digest).toString("base64url"))
  })

  test("oauthPkcePairCreate rejects a verifier length outside 43-128", async () => {
    const r = await oauthPkcePairCreate({ length: 10 })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("oauthPkcePairCreate")
  })
})

describe("OAuth convenience logins", () => {
  test("oauthAuthCodeLogin runs login then token exchange", async () => {
    const bodies: unknown[] = []
    mock = fetchMockCreate((request) => {
      const url = new URL(request.url)
      bodies.push({ path: url.pathname, body: request.body })
      if (url.pathname === "/api/auth") {
        return fetchMockJson({ type: "authenticated", location: "https://localhost/cb?code=cc1&state=s1&iss=x" })
      }
      const form = formBody(request)
      expect(form.get("grant_type")).toBe("authorization_code")
      expect(form.get("code")).toBe("cc1")
      expect(form.get("code_verifier")).toBeString()
      return fetchMockJson({ access_token: "at", token_type: "bearer", expires_in: 3600 })
    })
    const r = await oauthAuthCodeLogin({
      config,
      accountName: "alice@example.test",
      accountSecret: "pw",
      clientId: "web",
      redirectUri: "https://localhost/cb",
      state: "s1",
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.access_token).toBe("at")
    expect(bodies).toHaveLength(2)
    const login = (bodies[0] as { body: string }).body
    const loginJson = JSON.parse(login) as Record<string, unknown>
    expect(loginJson["type"]).toBe("authCode")
    const query = new URLSearchParams(loginJson["query"] as string)
    expect(query.get("response_type")).toBe("code")
    expect(query.get("client_id")).toBe("web")
    expect(query.get("redirect_uri")).toBe("https://localhost/cb")
    expect(query.get("state")).toBe("s1")
    expect(query.get("code_challenge_method")).toBe("S256")
    expect(query.get("code_challenge")).toBeString()
  })

  test("oauthAuthCodeLogin fails when the redirect carries no code", async () => {
    mock = fetchMockCreate((request) => {
      if (new URL(request.url).pathname === "/api/auth") {
        return fetchMockJson({ type: "authenticated", location: "https://localhost/cb?state=s1" })
      }
      return fetchMockJson({})
    })
    const r = await oauthAuthCodeLogin({
      config,
      accountName: "alice@example.test",
      accountSecret: "pw",
      clientId: "web",
      redirectUri: "https://localhost/cb",
    })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("oauthAuthCodeLogin")
  })

  test("oauthAuthCodeLogin fails when login does not issue a code", async () => {
    mock = fetchMockCreate((request) => {
      if (new URL(request.url).pathname === "/api/auth") return fetchMockJson({ type: "denied" })
      return fetchMockJson({})
    })
    const r = await oauthAuthCodeLogin({
      config,
      accountName: "alice@example.test",
      accountSecret: "pw",
      clientId: "web",
      redirectUri: "https://localhost/cb",
    })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("oauthAuthCodeLogin")
  })

  test("oauthDeviceLogin authorizes, approves and polls to tokens", async () => {
    let polls = 0
    mock = fetchMockCreate((request) => {
      const url = new URL(request.url)
      if (url.pathname === "/auth/device") {
        return fetchMockJson({
          device_code: "dev1",
          user_code: "U1",
          verification_uri: "https://x/device",
          verification_uri_complete: "https://x/device/?code=U1",
          expires_in: 600,
          interval: 0,
        })
      }
      if (url.pathname === "/api/auth") return fetchMockJson({ type: "verified" })
      polls += 1
      if (polls === 1) return fetchMockJson({ error: "authorization_pending" }, 400, "Bad Request")
      return fetchMockJson({ access_token: "at-dev", token_type: "bearer", expires_in: 3600 })
    })
    const r = await oauthDeviceLogin({
      config,
      clientId: "web",
      accountName: "alice@example.test",
      accountSecret: "pw",
      pollIntervalMs: 1,
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.access_token).toBe("at-dev")
    expect(polls).toBe(2)
  })

  test("oauthDeviceLogin stops polling on a hard token error", async () => {
    mock = fetchMockCreate((request) => {
      const url = new URL(request.url)
      if (url.pathname === "/auth/device") {
        return fetchMockJson({
          device_code: "dev1",
          user_code: "U1",
          verification_uri: "https://x/device",
          verification_uri_complete: "https://x/device/?code=U1",
          expires_in: 600,
          interval: 0,
        })
      }
      if (url.pathname === "/api/auth") return fetchMockJson({ type: "verified" })
      return fetchMockJson({ error: "expired_token" }, 400, "Bad Request")
    })
    const r = await oauthDeviceLogin({
      config,
      clientId: "web",
      accountName: "alice@example.test",
      accountSecret: "pw",
      pollIntervalMs: 1,
    })
    expect(r.success).toBe(false)
  })
})

describe("Management endpoints", () => {
  test("managementLogin posts the authCode request anonymously", async () => {
    let seenBody: unknown
    mock = fetchMockCreate((request) => {
      expect(new URL(request.url).pathname).toBe("/api/auth")
      expect(request.headers["Authorization"] ?? request.headers["Authorization"]).toBeUndefined()
      seenBody = JSON.parse(String(request.body))
      return fetchMockJson({ type: "authenticated", location: "https://localhost/cb?code=cc&state=s&iss=https://x" })
    })
    const r = await managementLogin({
      config,
      login: {
        type: "authCode",
        accountName: "alice@example.test",
        accountSecret: "pw",
        query: "response_type=code&client_id=web&redirect_uri=https%3A%2F%2Flocalhost%2Fcb&state=s",
      },
    })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data).toEqual({
        type: "authenticated",
        location: "https://localhost/cb?code=cc&state=s&iss=https://x",
      })
    }
    expect(seenBody).toMatchObject({ type: "authCode" })
    expect(seenBody).toHaveProperty("query")
  })

  test("managementLogin posts authConsent with a token", async () => {
    let seenBody: unknown
    mock = fetchMockCreate((request) => {
      seenBody = JSON.parse(String(request.body))
      return fetchMockJson({ type: "verified" })
    })
    const r = await managementLogin({
      config,
      login: { type: "authConsent", token: "t1", query: "client_id=web", consent: true },
    })
    expect(r.success).toBe(true)
    expect(seenBody).toEqual({ type: "authConsent", token: "t1", query: "client_id=web", consent: true })
  })

  test("managementClientInfo fetches the client record for an authorization query", async () => {
    mock = fetchMockCreate((request) => {
      const url = new URL(request.url)
      expect(url.pathname).toBe("/api/auth/client")
      expect(url.searchParams.get("client_id")).toBe("web")
      expect(request.headers["Authorization"]).toBeUndefined()
      return fetchMockJson({ name: "Web", scopes: ["Mail"], verified: true, consentRequired: false })
    })
    const r = await managementClientInfo({ config, query: "client_id=web&redirect_uri=https%3A%2F%2Flocalhost%2Fcb" })
    expect(r.success).toBe(true)
    if (r.success && "verified" in r.data) expect(r.data.verified).toBe(true)
  })

  test("managementClientInfo surfaces the error variant for unknown clients", async () => {
    mock = fetchMockCreate(() => fetchMockJson({ error: "invalid_client", description: "nope", redirect: false }))
    const r = await managementClientInfo({ config, query: "client_id=nope" })
    expect(r.success).toBe(true)
    if (r.success && "error" in r.data) expect(r.data.error).toBe("invalid_client")
  })

  test("managementDiscover encodes the email in the path", async () => {
    mock = fetchMockCreate((request) => {
      expect(new URL(request.url).pathname).toBe("/api/discover/alice%40example.test")
      return fetchMockJson({ issuer: "https://x", authorization_endpoint: "https://x/login" })
    })
    const r = await managementDiscover({ config, email: "alice@example.test" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.issuer).toBe("https://x")
  })

  test("managementAccount fetches permissions with auth", async () => {
    mock = fetchMockCreate((request) => {
      expect(new URL(request.url).pathname).toBe("/api/account")
      expect(request.headers["Authorization"]).toStartWith("Basic ")
      return fetchMockJson({ permissions: ["authenticate"], edition: "community", locale: "en-US" })
    })
    const r = await managementAccount({ config: authedConfig })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.edition).toBe("community")
  })

  test("managementSchemaRedirect reads the hash from the Location header", async () => {
    mock = fetchMockCreate((request) => {
      expect(new URL(request.url).pathname).toBe("/api/schema")
      return new Response(null, { status: 302, headers: { Location: "/api/schema/abc123" } })
    })
    const r = await managementSchemaRedirect({ config: authedConfig })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual({ hash: "abc123", location: "/api/schema/abc123" })
  })

  test("managementSchema fetches and wraps the schema document", async () => {
    mock = fetchMockCreate((request) => {
      expect(new URL(request.url).pathname).toBe("/api/schema/abc123")
      return fetchMockJson({ objects: {}, fields: {} })
    })
    const r = await managementSchema({ config: authedConfig, hash: "abc123" })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.hash).toBe("abc123")
      expect(r.data.schema).toEqual({ objects: {}, fields: {} })
    }
  })

  test("invalid management options are a ResultErr with op", async () => {
    mock = fetchMockCreate(() => fetchMockJson({}))
    const r = await managementDiscover({ config: { baseUrl: "" }, email: "a@b.test" })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("managementDiscover")
  })
})

describe("OAuth invalid options", () => {
  test("invalid oauth options are a ResultErr with op", async () => {
    mock = fetchMockCreate(() => fetchMockJson({}))
    const r = await oauthToken({ config: { baseUrl: "" }, grantType: "refresh_token" })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("oauthToken")
  })
})
