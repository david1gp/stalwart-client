import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import { acmeProviderQueryOptionsSchema, type AcmeProviderQueryOptions } from "./acmeProviderQueryOptionsSchema.js"

/**
 * `x:AcmeProvider/query` — list ACME provider for automatic TLS certificate management ids with an optional filter/sort/page.
 */
export async function acmeProviderQuery(options: AcmeProviderQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "acmeProviderQuery"
  const parsed = a.safeParse(acmeProviderQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryQuery({ ...parsed.output, objectType: "AcmeProvider" })
}
