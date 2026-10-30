import { afterEach, describe, expect, test } from "bun:test"
import { jmapAccountIdForCapability } from "../src/jmap/jmapAccountIdForCapability.js"
import { jmapAccountIdResolve } from "../src/jmap/jmapAccountIdResolve.js"
import { jmapApiUrlResolve } from "../src/jmap/jmapApiUrlResolve.js"
import { jmapMethodCapabilities, jmapMethodCall, jmapRequest, jmapSetErrorCheck } from "../src/index.js"
import { jmapCapabilities } from "../src/jmap/jmapCapabilities.js"
import { jmapMetadataUsing } from "../src/jmap/jmapMetadata.js"
import { stalwartCapabilityResolver, STALWART_CAPABILITY } from "../src/index.js"
import { jmapSessionCacheClear, jmapSessionCacheCreate } from "../src/index.js"
import { jmapSessionGet } from "../src/jmap/jmapSessionGet.js"
import { jmapClientConfig } from "../src/jmap/jmapClientConfig.js"
import { fetchMockCreate, fetchMockJson } from "./fetchMock.js"
import { jmapTestSessionCreate } from "./jmapTestSession.js"

const config = jmapClientConfig({ baseUrl: "https://mail.example.com", token: "API_x" })
if (!config.success) throw new Error("fixture config invalid")
const accountIdConfig = config.data

describe("jmapMethodCapabilities derives using arrays", () => {
  test("Core/echo needs only core", () => {
    const r = jmapMethodCapabilities("Core/echo")
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual(["urn:ietf:params:jmap:core"])
  })

  test("parse and availability methods add their method-level extension capabilities", () => {
    const availability = jmapMethodCapabilities("Principal/getAvailability")
    expect(availability.success && availability.data).toEqual([
      "urn:ietf:params:jmap:core",
      "urn:ietf:params:jmap:principals",
      "urn:ietf:params:jmap:principals:availability",
    ])
    const eventParse = jmapMethodCapabilities("CalendarEvent/parse")
    expect(eventParse.success && eventParse.data).toContain("urn:ietf:params:jmap:calendars:parse")
    const cardParse = jmapMethodCapabilities("ContactCard/parse")
    expect(cardParse.success && cardParse.data).toContain("urn:ietf:params:jmap:contacts:parse")
  })

  test("jmapMetadataUsing appends the metadata capability once", () => {
    expect(jmapCapabilities.metadata).toBe("urn:ietf:params:jmap:metadata")
    expect(jmapMetadataUsing(["urn:ietf:params:jmap:core", "urn:ietf:params:jmap:mail"])).toEqual([
      "urn:ietf:params:jmap:core",
      "urn:ietf:params:jmap:mail",
      "urn:ietf:params:jmap:metadata",
    ])
    expect(jmapMetadataUsing(["urn:ietf:params:jmap:core", "urn:ietf:params:jmap:metadata"])).toEqual([
      "urn:ietf:params:jmap:core",
      "urn:ietf:params:jmap:metadata",
    ])
    expect(jmapMetadataUsing()).toEqual(["urn:ietf:params:jmap:metadata"])
  })

  test("Email/get adds mail", () => {
    const r = jmapMethodCapabilities("Email/get")
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual(["urn:ietf:params:jmap:core", "urn:ietf:params:jmap:mail"])
  })

  test("Identity/get adds submission", () => {
    const r = jmapMethodCapabilities("Identity/get")
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data).toContain("urn:ietf:params:jmap:core")
      expect(r.data).toContain("urn:ietf:params:jmap:submission")
    }
  })

  test("SieveScript/validate adds sieve", () => {
    const r = jmapMethodCapabilities("SieveScript/validate")
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toContain("urn:ietf:params:jmap:sieve")
  })

  test("x:Domain/query fails without a resolver, succeeds with one", () => {
    const without = jmapMethodCapabilities("x:Domain/query")
    expect(without.success).toBe(false)
    const resolved = jmapMethodCapabilities("x:Domain/query", stalwartCapabilityResolver)
    expect(resolved.success).toBe(true)
    if (resolved.success) expect(resolved.data).toEqual(["urn:ietf:params:jmap:core", STALWART_CAPABILITY])
  })

  test("garbage methodName is a ResultErr, not a throw", () => {
    const r = jmapMethodCapabilities("nope")
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("jmapMethodCapabilities")
  })
})

describe("jmapAccountIdResolve precedence", () => {
  const session = jmapTestSessionCreate()
  test("explicit accountId wins", () => {
    expect(
      jmapAccountIdResolve({ accountId: "explicit", config: {}, session, capability: "urn:ietf:params:jmap:mail" }),
    ).toBe("explicit")
  })

  test("config default is second", () => {
    expect(
      jmapAccountIdResolve({
        config: { accountId: "cfg" },
        session,
        capability: "urn:ietf:params:jmap:mail",
      }),
    ).toBe("cfg")
  })

  test("falls back to session primaryAccounts", () => {
    expect(jmapAccountIdResolve({ config: {}, session, capability: STALWART_CAPABILITY })).toBe("a1")
  })

  test("undefined when nothing resolves", () => {
    expect(jmapAccountIdResolve({ config: {}, session, capability: "unknown:cap" })).toBeUndefined()
  })
})

describe("jmapApiUrlResolve joins session path onto config origin", () => {
  test("absolute apiUrl same origin", () => {
    expect(jmapApiUrlResolve(jmapTestSessionCreate(), "https://mail.example.com")).toBe(
      "https://mail.example.com/jmap/",
    )
  })

  test("cross-origin session apiUrl keeps config origin", () => {
    expect(jmapApiUrlResolve({ apiUrl: "https://mail.example.test/jmap/" }, "http://127.0.0.1:18080")).toBe(
      "http://127.0.0.1:18080/jmap/",
    )
  })
})

