import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import { type DirectoryQueryOptions, directoryQueryOptionsSchema } from "./directoryQueryOptionsSchema.js"

/**
 * `x:Directory/query` — list directory Directory ids with an optional filter/sort/page.
 */
export async function directoryQuery(options: DirectoryQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "directoryQuery"
  const parsed = a.safeParse(directoryQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...rest } = parsed.output
  return registryQuery({ config, objectType: "Directory" as const, ...rest })
}
