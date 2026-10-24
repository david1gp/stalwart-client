import { afterEach, describe, expect, test } from "bun:test"
import pkg from "../package.json" with { type: "json" }
import { PACKAGE_VERSION, jmapClientConfig, packageVersion, stalwartClientConfig } from "../src/index.js"

describe("smoke: package version matches package.json", () => {
  test("PACKAGE_VERSION is set", () => {
    expect(PACKAGE_VERSION).toBe(pkg.version)
    expect(packageVersion).toBe(pkg.version)
  })
})

describe("smoke: jmapClientConfig accepts valid config", () => {
  test("accepts baseUrl with credentials", () => {
    const r = jmapClientConfig({
      baseUrl: "https://mail.example.com",
      username: "admin@example.com",
      password: "secret",
    })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.baseUrl).toBe("https://mail.example.com")
      expect(r.data.username).toBe("admin@example.com")
    }
  })

  test("credentials are optional in the schema", () => {
    const r = jmapClientConfig({ baseUrl: "https://mail.example.com" })
    expect(r.success).toBe(true)
  })
})

describe("smoke: jmapClientConfig rejects invalid config", () => {
  test("rejects empty baseUrl", () => {
    const r = jmapClientConfig({ baseUrl: "" })
    expect(r.success).toBe(false)
  })
})

describe("smoke: stalwartClientConfig accepts valid config", () => {
  test("accepts baseUrl with token", () => {
    const r = stalwartClientConfig({ baseUrl: "https://mail.example.com", token: "API_x" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.token).toBe("API_x")
  })

  test("rejects garbage", () => {
    const r = stalwartClientConfig({ baseUrl: "not a url" })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("stalwartClientConfig")
  })
})

afterEach(() => {})
