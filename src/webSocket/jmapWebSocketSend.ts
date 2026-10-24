/**
 * One JMAP call over an open WebSocket (`@type: Request`,
 * `crates/jmap-proto/src/request/websocket.rs:22-26,106-124`): the remaining
 * keys beside `@type`/`id` are the standard `Request` fields
 * (`using`, `methodCalls`, `createdIds`).
 */
export type JmapWebSocketSend = {
  methodName: string
  arguments?: Record<string, unknown>
  callId?: string
}
