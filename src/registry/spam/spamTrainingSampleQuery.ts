import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import {
  spamTrainingSampleQueryOptionsSchema,
  type SpamTrainingSampleQueryOptions,
} from "./spamTrainingSampleQueryOptionsSchema.js"

/**
 * `x:SpamTrainingSample/query` — List spam classifier training samples. Only the `accountId` filter and `id` sorting are supported by the server. Source: crates/jmap/src/registry/mapping/spam_sample.rs.
 */
export async function spamTrainingSampleQuery(
  options: SpamTrainingSampleQueryOptions,
): PromiseResult<JmapQueryResponse> {
  const op = "spamTrainingSampleQuery"
  const parsed = a.safeParse(spamTrainingSampleQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryQuery({ ...parsed.output, objectType: "SpamTrainingSample" })
}
