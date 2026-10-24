import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import {
  sieveSystemScriptQueryOptionsSchema,
  type SieveSystemScriptQueryOptions,
} from "./sieveSystemScriptQueryOptionsSchema.js"

/**
 * `x:SieveSystemScript/query` — Defines a system Sieve script executed by the server. Contents are compiled on set; failures surface as invalidProperties on contents. Source: crates/jmap/src/registry/mapping/sieve.rs.
 */
export async function sieveSystemScriptQuery(options: SieveSystemScriptQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "sieveSystemScriptQuery"
  const parsed = a.safeParse(sieveSystemScriptQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryQuery({ ...parsed.output, objectType: "SieveSystemScript" })
}
