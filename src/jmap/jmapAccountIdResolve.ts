import type { JmapClientConfig } from "./jmapClientConfigSchema.js"
import type { JmapSession } from "./jmapSession.js"

/**
 * Resolve the accountId for a JMAP call: explicit `accountId` wins, then the
 * client config default, then the session's primary account for `capability`.
 */
export function jmapAccountIdResolve(args: {
  accountId?: string
  config: Pick<JmapClientConfig, "accountId">
  session: Pick<JmapSession, "primaryAccounts">
  capability: string
}): string | undefined {
  if (args.accountId !== undefined) return args.accountId
  if (args.config.accountId !== undefined) return args.config.accountId
  return args.session.primaryAccounts[args.capability]
}
