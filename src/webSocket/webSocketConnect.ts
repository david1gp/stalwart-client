import * as a from "valibot"
import { createResult, createResultError, type PromiseResult, type Result } from "#result"
import { stalwartCapabilityResolver } from "../client/stalwartCapabilityResolver.js"
import { jmapAuthHeader } from "../jmap/jmapAuthHeader.js"
import { jmapMethodCapabilities } from "../jmap/jmapMethodCapabilities.js"
import { jmapSessionGet } from "../jmap/jmapSessionGet.js"
import { type JmapStateChange, jmapStateChangeSchema } from "../eventSource/jmapStateChangeSchema.js"
import type { JmapWebSocketClient } from "./jmapWebSocketClient.js"
import type { JmapWebSocketSend } from "./jmapWebSocketSend.js"
import type { JmapWebSocketSendResult } from "./jmapWebSocketSendResult.js"
import { type WebSocketConnectOptions, webSocketConnectOptionsSchema } from "./webSocketConnectOptionsSchema.js"

const webSocketCapabilitySchema = a.object({
  url: a.string(),
  supportsPush: a.optional(a.boolean()),
})

const webSocketInvocationSchema = a.tuple([a.string(), a.record(a.string(), a.unknown()), a.string()])

const webSocketResponseSchema = a.object({
  methodResponses: a.array(webSocketInvocationSchema),
  sessionState: a.union([a.string(), a.number()]),
  requestId: a.optional(a.string()),
})

const webSocketRequestErrorSchema = a.object({
  type: a.optional(a.string()),
  detail: a.optional(a.string()),
  status: a.optional(a.number()),
  requestId: a.optional(a.string()),
})

const WEBSOCKET_TIMEOUT_MS = 30_000

/**
 * `GET /jmap/ws` (RFC 8887): open a typed JMAP-over-WebSocket client.
 *
 * The URL comes from the session `urn:ietf:params:jmap:websocket` capability
 * (`crates/jmap-proto/src/request/capability.rs:415-425`), joined onto the
 * configured `baseUrl` origin like `jmapApiUrlResolve` (scheme `http(s)` →
 * `ws(s)`). Auth rides in the upgrade `Authorization` header — like the SSE
 * endpoint, `authenticate_headers` runs before the upgrade
 * (`crates/http/src/request.rs:219-226`, `crates/jmap/src/websocket/upgrade.rs:36-66`).
 *
 * Bun's `WebSocket` accepts `{protocols, headers}` as the second constructor
 * argument (verified on Bun v1.4.4: both the `jmap` subprotocol and the
 * `Authorization` header reach the server); the server does not require the
 * client to offer a subprotocol and always answers
 * `Sec-WebSocket-Protocol: jmap`
 * (`crates/http-proto/src/response.rs:253`).
 */
