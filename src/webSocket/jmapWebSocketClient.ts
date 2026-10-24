import type { Result } from "#result"
import type { JmapStateChange } from "../eventSource/jmapStateChangeSchema.js"
import type { JmapWebSocketSend } from "./jmapWebSocketSend.js"
import type { JmapWebSocketSendResult } from "./jmapWebSocketSendResult.js"

/**
 * Minimal typed RFC 8887 client from `webSocketConnect`. `send()` correlates
 * one `@type: Request` with its `@type: Response` via `requestId`
 * (`crates/jmap-proto/src/request/websocket.rs:228-245`); server pushes
 * (`@type: StateChange`, `crates/jmap/src/websocket/stream.rs:188-215`)
 * fan out to every `onStateChange` listener.
 */
export type JmapWebSocketClient = {
  send: (request: JmapWebSocketSend) => Promise<Result<JmapWebSocketSendResult>>
  /** Enable pushes (`WebSocketPushEnable`; empty `dataTypes` subscribes to all). */
  pushEnable: (dataTypes?: string[]) => Result<void>
  /** Disable pushes (`WebSocketPushDisable`). */
  pushDisable: () => Result<void>
  /** Subscribe to `StateChange` pushes; returns an unsubscribe function. */
  onStateChange: (listener: (change: JmapStateChange) => void) => () => void
  close: () => void
}
