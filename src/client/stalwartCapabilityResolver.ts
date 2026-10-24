import type { JmapCapabilityResolver } from "../jmap/jmapCapabilityResolver.js"

/** Stalwart management capability: every `x:*` registry method requires it. */
export const STALWART_CAPABILITY = "urn:stalwart:jmap"

/**
 * Stalwart-layer capability resolver: maps `x:<ObjectType>/get|set|query`
 * management methods to `urn:stalwart:jmap`. Pass it to `jmapRequest`,
 * `jmapMethodCall`, or `stalwartRequest`/`stalwartMethodCall`.
 */
export const stalwartCapabilityResolver: JmapCapabilityResolver = (methodName) => {
  if (methodName.startsWith("x:")) return [STALWART_CAPABILITY]
  return undefined
}
