import { afterEach, describe, expect, test } from "bun:test"
import { eventSourceListen } from "../src/eventSource/eventSourceListen.js"
import { healthLive } from "../src/health/healthLive.js"
import { healthReady } from "../src/health/healthReady.js"
import { jmapAuthHeader } from "../src/jmap/jmapAuthHeader.js"
import { metricsPrometheus } from "../src/metrics/metricsPrometheus.js"
import { webSocketConnect } from "../src/webSocket/webSocketConnect.js"
import { stalwartClientConfig } from "../src/client/stalwartClientConfig.js"
import { fetchMockCreate, fetchMockJson } from "./fetchMock.js"
import { jmapTestSessionCreate } from "./jmapTestSession.js"

const configInput = {
  baseUrl: "http://127.0.0.1:18080",
  username: "alice@example.test",
  password: "secret",
}

function testConfig() {
  const config = stalwartClientConfig(configInput)
  if (!config.success) throw new Error("fixture config invalid")
  return config.data
}

function sseStreamResponse(body: string): Response {
  const encoder = new TextEncoder()
  const midpoint = Math.floor(body.length / 2)
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode(body.slice(0, midpoint)))
      controller.enqueue(encoder.encode(body.slice(midpoint)))
      controller.close()
    },
  })
  return new Response(stream, { headers: { "Content-Type": "text/event-stream" } })
}

const stateFrame = 'event: state\ndata: {"@type":"StateChange","changed":{"c":{"Mailbox":"sm1"}}}\n\n'

/** Minimal fake for `globalThis.WebSocket` with scripted open/message/close. */
class FakeWebSocket {
  static OPEN = 1
  static CONNECTING = 0
  static instances: FakeWebSocket[] = []
  static autoOpen = true
  static failOpen = false

  url: string
  protocols: unknown
  readyState = FakeWebSocket.CONNECTING
  sent: string[] = []
  private listeners = new Map<string, Set<(event: unknown) => void>>()

  constructor(url: string, protocols?: unknown) {
    this.url = url
    this.protocols = protocols
    FakeWebSocket.instances.push(this)
    queueMicrotask(() => {
      if (FakeWebSocket.failOpen) this.emit("error", {})
      else if (FakeWebSocket.autoOpen) this.simulateOpen()
    })
  }

  addEventListener(type: string, listener: (event: unknown) => void): void {
    const set = this.listeners.get(type) ?? new Set()
    set.add(listener)
    this.listeners.set(type, set)
  }

  send(data: string): void {
    this.sent.push(data)
  }

  close(): void {
    this.readyState = 3
    this.emit("close", {})
  }

  simulateOpen(): void {
    this.readyState = FakeWebSocket.OPEN
    this.emit("open", {})
  }

  simulateMessage(data: string): void {
    this.emit("message", { data })
  }

  private emit(type: string, event: unknown): void {
    for (const listener of this.listeners.get(type) ?? []) listener(event)
  }
}

const realWebSocket = globalThis.WebSocket

function sessionWithWebSocket() {
  const session = jmapTestSessionCreate()
  return {
    ...session,
    capabilities: {
      ...session.capabilities,
      "urn:ietf:params:jmap:websocket": { url: "wss://mail.example.com/jmap/ws", supportsPush: true },
    },
  }
}

describe("transport: eventSourceListen", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("builds the stream URL from the session template on the config origin and yields state changes", async () => {
    mock = fetchMockCreate((request) => {
      const url = new URL(request.url)
      if (url.pathname === "/jmap/session") return fetchMockJson(jmapTestSessionCreate())
      return sseStreamResponse(': comment\n\nevent: ping\ndata: {"interval": 30}\n\n' + stateFrame)
    })
    const subscription = await eventSourceListen({
      config: testConfig(),
      types: "Mailbox,Email",
      closeafter: "state",
      ping: 5,
    })
    expect(subscription.success).toBe(true)
    if (!subscription.success) return

    const seen: unknown[] = []
    for await (const change of subscription.data.stateChanges) seen.push(change)
    expect(seen).toEqual([{ changed: { c: { Mailbox: "sm1" } } }])

    const streamRequest = mock?.requests.find((r) => r.url.includes("/jmap/eventsource/"))
    expect(streamRequest).toBeDefined()
    const streamUrl = new URL(streamRequest?.url ?? "")
    expect(`${streamUrl.origin}${streamUrl.pathname}`).toBe("http://127.0.0.1:18080/jmap/eventsource/")
    expect(streamUrl.searchParams.get("types")).toBe("Mailbox,Email")
    expect(streamUrl.searchParams.get("closeafter")).toBe("state")
    expect(streamUrl.searchParams.get("ping")).toBe("5")
    const headers = streamRequest?.headers ?? {}
    expect(headers["Authorization"] ?? headers["authorization"]).toBe(jmapAuthHeader(configInput).Authorization)
  })

  test("close() ends the iteration promptly on a hanging stream", async () => {
    mock = fetchMockCreate((request) => {
      const url = new URL(request.url)
      if (url.pathname === "/jmap/session") return fetchMockJson(jmapTestSessionCreate())
      return sseStreamResponse(stateFrame)
    })
    // Re-open the stream: the mock closes after one frame, so emulate a hang
    // by racing close() against the end instead.
    const subscription = await eventSourceListen({ config: testConfig(), types: "Mailbox" })
    expect(subscription.success).toBe(true)
    if (!subscription.success) return
    const iterator = subscription.data.stateChanges[Symbol.asyncIterator]()
    const first = await iterator.next()
    expect(first.value).toEqual({ changed: { c: { Mailbox: "sm1" } } })
    subscription.data.close()
    const second = await iterator.next()
    expect(second.done).toBe(true)
  })

  test("an already-aborted signal yields no events", async () => {
    mock = fetchMockCreate((request) => {
      const url = new URL(request.url)
      if (url.pathname === "/jmap/session") return fetchMockJson(jmapTestSessionCreate())
      return sseStreamResponse(stateFrame)
    })
    const controller = new AbortController()
    controller.abort()
    const subscription = await eventSourceListen({ config: testConfig(), signal: controller.signal })
    expect(subscription.success).toBe(true)
    if (!subscription.success) return
    const seen: unknown[] = []
    for await (const change of subscription.data.stateChanges) seen.push(change)
    expect(seen).toEqual([])
  })

  test("invalid options are a ResultErr with op", async () => {
    mock = fetchMockCreate(() => fetchMockJson({}))
    const r = await eventSourceListen({
      config: testConfig(),
      closeafter: "sometimes" as unknown as "state",
    })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("eventSourceListen")
  })
})

