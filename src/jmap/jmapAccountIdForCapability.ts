import { createResult, createResultError, type Result } from "#result"
import { jmapAccountIdResolve } from "./jmapAccountIdResolve.js"
import type { JmapClientConfig } from "./jmapClientConfigSchema.js"
import type { JmapSession } from "./jmapSession.js"
import { jmapSessionGet } from "./jmapSessionGet.js"

/**
 * Resolve the accountId for a method in `capability`: explicit `accountId` wins,
 * then `config.accountId`, then `session.primaryAccounts[capability]` (fetching
 * the session when needed). Returns the session so callers can reuse it.
 * Servers such as Stalwart require `accountId` on most non-core methods.
 */
export async function jmapAccountIdForCapability(options: {
  config: JmapClientConfig
  capability: string
  accountId?: string
  session?: JmapSession
}): Promise<Result<{ accountId: string; session?: JmapSession }>> {
  const op = "jmapAccountIdForCapability"
  const { config, capability } = options
  if (options.accountId !== undefined) return createResult({ accountId: options.accountId, session: options.session })
  if (config.accountId !== undefined) return createResult({ accountId: config.accountId, session: options.session })
  let session = options.session
  if (session === undefined) {
    const sessionResult = await jmapSessionGet({ config })
    if (!sessionResult.success) return sessionResult
    session = sessionResult.data
  }
  const accountId = jmapAccountIdResolve({ config, session, capability })
  if (accountId === undefined) {
    return createResultError(
      op,
      `No accountId: pass accountId, set config.accountId, or use a session with a primary account for ${capability}`,
    )
  }
  return createResult({ accountId, session })
}
