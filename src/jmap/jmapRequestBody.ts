import type { JmapInvocation } from "./jmapInvocation.js"

/** JMAP API request body: `{using, methodCalls, createdIds?}` (RFC 8620 §3.1). */
export type JmapRequest = {
  using: readonly string[]
  methodCalls: readonly JmapInvocation[]
  createdIds?: Record<string, string | number>
}