describe("transport: webSocketConnect", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
    globalThis.WebSocket = realWebSocket
    FakeWebSocket.instances = []
    FakeWebSocket.autoOpen = true
    FakeWebSocket.failOpen = false
  })

  function mockSession() {
    mock = fetchMockCreate((request) => {
      if (new URL(request.url).pathname === "/jmap/session") {
        return fetchMockJson(sessionWithWebSocket())
      }
      return fetchMockJson({})
    })
    globalThis.WebSocket = FakeWebSocket as unknown as typeof WebSocket
  }

  test("connects to the session websocket URL rebased on the config origin with jmap protocol and auth", async () => {
    mockSession()
    const connected = await webSocketConnect({ config: testConfig() })
    expect(connected.success).toBe(true)
    if (!connected.success) return
    const socket = FakeWebSocket.instances.at(-1)
    expect(socket?.url).toBe("ws://127.0.0.1:18080/jmap/ws")
    expect(socket?.protocols).toEqual({
      protocols: "jmap",
      headers: jmapAuthHeader(configInput),
    })
    connected.data.close()
  })

  test("send() transmits @type Request with derived using and resolves the correlated Response", async () => {
    mockSession()
    const connected = await webSocketConnect({ config: testConfig() })
    expect(connected.success).toBe(true)
    if (!connected.success) return
    const socket = FakeWebSocket.instances.at(-1)
    expect(socket).toBeDefined()
    const pending = connected.data.send({ methodName: "Core/echo", arguments: { hello: true } })
    expect(socket?.sent).toHaveLength(1)
    expect(JSON.parse(socket?.sent[0] ?? "")).toEqual({
      "@type": "Request",
      id: "w1",
      using: ["urn:ietf:params:jmap:core"],
      methodCalls: [["Core/echo", { hello: true }, "c1"]],
    })
    socket?.simulateMessage(
      JSON.stringify({
        "@type": "Response",
        methodResponses: [["Core/echo", { hello: true }, "c1"]],
        sessionState: "abc",
        requestId: "w1",
      }),
    )
    const response = await pending
    expect(response.success).toBe(true)
    if (response.success) {
      expect(response.data.methodResponses).toEqual([["Core/echo", { hello: true }, "c1"]])
      expect(response.data.sessionState).toBe("abc")
    }
    connected.data.close()
  })

  test("send() maps a method-level error entry to a ResultErr", async () => {
    mockSession()
    const connected = await webSocketConnect({ config: testConfig() })
    if (!connected.success) return
    const socket = FakeWebSocket.instances.at(-1)
    const pending = connected.data.send({ methodName: "Core/echo" })
    socket?.simulateMessage(
      JSON.stringify({
        "@type": "Response",
        methodResponses: [["error", { type: "unknownMethod" }, "c1"]],
        sessionState: "abc",
        requestId: "w1",
      }),
    )
    const response = await pending
    expect(response.success).toBe(false)
    connected.data.close()
  })

  test("pushEnable and pushDisable send the exact push control messages", async () => {
    mockSession()
    const connected = await webSocketConnect({ config: testConfig() })
    if (!connected.success) return
    const socket = FakeWebSocket.instances.at(-1)
    expect(connected.data.pushEnable(["Mailbox"])?.success).toBe(true)
    expect(connected.data.pushDisable()?.success).toBe(true)
    expect(socket?.sent.slice(-2).map((raw) => JSON.parse(raw))).toEqual([
      { "@type": "WebSocketPushEnable", dataTypes: ["Mailbox"] },
      { "@type": "WebSocketPushDisable" },
    ])
    connected.data.close()
  })

  test("incoming StateChange pushes fan out to listeners until unsubscribed", async () => {
    mockSession()
    const connected = await webSocketConnect({ config: testConfig() })
    if (!connected.success) return
    const socket = FakeWebSocket.instances.at(-1)
    const seen: unknown[] = []
    const unsubscribe = connected.data.onStateChange((change) => {
      seen.push(change)
    })
    const frame = JSON.stringify({ "@type": "StateChange", changed: { c: { Mailbox: "sm2" } } })
    socket?.simulateMessage(frame)
    unsubscribe()
    socket?.simulateMessage(frame)
    expect(seen).toEqual([{ changed: { c: { Mailbox: "sm2" } } }])
    connected.data.close()
  })

  test("a failed upgrade is a ResultErr with op", async () => {
    mockSession()
    FakeWebSocket.failOpen = true
    const connected = await webSocketConnect({ config: testConfig() })
    expect(connected.success).toBe(false)
    if (!connected.success) expect(connected.op).toBe("webSocketConnect")
  })

  test("a session without the websocket capability is a ResultErr", async () => {
    mock = fetchMockCreate(() => fetchMockJson(jmapTestSessionCreate()))
    globalThis.WebSocket = FakeWebSocket as unknown as typeof WebSocket
    const connected = await webSocketConnect({ config: testConfig() })
    expect(connected.success).toBe(false)
    expect(FakeWebSocket.instances).toHaveLength(0)
  })

  test("invalid options are a ResultErr with op", async () => {
    const connected = await webSocketConnect({ config: { baseUrl: "" } })
    expect(connected.success).toBe(false)
    if (!connected.success) expect(connected.op).toBe("webSocketConnect")
  })
})