describe("jmapSessionGet caches per cache object", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("fetches once, caches; clear forces refetch", async () => {
    let calls = 0
    mock = fetchMockCreate(() => {
      calls++
      return fetchMockJson({
        capabilities: {},
        accounts: {},
        primaryAccounts: {},
        username: "u",
        apiUrl: "https://mail.example.com/jmap/",
        downloadUrl: "https://mail.example.com/jmap/download/{accountId}/{blobId}/{name}?accept={type}",
        uploadUrl: "https://mail.example.com/jmap/upload/{accountId}/",
        eventSourceUrl: "https://mail.example.com/jmap/eventsource/",
        state: "5",
      })
    })
    const cache = jmapSessionCacheCreate()
    const first = await jmapSessionGet({ config: config.data, cache })
    const second = await jmapSessionGet({ config: config.data, cache })
    expect(first.success).toBe(true)
    expect(second.success).toBe(true)
    expect(calls).toBe(1)
    jmapSessionCacheClear(cache)
    await jmapSessionGet({ config: config.data, cache })
    expect(calls).toBe(2)
  })

  test("invalid session body is a ResultErr with op", async () => {
    mock = fetchMockCreate(() => fetchMockJson({ nope: true }))
    const r = await jmapSessionGet({ config: config.data })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("jmapSessionGet")
  })
})

describe("jmapMethodCall maps method-level errors", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("success returns the method arguments", async () => {
    mock = fetchMockCreate((request) => {
      const url = new URL(request.url)
      if (url.pathname === "/jmap/session") return fetchMockJson(jmapTestSessionCreate())
      return fetchMockJson({
        methodResponses: [["Core/echo", { hello: true }, "c1"]],
        sessionState: "1",
      })
    })
    const r = await jmapMethodCall<{ hello: boolean }>({
      config: config.data,
      methodName: "Core/echo",
      arguments: { hello: true },
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual({ hello: true })
  })

  test("error response becomes ResultErr with type: description", async () => {
    mock = fetchMockCreate((request) => {
      const url = new URL(request.url)
      if (url.pathname === "/jmap/session") return fetchMockJson(jmapTestSessionCreate())
      return fetchMockJson({
        methodResponses: [["error", { type: "accountNotFound", description: "nope" }, "c1"]],
        sessionState: "1",
      })
    })
    const r = await jmapMethodCall({
      config: config.data,
      methodName: "Email/get",
      arguments: {},
    })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.op).toBe("jmapMethodCall")
      expect(r.errorMessage).toBe("accountNotFound: nope")
      expect(typeof r.errorData).toBe("string")
    }
  })

  test("batched jmapRequest derives using and returns both responses", async () => {
    const seen: string[] = []
    mock = fetchMockCreate((request) => {
      const url = new URL(request.url)
      if (url.pathname === "/jmap/session") return fetchMockJson(jmapTestSessionCreate())
      const body = JSON.parse(String(request.body)) as { using: string[] }
      seen.push(...body.using)
      return fetchMockJson({
        methodResponses: [
          ["Core/echo", { a: 1 }, "c1"],
          ["Core/echo", { b: 2 }, "c2"],
        ],
        sessionState: "1",
      })
    })
    const r = await jmapRequest({
      config: config.data,
      calls: [
        { methodName: "Core/echo", arguments: {} },
        { methodName: "Core/echo", arguments: {} },
      ],
    })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.length).toBe(2)
      expect(r.data[1]?.callId).toBe("c2")
    }
    expect(seen).toEqual(["urn:ietf:params:jmap:core"])
  })
})

describe("jmapSetErrorCheck surfaces partial failures", () => {
  test("clean response passes through", () => {
    const r = jmapSetErrorCheck("emailSet", { created: { a: { id: "1" } } })
    expect(r.success).toBe(true)
  })

  test("notCreated becomes a ResultErr with JSON errorData", () => {
    const r = jmapSetErrorCheck("emailSet", {
      notCreated: { c1: { type: "invalidProperties", description: "bad subject" } },
    })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.op).toBe("emailSet")
      expect(r.errorMessage).toContain("notCreated: c1 (invalidProperties: bad subject)")
      expect(typeof r.errorData).toBe("string")
    }
  })
})

describe("jmapAccountIdForCapability resolves the account for a capability", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("an explicit accountId wins without fetching the session", async () => {
    mock = fetchMockCreate(() => fetchMockJson(jmapTestSessionCreate()))
    const r = await jmapAccountIdForCapability({
      config: accountIdConfig,
      capability: "urn:ietf:params:jmap:mail",
      accountId: "x9",
    })
    expect(r.success && r.data.accountId).toBe("x9")
    expect(mock.requests).toHaveLength(0)
  })

  test("falls back to the session primary account and returns the session", async () => {
    mock = fetchMockCreate(() => fetchMockJson(jmapTestSessionCreate()))
    const session = jmapTestSessionCreate()
    const expected = session.primaryAccounts["urn:ietf:params:jmap:mail"]
    const r = await jmapAccountIdForCapability({ config: accountIdConfig, capability: "urn:ietf:params:jmap:mail" })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.accountId).toBe(expected as string)
      expect(r.data.session).toBeDefined()
    }
  })

  test("is a ResultErr when no account serves the capability", async () => {
    mock = fetchMockCreate(() => fetchMockJson(jmapTestSessionCreate()))
    const r = await jmapAccountIdForCapability({ config: accountIdConfig, capability: "urn:example:none" })
    expect(r.success).toBe(false)
  })
})
