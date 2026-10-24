import type { JmapCapabilityResolver } from "./jmapCapabilityResolver.js"
import type { JmapClientConfig } from "./jmapClientConfigSchema.js"
import type { JmapSession } from "./jmapSession.js"

/** Options for a single JMAP method call. */
export type JmapMethodCallOptions = {
  config: JmapClientConfig
  methodName: string
  arguments: Record<string, unknown>
  callId?: string
  capabilityResolvers?: readonly JmapCapabilityResolver[]
  using?: readonly string[]
  session?: JmapSession
}
