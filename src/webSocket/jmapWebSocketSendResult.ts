/**
 * Decoded answer to one `send()` (`@type: Response`,
 * `crates/jmap-proto/src/request/websocket.rs:28-47`): the server's
 * `methodResponses` plus the hex `sessionState`. A method-level
 * `["error", …]` entry is mapped to a `ResultErr` by `send()` itself.
 */
export type JmapWebSocketSendResult = {
  methodResponses: readonly (readonly [string, Record<string, unknown>, string])[]
  sessionState: string
}
