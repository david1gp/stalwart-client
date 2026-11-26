import { afterEach, describe, expect, test } from "bun:test"
import { stalwartClientConfig } from "../src/client/stalwartClientConfig.js"
import { managementLogin } from "../src/management/managementLogin.js"
import { passkeyRegistrationOptions } from "../src/passkeys/passkeyRegistrationOptions.js"
import { fetchMockCreate, fetchMockJson } from "./fetchMock.js"
import { jmapTestSessionCreate } from "./jmapTestSession.js"

const configResult = stalwartClientConfig({ baseUrl: "https://mail.example.test" })
if (!configResult.success) throw new Error("fixture config invalid")
const config = configResult.data

let mock: ReturnType<typeof fetchMockCreate> | undefined
afterEach(() => {
  mock?.restore()
  mock = undefined
})

type SentCall = { using: string[]; methodCalls: [string, Record<string, unknown>, string][] }

function mockJmap(methodName: string, args: Record<string, unknown>): { sent: SentCall[] } {
  const sent: SentCall[] = []
  mock = fetchMockCreate((request) => {
    const url = new URL(request.url)
    if (url.pathname === "/jmap/session") return fetchMockJson(jmapTestSessionCreate())
    sent.push(JSON.parse(String(request.body)) as SentCall)
    return fetchMockJson({ methodResponses: [[methodName, args, "c1"]], sessionState: "1" })
  })
  return { sent }
}

const registrationResponse = {
  accountId: "a1",
  publicKey: {
    rp: { id: "mail.example.test", name: "mail.example.test" },
    user: { id: "dXNlcjE", name: "alice@example.test", displayName: "Alice" },
    challenge: "Y2hhbGxlbmdl",
    pubKeyCredParams: [
      { type: "public-key", alg: -7 },
      { type: "public-key", alg: -8 },
      { type: "public-key", alg: -257 },
    ],
    timeout: 300000,
    excludeCredentials: [{ type: "public-key", id: "ZXhjbHVkZTE" }],
    authenticatorSelection: { residentKey: "required", requireResidentKey: true, userVerification: "required" },
    attestation: "none",
  },
}

describe("passkeyRegistrationOptions sends x:Passkey/registrationOptions with core+stalwart using", () => {
  test("posts accountId, currentSecret and otpCode with the camelCase wire names", async () => {
    const { sent } = mockJmap("x:Passkey/registrationOptions", registrationResponse)
    const r = await passkeyRegistrationOptions({
      config,
      accountId: "a1",
      currentSecret: "pw",
      otpCode: "123456",
    })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.accountId).toBe("a1")
      expect(r.data.publicKey.challenge).toBe("Y2hhbGxlbmdl")
      expect(r.data.publicKey.pubKeyCredParams).toHaveLength(3)
      expect(r.data.publicKey.excludeCredentials).toEqual([{ type: "public-key", id: "ZXhjbHVkZTE" }])
      expect(r.data.publicKey.authenticatorSelection.requireResidentKey).toBe(true)
      expect(r.data.publicKey.user.displayName).toBe("Alice")
    }
    expect(sent).toHaveLength(1)
    expect(sent[0]?.using).toEqual(["urn:ietf:params:jmap:core", "urn:stalwart:jmap"])
    expect(sent[0]?.methodCalls[0]).toEqual([
      "x:Passkey/registrationOptions",
      { accountId: "a1", currentSecret: "pw", otpCode: "123456" },
      "c1",
    ])
  })

  test("omits currentSecret and otpCode when absent and falls back to the session primary account", async () => {
    const { sent } = mockJmap("x:Passkey/registrationOptions", registrationResponse)
    const r = await passkeyRegistrationOptions({ config })
    expect(r.success).toBe(true)
    expect(sent).toHaveLength(1)
    expect(sent[0]?.methodCalls[0]).toEqual(["x:Passkey/registrationOptions", { accountId: "a1" }, "c1"])
  })

  test("surfaces a method-level error as a ResultErr", async () => {
    mockJmap("error", { type: "forbidden", description: "Current secret is incorrect." })
    const r = await passkeyRegistrationOptions({ config, accountId: "a1", currentSecret: "wrong" })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("jmapMethodCall")
  })

  test("rejects empty secrets without sending a request or echoing the values", async () => {
    const { sent } = mockJmap("x:Passkey/registrationOptions", registrationResponse)
    const r = await passkeyRegistrationOptions({ config, accountId: "a1", currentSecret: "s3cr3t-value", otpCode: "" })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.op).toBe("passkeyRegistrationOptions")
      expect(JSON.stringify(r)).not.toContain("s3cr3t-value")
    }
    expect(sent).toHaveLength(0)
    expect(mock?.requests).toHaveLength(0)
  })
})

