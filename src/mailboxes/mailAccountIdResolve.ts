import type { Result } from "#result"
import type { StalwartClientConfig } from "../client/stalwartClientConfigSchema.js"
import { jmapAccountIdForCapability } from "../jmap/jmapAccountIdForCapability.js"
import type { JmapSession } from "../jmap/jmapSession.js"

/**
 * Resolve the accountId for mail-context JMAP calls (defaults to the primary
 * account for `urn:ietf:params:jmap:mail`; pass `capability` for submission or
 * vacationresponse). Thin wrapper over the core `jmapAccountIdForCapability`.
 */
export function mailAccountIdResolve(options: {
  config: StalwartClientConfig
  accountId?: string
  capability?: string
  session?: JmapSession
}): Promise<Result<{ accountId: string; session?: JmapSession }>> {
  return jmapAccountIdForCapability({ ...options, capability: options.capability ?? "urn:ietf:params:jmap:mail" })
}
