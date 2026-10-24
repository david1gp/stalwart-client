import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import { type AccountQueryOptions, accountQueryOptionsSchema } from "./accountQueryOptionsSchema.js"

/**
 * `x:Account/query` — list directory Account ids with an optional filter/sort/page.
 */
export async function accountQuery(options: AccountQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "accountQuery"
  const parsed = a.safeParse(accountQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...rest } = parsed.output
  return registryQuery({ config, objectType: "Account" as const, ...rest })
}
