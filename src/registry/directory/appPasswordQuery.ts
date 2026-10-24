import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import { type AppPasswordQueryOptions, appPasswordQueryOptionsSchema } from "./appPasswordQueryOptionsSchema.js"

/**
 * `x:AppPassword/query` — list directory AppPassword ids with an optional filter/sort/page.
 */
export async function appPasswordQuery(options: AppPasswordQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "appPasswordQuery"
  const parsed = a.safeParse(appPasswordQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...rest } = parsed.output
  return registryQuery({ config, objectType: "AppPassword" as const, ...rest })
}
