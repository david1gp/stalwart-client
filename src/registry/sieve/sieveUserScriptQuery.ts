import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import {
  sieveUserScriptQueryOptionsSchema,
  type SieveUserScriptQueryOptions,
} from "./sieveUserScriptQueryOptionsSchema.js"

/**
 * `x:SieveUserScript/query` — Defines a global Sieve script available for user imports. Contents are compiled on set; failures surface as invalidProperties on contents. Source: crates/jmap/src/registry/mapping/sieve.rs.
 */
export async function sieveUserScriptQuery(options: SieveUserScriptQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "sieveUserScriptQuery"
  const parsed = a.safeParse(sieveUserScriptQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryQuery({ ...parsed.output, objectType: "SieveUserScript" })
}