describe("managementLogin covers the Stalwart passkey ceremony", () => {
  test("passkeyOptions posts a bare challenge request and returns challenge/rpId/timeout", async () => {
    let seenBody: unknown
    mock = fetchMockCreate((request) => {
      expect(new URL(request.url).pathname).toBe("/api/auth")
      seenBody = JSON.parse(String(request.body))
      return fetchMockJson({
        type: "passkeyOptions",
        challenge: "Y2hhbGxlbmdl",
        rpId: "mail.example.test",
        timeout: 300000,
      })
    })
    const r = await managementLogin({ config, login: { type: "passkeyOptions" } })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data).toEqual({
        type: "passkeyOptions",
        challenge: "Y2hhbGxlbmdl",
        rpId: "mail.example.test",
        timeout: 300000,
      })
    }
    expect(seenBody).toEqual({ type: "passkeyOptions" })
  })

  test("authCodePasskey posts the camelCase assertion and query, omitting an absent userHandle", async () => {
    let seenBody: unknown
    mock = fetchMockCreate((request) => {
      seenBody = JSON.parse(String(request.body))
      return fetchMockJson({ type: "authenticated", location: "https://localhost/cb?code=cc&state=s&iss=https://x" })
    })
    const r = await managementLogin({
      config,
      login: {
        type: "authCodePasskey",
        credential: {
          rawId: "a2V5LWlk",
          response: { clientDataJSON: "Y2xpZW50", authenticatorData: "YXV0aA", signature: "c2ln" },
        },
        query: "response_type=code&client_id=web",
      },
    })
    expect(r.success).toBe(true)
    expect(seenBody).toEqual({
      type: "authCodePasskey",
      credential: {
        rawId: "a2V5LWlk",
        response: { clientDataJSON: "Y2xpZW50", authenticatorData: "YXV0aA", signature: "c2ln" },
      },
      query: "response_type=code&client_id=web",
    })
  })

  test("authDevicePasskey posts the credential with the device code and returns verified", async () => {
    let seenBody: unknown
    mock = fetchMockCreate((request) => {
      seenBody = JSON.parse(String(request.body))
      return fetchMockJson({ type: "verified" })
    })
    const r = await managementLogin({
      config,
      login: {
        type: "authDevicePasskey",
        credential: {
          rawId: "a2V5LWlk",
          response: {
            clientDataJSON: "Y2xpZW50",
            authenticatorData: "YXV0aA",
            signature: "c2ln",
            userHandle: "dXNlcjE",
          },
        },
        code: "ABCD-EFGH",
      },
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual({ type: "verified" })
    expect(seenBody).toMatchObject({ type: "authDevicePasskey", code: "ABCD-EFGH" })
  })

  test("passkeyUnknown, expired and failure answers pass through as typed responses", async () => {
    for (const answer of [{ type: "passkeyUnknown" }, { type: "expired" }, { type: "failure" }] as const) {
      mock?.restore()
      mock = fetchMockCreate(() => fetchMockJson(answer))
      const r = await managementLogin({ config, login: { type: "passkeyOptions" } })
      expect(r.success).toBe(true)
      if (r.success) expect(r.data).toEqual(answer)
    }
  })

  test("rejects a passkey login with an empty assertion field", async () => {
    mock = fetchMockCreate(() => fetchMockJson({ type: "failure" }))
    const r = await managementLogin({
      config,
      login: {
        type: "authCodePasskey",
        credential: {
          rawId: "",
          response: { clientDataJSON: "Y2xpZW50", authenticatorData: "YXV0aA", signature: "c2ln" },
        },
        query: "response_type=code",
      },
    })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("managementLogin")
    expect(mock?.requests).toHaveLength(0)
  })
})
