import { describe, expect, test } from "bun:test"
import { loadE2eEnv, resolveE2eTarget, stalwartE2eSetup } from "../e2e/e2eSetup.js"

describe("e2e target resolver fails closed with no default", () => {
  test("unset target throws naming the var, allowed values, and no-default sentence", () => {
    let error: unknown
    try {
      resolveE2eTarget({})
    } catch (error_) {
      error = error_
    }
    expect(error).toBeInstanceOf(Error)
    const message = (error as Error).message
    expect(message).toContain("STALWART_E2E_TARGET")
    expect(message).toContain("live")
    expect(message).toContain("local")
    expect(message).toContain("There is no default environment.")
  })

  test("empty and whitespace targets throw the same fail-closed error", () => {
    for (const value of ["", "   "]) {
      let message = ""
      try {
        resolveE2eTarget({ STALWART_E2E_TARGET: value })
      } catch (error) {
        message = (error as Error).message
      }
      expect(message).toContain("STALWART_E2E_TARGET")
      expect(message).toContain("There is no default environment.")
    }
  })

  test("unknown targets hard-error naming the var, the value, and allowed values", () => {
    let message = ""
    try {
      resolveE2eTarget({ STALWART_E2E_TARGET: "staging" })
    } catch (error) {
      message = (error as Error).message
    }
    expect(message).toContain("STALWART_E2E_TARGET")
    expect(message).toContain("staging")
    expect(message).toContain("live")
    expect(message).toContain("local")
    expect(message).toContain("There is no default environment.")
  })

  test("explicit live and local targets resolve", () => {
    expect(resolveE2eTarget({ STALWART_E2E_TARGET: "live" })).toBe("live")
    expect(resolveE2eTarget({ STALWART_E2E_TARGET: "local" })).toBe("local")
  })
})

describe("e2e env loader refuses mismatched combos before network", () => {
  test("unset target rejects before any mail request", async () => {
    let message = ""
    try {
      await loadE2eEnv({})
    } catch (error) {
      message = (error as Error).message
    }
    expect(message).toContain("STALWART_E2E_TARGET")
    expect(message).toContain("There is no default environment.")
  })

  test("live target refuses loopback base URLs", async () => {
    let message = ""
    try {
      await loadE2eEnv({
        STALWART_E2E_TARGET: "live",
        STALWART_BASE_URL: "http://127.0.0.1:18080",
      })
    } catch (error) {
      message = (error as Error).message
    }
    expect(message).toContain("STALWART_E2E_TARGET=live")
    expect(message).toContain("127.0.0.1")
  })

  test("live target passes through without reading the harness file", async () => {
    const { target, env } = await loadE2eEnv({
      STALWART_E2E_TARGET: "live",
      STALWART_BASE_URL: "https://mail.example.com",
    })
    expect(target).toBe("live")
    expect(env["STALWART_BASE_URL"]).toBe("https://mail.example.com")
  })

  test("stalwartE2eSetup with no target throws before config/network", async () => {
    let message = ""
    try {
      await stalwartE2eSetup({})
    } catch (error) {
      message = (error as Error).message
    }
    expect(message).toContain("STALWART_E2E_TARGET")
    expect(message).toContain("There is no default environment.")
  })
})
