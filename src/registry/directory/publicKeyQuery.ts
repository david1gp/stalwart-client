import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import { type PublicKeyQueryOptions, publicKeyQueryOptionsSchema } from "./publicKeyQueryOptionsSchema.js"

/**
 * `x:PublicKey/query` — list directory PublicKey ids with an optional filter/sort/page.
 */
export async function publicKeyQuery(options: PublicKeyQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "publicKeyQuery"
  const parsed = a.safeParse(publicKeyQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...rest } = parsed.output
  return registryQuery({ config, objectType: "PublicKey" as const, ...rest })
}
