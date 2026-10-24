import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import { type MaskedEmailQueryOptions, maskedEmailQueryOptionsSchema } from "./maskedEmailQueryOptionsSchema.js"

/**
 * `x:MaskedEmail/query` — list directory MaskedEmail ids with an optional filter/sort/page.
 */
export async function maskedEmailQuery(options: MaskedEmailQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "maskedEmailQuery"
  const parsed = a.safeParse(maskedEmailQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...rest } = parsed.output
  return registryQuery({ config, objectType: "MaskedEmail" as const, ...rest })
}
