import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import { type OauthGrantQueryOptions, oauthGrantQueryOptionsSchema } from "./oauthGrantQueryOptionsSchema.js"

/**
 * `x:OAuthGrant/query` — list OAuthGrant ids with an optional filter/sort/page.
 */
export async function oauthGrantQuery(options: OauthGrantQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "oauthGrantQuery"
  const parsed = a.safeParse(oauthGrantQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...rest } = parsed.output
  return registryQuery({ config, objectType: "OAuthGrant" as const, ...rest })
}
