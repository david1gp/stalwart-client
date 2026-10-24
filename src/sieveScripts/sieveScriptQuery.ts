import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import type { JmapQueryResponse } from "../jmap/jmapQueryResponse.js"
import { sieveScriptAccountIdResolve } from "./sieveScriptAccountIdResolve.js"
import { sieveScriptQueryOptionsSchema, type SieveScriptQueryOptions } from "./sieveScriptQueryOptionsSchema.js"

/**
 * `SieveScript/query` — list Sieve script ids (filter `name`/`isActive`,
 * `crates/jmap-proto/src/object/sieve.rs`).
 */
export async function sieveScriptQuery(options: SieveScriptQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "sieveScriptQuery"
  const parsed = a.safeParse(sieveScriptQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const resolved = await sieveScriptAccountIdResolve({
    config: parsed.output.config,
    accountId: parsed.output.accountId,
  })
  if (!resolved.success) return resolved
  return stalwartMethodCall<JmapQueryResponse>({
    config: parsed.output.config,
    session: resolved.data.session,
    methodName: "SieveScript/query",
    arguments: bodyOmitUndefined({
      accountId: resolved.data.accountId,
      filter: parsed.output.filter,
      sort: parsed.output.sort,
      position: parsed.output.position,
      limit: parsed.output.limit,
      calculateTotal: parsed.output.calculateTotal,
    }),
  })
}
