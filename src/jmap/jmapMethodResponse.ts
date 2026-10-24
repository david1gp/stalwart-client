/** One JMAP method response triple: `[methodName, arguments, callId]` (RFC 8620 §3.4). */
export type JmapMethodResponse = {
  methodName: string
  arguments: Record<string, unknown>
  callId: string
}