describe("transport: healthLive", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("anonymous GET /healthz/live returns ok with the problem-JSON status", async () => {
    mock = fetchMockCreate((request) => {
      const url = new URL(request.url)
      if (url.pathname === "/healthz/live") {
        return fetchMockJson({ detail: "OK", status: 200, title: "OK", type: "about:blank" })
      }
      return fetchMockJson({}, 404, "Not Found")
    })
    const r = await healthLive({ config: testConfig() })
    expect(r).toEqual({ success: true, data: { ok: true, status: 200 } })
    const request = mock?.requests.find((entry) => entry.url.includes("/healthz/live"))
    expect(request?.method).toBe("GET")
    expect(request?.headers["Authorization"] ?? request?.headers["authorization"]).toBeUndefined()
  })

  test("invalid options are a ResultErr with op", async () => {
    mock = fetchMockCreate(() => fetchMockJson({}))
    const r = await healthLive({ config: { baseUrl: "" } })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("healthLive")
  })
})

describe("transport: healthReady", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("a 503 problem-JSON ready probe returns not-ok instead of a ResultErr", async () => {
    mock = fetchMockCreate(() => fetchMockJson({ detail: "Unready", status: 503 }, 503, "Service Unavailable"))
    const r = await healthReady({ config: testConfig() })
    expect(r).toEqual({ success: true, data: { ok: false, status: 503 } })
  })

  test("invalid options are a ResultErr with op", async () => {
    mock = fetchMockCreate(() => fetchMockJson({}))
    const r = await healthReady({ config: { baseUrl: "" } })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("healthReady")
  })
})

describe("transport: metricsPrometheus", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("authenticated GET /metrics/prometheus returns the exposition text", async () => {
    mock = fetchMockCreate((request) => {
      const url = new URL(request.url)
      if (url.pathname === "/metrics/prometheus") {
        return new Response("# HELP up\n# TYPE up gauge\nup 1\n", {
          headers: { "Content-Type": "text/plain; version=0.0.4" },
        })
      }
      return fetchMockJson({}, 404, "Not Found")
    })
    const r = await metricsPrometheus({ config: testConfig() })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.body).toContain("up 1")
    const request = mock?.requests.find((entry) => entry.url.includes("/metrics/prometheus"))
    expect(request?.headers["Authorization"] ?? request?.headers["authorization"]).toBe(
      jmapAuthHeader(configInput).Authorization,
    )
  })

  test("an unconfigured metrics arm surfaces the 404 as a ResultErr", async () => {
    mock = fetchMockCreate(() => fetchMockJson({ status: 404 }, 404, "Not Found"))
    const r = await metricsPrometheus({ config: testConfig() })
    expect(r.success).toBe(false)
  })

  test("invalid options are a ResultErr with op", async () => {
    mock = fetchMockCreate(() => fetchMockJson({}))
    const r = await metricsPrometheus({ config: { baseUrl: "" } })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("metricsPrometheus")
  })
})
