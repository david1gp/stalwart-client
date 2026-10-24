import { afterEach, describe, expect, test } from "bun:test"
import { coreEcho } from "../src/jmap/coreEcho.js"
import { jmapClientConfig } from "../src/jmap/jmapClientConfig.js"
import { fetchMockCreate, fetchMockJson } from "./fetchMock.js"
import { jmapTestSessionCreate } from "./jmapTestSession.js"

const config = jmapClientConfig({ baseUrl: "https://mail.example.com", token: "API_x" })
if (!config.success) throw new Error("fixture config invalid")

describe("coreEcho reference op", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("echoes args verbatim", async () => {
    let seenBody: unknown
    mock = fetchMockCreate((request) => {
      const url = new URL(request.url)
      if (url.pathname === "/jmap/session") return fetchMockJson(jmapTestSessionCreate())
      seenBody = JSON.parse(String(request.body))
      return fetchMockJson({
        methodResponses: [["Core/echo", { hello: true, high: 5 }, "c1"]],
        sessionState: "1",
      })
    })
    const r = await coreEcho({ config: config.data, args: { hello: true, high: 5 } })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual({ hello: true, high: 5 })
    const body = seenBody as { using: string[]; methodCalls: unknown[][] }
    expect(body.using).toEqual(["urn:ietf:params:jmap:core"])
    expect(body.methodCalls).toEqual([["Core/echo", { hello: true, high: 5 }, "c1"]])
  })

  test("invalid options are a ResultErr with op", async () => {
    mock = fetchMockCreate(() => fetchMockJson({}))
    const r = await coreEcho({ config: { baseUrl: "" } })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("coreEcho")
  })
})
