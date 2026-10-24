import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import { mtaMilterQueryOptionsSchema, type MtaMilterQueryOptions } from "./mtaMilterQueryOptionsSchema.js"

/**
 * `x:MtaMilter/query` — list Milter filter endpoint for message processing ids with an optional filter/sort/page.
 */
export async function mtaMilterQuery(options: MtaMilterQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "mtaMilterQuery"
  const parsed = a.safeParse(mtaMilterQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryQuery({ ...parsed.output, objectType: "MtaMilter" })
}
