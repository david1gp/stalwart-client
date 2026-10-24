import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import type { JmapClientConfig } from "./jmapClientConfigSchema.js"
import { jmapHttpRequest } from "./jmapHttpRequest.js"
import { jmapPaths } from "./jmapPaths.js"
import type { JmapSession } from "./jmapSession.js"
import type { JmapSessionCache } from "./jmapSessionCache.js"

const jmapSessionAccountSchema = a.object({
  name: a.string(),
  isPersonal: a.boolean(),
  isReadOnly: a.boolean(),
  accountCapabilities: a.record(a.string(), a.unknown()),
})

const jmapSessionResponseSchema = a.object({
  capabilities: a.record(a.string(), a.unknown()),
  accounts: a.record(a.string(), jmapSessionAccountSchema),
  primaryAccounts: a.record(a.string(), a.string()),
  username: a.string(),
  apiUrl: a.string(),
  downloadUrl: a.string(),
  uploadUrl: a.string(),
  eventSourceUrl: a.string(),
  state: a.union([a.string(), a.number()]),
})

/**
 * `GET /jmap/session` — fetch the JMAP Session (RFC 8620 §2).
 * Uses the session cache when populated; call `jmapSessionCacheClear` to force a refetch.
 */
export async function jmapSessionGet(options: {
  config: JmapClientConfig
  cache?: JmapSessionCache
}): PromiseResult<JmapSession> {
  const op = "jmapSessionGet"
  const { config, cache } = options
  if (cache?.session !== undefined) return createResult(cache.session)
  const raw = await jmapHttpRequest<unknown>({
    config,
    method: "GET",
    path: jmapPaths.session,
  })
  if (!raw.success) return raw
  const parsed = a.safeParse(jmapSessionResponseSchema, raw.data)
  if (!parsed.success) {
    return createResultError(op, `Invalid JMAP session: ${a.summarize(parsed.issues)}`, JSON.stringify(raw.data))
  }
  const p = parsed.output
  const session: JmapSession = {
    capabilities: p.capabilities,
    accounts: Object.fromEntries(
      Object.entries(p.accounts).map(([id, account]) => [
        id,
        {
          name: account.name,
          isPersonal: account.isPersonal,
          isReadOnly: account.isReadOnly,
          accountCapabilities: account.accountCapabilities,
        },
      ]),
    ),
    primaryAccounts: p.primaryAccounts,
    username: p.username,
    apiUrl: p.apiUrl,
    downloadUrl: p.downloadUrl,
    uploadUrl: p.uploadUrl,
    eventSourceUrl: p.eventSourceUrl,
    state: String(p.state),
  }
  if (cache !== undefined) cache.session = session
  return createResult(session)
}
