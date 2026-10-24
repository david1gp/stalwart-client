import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import { type OauthClientQueryOptions, oauthClientQueryOptionsSchema } from "./oauthClientQueryOptionsSchema.js"

/**
 * `x:OAuthClient/query` — list directory OAuthClient ids with an optional filter/sort/page.
 */
export async function oauthClientQuery(options: OauthClientQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "oauthClientQuery"
  const parsed = a.safeParse(oauthClientQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...rest } = parsed.output
  return registryQuery({ config, objectType: "OAuthClient" as const, ...rest })
}
