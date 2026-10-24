import type { PromiseResult } from "#result"
import type { JmapClientConfig } from "../jmap/jmapClientConfigSchema.js"
import type { JmapMethodResponse } from "../jmap/jmapMethodResponse.js"
import { jmapRequest } from "../jmap/jmapRequest.js"
import type { JmapRequestOptions } from "../jmap/jmapRequestOptions.js"
import { stalwartCapabilityResolver } from "./stalwartCapabilityResolver.js"

/** Raw batched JMAP request with the Stalwart resolver pre-wired (for result-reference chains). */
export async function stalwartRequest(
  options: Omit<JmapRequestOptions, "config" | "capabilityResolvers"> & {
    config: JmapClientConfig
    capabilityResolvers?: JmapRequestOptions["capabilityResolvers"]
  },
): PromiseResult<readonly JmapMethodResponse[]> {
  return jmapRequest({
    ...options,
    capabilityResolvers: [stalwartCapabilityResolver, ...(options.capabilityResolvers ?? [])],
  })
}
