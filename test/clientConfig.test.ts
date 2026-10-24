import { afterEach, describe, expect, test } from "bun:test"
import { jmapAuthHeader } from "../src/jmap/jmapAuthHeader.js"
import { stalwartCapabilityResolver, STALWART_CAPABILITY } from "../src/index.js"
import { stalwartClientConfig } from "../src/client/stalwartClientConfig.js"
import { stalwartClientFromEnv } from "../src/client/stalwartClientFromEnv.js"

afterEach(() => {})

describe("stalwartClientConfig trims and validates", () => {
  test("strips trailing slash on baseUrl", () => {
    const r = stalwartClientConfig({ baseUrl: "https://mail.example.com/" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.baseUrl).toBe("https://mail.example.com")
  })

  test("accepts timeoutMs and retries", () => {
    const r = stalwartClientConfig({
      baseUrl: "https://mail.example.com",
      timeoutMs: 5000,
      retries: 2,
    })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.timeoutMs).toBe(5000)
      expect(r.data.retries).toBe(2)
    }
  })

  test("rejects non-URL baseUrl", () => {
    const r = stalwartClientConfig({ baseUrl: "not a url" })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("stalwartClientConfig")
  })
})

describe("stalwartClientFromEnv reads STALWART_ vars", () => {
  test("requires STALWART_BASE_URL", () => {
    const r = stalwartClientFromEnv({})
    expect(r.success).toBe(false)
    if (!r.success) expect(r.errorMessage).toContain("STALWART_BASE_URL")
  })

  test("loads username/password/token/accountId", () => {
    const r = stalwartClientFromEnv({
      STALWART_BASE_URL: "https://mail.example.com/",
      STALWART_USERNAME: "admin@example.com",
      STALWART_PASSWORD: "pw",
      STALWART_TOKEN: "API_x",
      STALWART_ACCOUNT_ID: "a1",
      STALWART_TIMEOUT_MS: "10000",
      STALWART_RETRIES: "2",
    })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.baseUrl).toBe("https://mail.example.com")
      expect(r.data.username).toBe("admin@example.com")
      expect(r.data.password).toBe("pw")
      expect(r.data.token).toBe("API_x")
      expect(r.data.accountId).toBe("a1")
      expect(r.data.timeoutMs).toBe(10000)
      expect(r.data.retries).toBe(2)
    }
  })

  test("ignores invalid numeric strings", () => {
    const r = stalwartClientFromEnv({
      STALWART_BASE_URL: "https://mail.example.com",
      STALWART_TIMEOUT_MS: "abc",
      STALWART_RETRIES: "",
    })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.timeoutMs).toBeUndefined()
      expect(r.data.retries).toBeUndefined()
    }
  })
})

describe("jmapAuthHeader builds Authorization headers", () => {
  test("Basic wins when username+password are set", () => {
    const header = jmapAuthHeader({ username: "u", password: "p", token: "API_x" })
    expect(header.Authorization).toBe(`Basic ${Buffer.from("u:p").toString("base64")}`)
  })

  test("Bearer for token-only config", () => {
    expect(jmapAuthHeader({ token: "API_x" })).toEqual({ Authorization: "Bearer API_x" })
  })

  test("anonymous when no credentials", () => {
    expect(jmapAuthHeader({})).toEqual({})
  })
})

describe("stalwartCapabilityResolver maps x:* to urn:stalwart:jmap", () => {
  test("x:Domain/query resolves stalwart capability", () => {
    expect(stalwartCapabilityResolver("x:Domain/query")).toEqual([STALWART_CAPABILITY])
  })

  test("standard methods return undefined", () => {
    expect(stalwartCapabilityResolver("Core/echo")).toBeUndefined()
    expect(stalwartCapabilityResolver("Email/get")).toBeUndefined()
  })
})
