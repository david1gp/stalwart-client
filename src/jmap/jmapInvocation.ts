/** A JMAP invocation triple: `[methodName, arguments, callId]` (RFC 8620 §3.1). */
export type JmapInvocation = {
  methodName: string
  arguments: Record<string, unknown>
  callId: string
}
