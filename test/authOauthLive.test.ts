import { afterEach, describe, expect, test } from "bun:test"
import { stalwartClientConfig } from "../src/client/stalwartClientConfig.js"
import { liveDelivery } from "../src/live/liveDelivery.js"
import { liveDeliveryToken } from "../src/live/liveDeliveryToken.js"
import { liveMetrics } from "../src/live/liveMetrics.js"
import { liveMetricsToken } from "../src/live/liveMetricsToken.js"
import { liveTracing } from "../src/live/liveTracing.js"
import { liveTracingToken } from "../src/live/liveTracingToken.js"
import { fetchMockCreate, fetchMockJson } from "./fetchMock.js"

const authedResult = stalwartClientConfig({
  baseUrl: "https://mail.example.test",
  username: "admin@example.test",
  password: "secret",
})
if (!authedResult.success) throw new Error("fixture config invalid")
const config = authedResult.data

let mock: ReturnType<typeof fetchMockCreate> | undefined
afterEach(() => {
  mock?.restore()
  mock = undefined
})

function sseResponse(frames: string[]): Response {
  return new Response(frames.join(""), {
    status: 200,
    headers: { "Content-Type": "text/event-stream" },
  })
}

describe("Live token endpoints", () => {
  test("liveDeliveryToken returns the plain-text token", async () => {
    mock = fetchMockCreate((request) => {
      expect(new URL(request.url).pathname).toBe("/api/token/delivery")
      expect(request.headers["Authorization"]).toStartWith("Basic ")
      return new Response("delivery-token-1", { status: 200 })
    })
    const r = await liveDeliveryToken({ config })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toBe("delivery-token-1")
  })

  test("liveTracingToken requests the tracing token path", async () => {
    mock = fetchMockCreate((request) => {
      expect(new URL(request.url).pathname).toBe("/api/token/tracing")
      return new Response("tracing-token-1", { status: 200 })
    })
    const r = await liveTracingToken({ config })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toBe("tracing-token-1")
  })

  test("liveMetricsToken requests the metrics token path", async () => {
    mock = fetchMockCreate((request) => {
      expect(new URL(request.url).pathname).toBe("/api/token/metrics")
      return new Response("metrics-token-1", { status: 200 })
    })
    const r = await liveMetricsToken({ config })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toBe("metrics-token-1")
  })

  test("live token endpoints surface enterprise errors without retrying", async () => {
    mock = fetchMockCreate(() => fetchMockJson({ detail: "Enterprise feature" }, 404, "Not Found"))
    const r = await liveTracingToken({ config })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.errorData).toContain("Enterprise feature")
  })
})

describe("Live delivery stream", () => {
  test("liveDelivery collects typed stages until completed", async () => {
    mock = fetchMockCreate((request) => {
      const url = new URL(request.url)
      expect(url.pathname).toBe("/api/live/delivery/bob%40example.test")
      expect(request.headers["Authorization"]).toStartWith("Basic ")
      return sseResponse([
        'event: event\ndata: [{"type":"mxLookupStart","domain":"example.test"}]\n\n',
        'event: event\ndata: [{"type":"mxLookupError","reason":"no MX","elapsed":3}]\n\n',
        'event: event\ndata: [{"type":"completed"}]\n\n',
      ])
    })
    const r = await liveDelivery({ config, target: "bob@example.test" })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.map((stage) => stage.type)).toEqual(["mxLookupStart", "mxLookupError", "completed"])
      expect(r.data[0]).toEqual({ type: "mxLookupStart", domain: "example.test" })
    }
  })

  test("liveDelivery passes timeout and token as query params", async () => {
    mock = fetchMockCreate((request) => {
      const url = new URL(request.url)
      expect(url.searchParams.get("timeout")).toBe("10")
      expect(url.searchParams.get("token")).toBe("tok1")
      return sseResponse(['event: event\ndata: [{"type":"completed"}]\n\n'])
    })
    const r = await liveDelivery({ config, target: "example.test", timeout: 10, token: "tok1" })
    expect(r.success).toBe(true)
  })

  test("liveDelivery stops at maxEvents", async () => {
    mock = fetchMockCreate(() =>
      sseResponse([
        'event: event\ndata: [{"type":"mxLookupStart","domain":"x"}]\n\n',
        'event: event\ndata: [{"type":"mtaStsFetchStart"}]\n\n',
        'event: event\ndata: [{"type":"completed"}]\n\n',
      ]),
    )
    const r = await liveDelivery({ config, target: "x.test", maxEvents: 1 })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toHaveLength(1)
  })
})

describe("Live tracing and metrics streams", () => {
  test("liveTracing collects SSE frames up to the limit", async () => {
    mock = fetchMockCreate((request) => {
      expect(new URL(request.url).pathname).toBe("/api/live/tracing")
      return sseResponse(['event: event\ndata: {"kind":"trace"}\n\n', 'event: event\ndata: {"kind":"trace"}\n\n'])
    })
    const r = await liveTracing({ config, maxEvents: 2 })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data).toHaveLength(2)
      expect(r.data[0]?.data).toBe('{"kind":"trace"}')
    }
  })

  test("liveMetrics collects SSE frames up to the limit", async () => {
    mock = fetchMockCreate((request) => {
      expect(new URL(request.url).pathname).toBe("/api/live/metrics")
      return sseResponse(['event: event\ndata: {"kind":"metric"}\n\n'])
    })
    const r = await liveMetrics({ config, maxEvents: 1 })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toHaveLength(1)
  })

  test("invalid live options are a ResultErr with op", async () => {
    mock = fetchMockCreate(() => fetchMockJson({}))
    const r = await liveDelivery({ config: { baseUrl: "" }, target: "x.test" })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("liveDelivery")
  })
})