export async function webSocketConnect(options: WebSocketConnectOptions): PromiseResult<JmapWebSocketClient> {
  const op = "webSocketConnect"
  const parsed = a.safeParse(webSocketConnectOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config } = parsed.output

  const session = await jmapSessionGet({ config })
  if (!session.success) return session
  const capability = a.safeParse(webSocketCapabilitySchema, session.data.capabilities["urn:ietf:params:jmap:websocket"])
  if (!capability.success) {
    return createResultError(op, "The session has no urn:ietf:params:jmap:websocket capability")
  }

  let url: string
  try {
    const origin = new URL(config.baseUrl)
    const target = new URL(capability.output.url, origin)
    const scheme = origin.protocol === "https:" ? "wss:" : "ws:"
    url = `${scheme}//${origin.host}${target.pathname}${target.search}`
  } catch (error) {
    return createResultError(op, "Building the WebSocket URL failed", String(error))
  }

  let socket: WebSocket
  try {
    socket = new globalThis.WebSocket(url, {
      protocols: "jmap",
      headers: jmapAuthHeader(config),
    } as unknown as string)
  } catch (error) {
    return createResultError(op, "Creating the WebSocket failed", String(error))
  }

  const pending = new Map<
    string,
    {
      resolve: (result: Result<JmapWebSocketSendResult>) => void
      timeoutId: ReturnType<typeof setTimeout>
    }
  >()
  const listeners = new Set<(change: JmapStateChange) => void>()
  let requestCounter = 0
  let settled = false

  const failPending = (message: string) => {
    for (const [id, entry] of pending) {
      clearTimeout(entry.timeoutId)
      pending.delete(id)
      entry.resolve(createResultError(op, message))
    }
  }

  const notifyStateChange = (change: JmapStateChange) => {
    for (const listener of [...listeners]) {
      try {
        listener(change)
      } catch {
        continue
      }
    }
  }

  const dispatch = (raw: unknown) => {
    if (typeof raw !== "string") return
    let message: unknown
    try {
      message = JSON.parse(raw)
    } catch {
      return
    }
    if (typeof message !== "object" || message === null) return
    const type = (message as { "@type"?: unknown })["@type"]
    if (type === "Response") {
      const response = a.safeParse(webSocketResponseSchema, message)
      if (!response.success) return
      const requestId = response.output.requestId
      if (requestId === undefined) return
      const entry = pending.get(requestId)
      if (entry === undefined) return
      clearTimeout(entry.timeoutId)
      pending.delete(requestId)
      const [first] = response.output.methodResponses
      if (first !== undefined && first[0] === "error") {
        const args = first[1] as { type?: unknown; description?: unknown }
        const detail = typeof args.type === "string" ? args.type : "error"
        const suffix = typeof args.description === "string" ? `: ${args.description}` : ""
        entry.resolve(createResultError(op, `${detail}${suffix}`, JSON.stringify(first[1])))
        return
      }
      entry.resolve(
        createResult({
          methodResponses: response.output.methodResponses as JmapWebSocketSendResult["methodResponses"],
          sessionState: String(response.output.sessionState),
        }),
      )
      return
    }
    if (type === "StateChange") {
      const change = a.safeParse(jmapStateChangeSchema, message)
      if (!change.success) return
      notifyStateChange(change.output)
      return
    }
    if (type === "RequestError") {
      const failure = a.safeParse(webSocketRequestErrorSchema, message)
      if (!failure.success) return
      const requestId = failure.output.requestId
      const detail = failure.output.detail ?? failure.output.type ?? "RequestError"
      if (requestId === undefined) return
      const entry = pending.get(requestId)
      if (entry === undefined) return
      clearTimeout(entry.timeoutId)
      pending.delete(requestId)
      entry.resolve(createResultError(op, detail, JSON.stringify(message)))
    }
  }

  const opened = await new Promise<boolean>((resolve) => {
    const timeoutId = setTimeout(() => resolve(false), WEBSOCKET_TIMEOUT_MS)
    socket.addEventListener(
      "open",
      () => {
        clearTimeout(timeoutId)
        resolve(true)
      },
      { once: true },
    )
    socket.addEventListener(
      "error",
      () => {
        clearTimeout(timeoutId)
        resolve(false)
      },
      { once: true },
    )
  })
  if (!opened) {
    try {
      socket.close()
    } catch {
      // already closed
    }
    return createResultError(op, "Opening the WebSocket failed (auth, network or timeout)")
  }

  socket.addEventListener("message", (event) => {
    dispatch((event as MessageEvent).data)
  })
  socket.addEventListener("close", () => {
    if (settled) return
    settled = true
    failPending("The WebSocket closed")
  })
  socket.addEventListener("error", () => {
    if (settled) return
    settled = true
    failPending("The WebSocket errored")
  })

  const requireOpen = (opSend: string): Result<void> => {
    if (socket.readyState === globalThis.WebSocket.OPEN) return createResult(undefined)
    return createResultError(opSend, "The WebSocket is not open")
  }

  const client: JmapWebSocketClient = {
    send(request: JmapWebSocketSend) {
      const opSend = "webSocketConnect.send"
      if (request.methodName === "") {
        return Promise.resolve(createResultError(opSend, 'methodName must look like "Object/verb"'))
      }
      const open = requireOpen(opSend)
      if (!open.success) return Promise.resolve(createResultError(opSend, open.errorMessage))
      const using = jmapMethodCapabilities(request.methodName, stalwartCapabilityResolver)
      if (!using.success) return Promise.resolve(createResultError(opSend, using.errorMessage))
      requestCounter += 1
      const requestId = `w${requestCounter}`
      const timeoutMs = config.timeoutMs ?? WEBSOCKET_TIMEOUT_MS
      return new Promise<Result<JmapWebSocketSendResult>>((resolve) => {
        const timeoutId = setTimeout(() => {
          pending.delete(requestId)
          resolve(createResultError(opSend, `No response within ${timeoutMs} ms`))
        }, timeoutMs)
        pending.set(requestId, { resolve, timeoutId })
        try {
          socket.send(
            JSON.stringify({
              "@type": "Request",
              id: requestId,
              using: using.data,
              methodCalls: [[request.methodName, request.arguments ?? {}, request.callId ?? "c1"]],
            }),
          )
        } catch (error) {
          clearTimeout(timeoutId)
          pending.delete(requestId)
          resolve(createResultError(opSend, "Sending the request failed", String(error)))
        }
      })
    },
    pushEnable(dataTypes?: string[]) {
      const open = requireOpen(op)
      if (!open.success) return open
      try {
        socket.send(JSON.stringify({ "@type": "WebSocketPushEnable", dataTypes: dataTypes ?? [] }))
      } catch (error) {
        return createResultError(op, "Sending WebSocketPushEnable failed", String(error))
      }
      return createResult(undefined)
    },
    pushDisable() {
      const open = requireOpen(op)
      if (!open.success) return open
      try {
        socket.send(JSON.stringify({ "@type": "WebSocketPushDisable" }))
      } catch (error) {
        return createResultError(op, "Sending WebSocketPushDisable failed", String(error))
      }
      return createResult(undefined)
    },
    onStateChange(listener: (change: JmapStateChange) => void) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    close() {
      settled = true
      failPending("The WebSocket closed")
      try {
        socket.close()
      } catch {
        // already closed
      }
    },
  }

  return createResult(client)
}
