import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import { registryGet } from "../registryGet.js"
import type { RegistrySpamTrainingSample } from "../generated/RegistrySpamTrainingSample.js"
import {
  spamTrainingSampleGetOptionsSchema,
  type SpamTrainingSampleGetOptions,
} from "./spamTrainingSampleGetOptionsSchema.js"

/**
 * `x:SpamTrainingSample/get` — Fetch spam classifier training samples by id. Source: crates/jmap/src/registry/mapping/spam_sample.rs.
 */
export async function spamTrainingSampleGet(
  options: SpamTrainingSampleGetOptions,
): PromiseResult<JmapGetResponse<RegistrySpamTrainingSample>> {
  const op = "spamTrainingSampleGet"
  const parsed = a.safeParse(spamTrainingSampleGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "SpamTrainingSample" })
}
