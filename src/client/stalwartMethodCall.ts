import type { PromiseResult } from "#result"
import type { JmapClientConfig } from "../jmap/jmapClientConfigSchema.js"
import { jmapMethodCall } from "../jmap/jmapMethodCall.js"
import type { JmapMethodCallOptions } from "../jmap/jmapMethodCallOptions.js"
import { stalwartCapabilityResolver } from "./stalwartCapabilityResolver.js"

/** Single JMAP method call with the Stalwart resolver pre-wired. Method-level `error` → ResultErr. */
export async function stalwartMethodCall<T = unknown>(
  options: Omit<JmapMethodCallOptions, "config" | "capabilityResolvers"> & {
    config: JmapClientConfig
    capabilityResolvers?: JmapMethodCallOptions["capabilityResolvers"]
  },
): PromiseResult<T> {
  return jmapMethodCall<T>({
    ...options,
    capabilityResolvers: [stalwartCapabilityResolver, ...(options.capabilityResolvers ?? [])],
  })
}
