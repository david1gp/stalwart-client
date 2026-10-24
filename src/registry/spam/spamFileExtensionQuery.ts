import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import {
  spamFileExtensionQueryOptionsSchema,
  type SpamFileExtensionQueryOptions,
} from "./spamFileExtensionQueryOptionsSchema.js"

/**
 * `x:SpamFileExtension/query` — Defines a file extension classification rule for spam filtering.
 */
export async function spamFileExtensionQuery(options: SpamFileExtensionQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "spamFileExtensionQuery"
  const parsed = a.safeParse(spamFileExtensionQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryQuery({ ...parsed.output, objectType: "SpamFileExtension" })
}
