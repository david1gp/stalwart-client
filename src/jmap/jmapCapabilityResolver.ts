/**
 * Resolve extra `using` capabilities for `methodName` (or return undefined
 * when the method is not handled). Server layers (e.g. Stalwart's `x:*`
 * registry methods) pass a resolver so the generic core stays server-agnostic.
 */
export type JmapCapabilityResolver = (methodName: string) => readonly string[] | undefined
