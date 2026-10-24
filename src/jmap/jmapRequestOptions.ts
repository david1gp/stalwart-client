import type { JmapClientConfig } from "./jmapClientConfigSchema.js"
import type { JmapCapabilityResolver } from "./jmapCapabilityResolver.js"
import type { JmapSession } from "./jmapSession.js"

/** One JMAP method invocation within a request batch. */
export type JmapCall = {
  methodName: string
  arguments: Record<string, unknown>
  callId?: string
}

/** Options for a raw batched JMAP request (`POST /jmap/`). */
export type JmapRequestOptions = {
  config: JmapClientConfig
  /** One or more calls; callIds default to `c1`, `c2`, … */
  calls: readonly JmapCall[]
  createdIds?: Record<string, string | number>
  capabilityResolvers?: readonly JmapCapabilityResolver[]
  /** Skip session prefetch when true (caller supplies `using` explicitly). */
  using?: readonly string[]
  session?: JmapSession
}
