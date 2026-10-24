import type { Result } from "#result"
import type { StalwartClientConfig } from "../client/stalwartClientConfigSchema.js"
import { jmapAccountIdForCapability } from "../jmap/jmapAccountIdForCapability.js"
import type { JmapSession } from "../jmap/jmapSession.js"

/** Resolve the accountId for `SieveScript/*` calls (primary account for `urn:ietf:params:jmap:sieve`). */
export function sieveScriptAccountIdResolve(options: {
  config: StalwartClientConfig
  accountId?: string
  session?: JmapSession
}): Promise<Result<{ accountId: string; session?: JmapSession }>> {
  return jmapAccountIdForCapability({ ...options, capability: "urn:ietf:params:jmap:sieve" })
}
