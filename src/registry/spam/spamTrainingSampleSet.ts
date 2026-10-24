import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import {
  spamTrainingSampleSetOptionsSchema,
  type SpamTrainingSampleSetOptions,
} from "./spamTrainingSampleSetOptionsSchema.js"

/**
 * `x:SpamTrainingSample/set` — Create or destroy training samples. Updates are rejected by the server; create needs an accessible blobId. Source: crates/jmap/src/registry/mapping/spam_sample.rs.
 */
export async function spamTrainingSampleSet(
  options: SpamTrainingSampleSetOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "spamTrainingSampleSet"
  const parsed = a.safeParse(spamTrainingSampleSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({ ...parsed.output, objectType: "SpamTrainingSample" })
}
