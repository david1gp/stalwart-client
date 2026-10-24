import { afterEach, describe, expect, test } from "bun:test"
import { jmapHttpRequest } from "../src/jmap/jmapHttpRequest.js"
import { jmapHttpRequestQueryString } from "../src/jmap/jmapHttpRequestQueryString.js"
import { jmapHttpRequestUrl } from "../src/jmap/jmapHttpRequestUrl.js"
import { jmapClientConfig } from "../src/jmap/jmapClientConfig.js"
import { fetchMockCreate, fetchMockJson } from "./fetchMock.js"

const config = jmapClientConfig({ baseUrl: "https://mail.example.com", token: "API_x" })
if (!config.success) throw new Error("fixture config invalid")

describe("jmapHttpRequestQueryString / jmapHttpRequestUrl build exact URLs", () => {
  test("builds query and skips null/undefined", () => {
    expect(jmapHttpRequestQueryString({ a: 1, b: true, c: "x", d: null, e: undefined })).toBe("?a=1&b=true&c=x")
  })

  test("repeats array items", () => {
    expect(jmapHttpRequestQueryString({ tag: ["a", "b"] })).toBe("?tag=a&tag=b")
  })

  test("empty query", () => {
    expect(jmapHttpRequestQueryString()).toBe("")
    expect(jmapHttpRequestQueryString({})).toBe("")
  })

  test("joins base + path + query", () => {
    expect(jmapHttpRequestUrl("https://mail.example.com", "/jmap/session", { limit: 10 })).toBe(
      "https://mail.example.com/jmap/session?limit=10",
    )
  })
})

describe("jmapHttpRequest fetch sends Bearer and parses JSON", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("success json path with URL and Bearer header", async () => {
    mock = fetchMockCreate(() => fetchMockJson({ hello: true }))
    const r = await jmapHttpRequest({ config: config.data, method: "GET", path: "/jmap/session" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual({ hello: true })

    expect(mock.requests.length).toBe(1)
    const first = mock.requests[0]
    expect(first).toBeDefined()
    if (first === undefined) return
    expect(first.url).toBe("https://mail.example.com/jmap/session")
    expect(first.method).toBe("GET")
    expect(first.headers.Authorization).toBe("Bearer API_x")
  })

  test("respects auth:false (anonymous endpoints)", async () => {
    mock = fetchMockCreate(() => fetchMockJson({}))
    await jmapHttpRequest({ config: config.data, method: "GET", path: "/.well-known/jmap", auth: false })
    const first = mock.requests[0]
    expect(first).toBeDefined()
    if (first === undefined) return
    expect(first.headers.Authorization).toBeUndefined()
  })

  test("sends raw bytes with explicit content type", async () => {
    let seenContentType: string | undefined
    let seenBytes = 0
    mock = fetchMockCreate((request) => {
      seenContentType = request.headers["Content-Type"]
      const body = request.body
      seenBytes = body instanceof Uint8Array ? body.length : -1
      return fetchMockJson({ accountId: "a1", blobId: "b1", type: "message/rfc822", size: 5 })
    })
    const r = await jmapHttpRequest({
      config: config.data,
      method: "POST",
      path: "/jmap/upload/a1/",
      body: { kind: "raw", value: new Uint8Array([1, 2, 3, 4, 5]), contentType: "message/rfc822" },
    })
    expect(r.success).toBe(true)
    expect(seenContentType).toBe("message/rfc822")
    expect(seenBytes).toBe(5)
  })

  test("sends form bodies urlencoded", async () => {
    let seenContentType: string | undefined
    let seenBody: unknown
    mock = fetchMockCreate((request) => {
      seenContentType = request.headers["Content-Type"]
      seenBody = request.body
      return fetchMockJson({})
    })
    await jmapHttpRequest({
      config: config.data,
      method: "POST",
      path: "/auth/token",
      auth: false,
      body: { kind: "form", value: { grant_type: "password" } },
    })
    expect(seenContentType).toBe("application/x-www-form-urlencoded")
    expect(seenBody).toBe("grant_type=password")
  })

  test("returns a ResultErr for a circular body instead of rejecting", async () => {
    mock = fetchMockCreate(() => fetchMockJson({}))
    const body: Record<string, unknown> = {}
    body.self = body
    const r = await jmapHttpRequest({
      config: config.data,
      method: "POST",
      path: "/jmap/",
      body: { kind: "json", value: body },
    })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("jmapHttpRequest")
  })

  test("4xx is not retried", async () => {
    let attempts = 0
    mock = fetchMockCreate(() => {
      attempts++
      return new Response("nope", { status: 400, statusText: "Bad Request" })
    })
    const retryConfig = jmapClientConfig({ baseUrl: "https://mail.example.com", retries: 3 })
    if (!retryConfig.success) return
    const r = await jmapHttpRequest({ config: retryConfig.data, method: "GET", path: "/jmap/session" })
    expect(r.success).toBe(false)
    expect(attempts).toBe(1)
  })

  test("5xx is retried", async () => {
    let attempts = 0
    mock = fetchMockCreate(() => {
      attempts++
      if (attempts < 3) return new Response("err", { status: 503, statusText: "Unavailable" })
      return fetchMockJson({ ok: 1 })
    })
    const retryConfig = jmapClientConfig({ baseUrl: "https://mail.example.com", retries: 2 })
    if (!retryConfig.success) return
    const r = await jmapHttpRequest({ config: retryConfig.data, method: "GET", path: "/jmap/session" })
    expect(r.success).toBe(true)
    expect(attempts).toBe(3)
  })

  test("void / 204", async () => {
    mock = fetchMockCreate(() => new Response(null, { status: 204 }))
    const r = await jmapHttpRequest({ config: config.data, method: "DELETE", path: "/x", responseType: "void" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toBeUndefined()
  })

  test("text response", async () => {
    mock = fetchMockCreate(() => new Response("token-abc", { status: 200 }))
    const r = await jmapHttpRequest({ config: config.data, method: "GET", path: "/api/token/x", responseType: "text" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toBe("token-abc")
  })

  test("bytes response", async () => {
    mock = fetchMockCreate(() => new Response(new Uint8Array([7, 8]), { status: 200 }))
    const r = await jmapHttpRequest({ config: config.data, method: "GET", path: "/dl", responseType: "bytes" })
    expect(r.success).toBe(true)
    if (r.success) expect([...r.data]).toEqual([7, 8])
  })

  test("invalid JSON is a ResultErr with op", async () => {
    mock = fetchMockCreate(() => new Response("{nope", { status: 200 }))
    const r = await jmapHttpRequest({ config: config.data, method: "GET", path: "/jmap/session" })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("jmapHttpRequest")
  })
})

describe("jmapHttpRequest redirect mode observes 3xx without following", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("returns status and Location for a 307", async () => {
    mock = fetchMockCreate(() => new Response(null, { status: 307, headers: { location: "/jmap/session" } }))
    const r = await jmapHttpRequest({
      config: config.data,
      method: "GET",
      path: "/.well-known/jmap",
      responseType: "redirect",
    })
    expect(r).toEqual({ success: true, data: { status: 307, location: "/jmap/session" } })
  })

  test("a 2xx where a redirect was expected is a ResultErr", async () => {
    mock = fetchMockCreate(() => fetchMockJson({}))
    const r = await jmapHttpRequest({ config: config.data, method: "GET", path: "/x", responseType: "redirect" })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.errorMessage).toContain("Expected a redirect")
  })
})
