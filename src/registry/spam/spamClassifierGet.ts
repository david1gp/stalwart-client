import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import { registryGet } from "../registryGet.js"
import type { RegistrySpamClassifier } from "../generated/RegistrySpamClassifier.js"
import { spamClassifierGetOptionsSchema, type SpamClassifierGetOptions } from "./spamClassifierGetOptionsSchema.js"

/**
 * `x:SpamClassifier/get` — Configures the spam classifier model, training parameters, and auto-learning settings.
 */
export async function spamClassifierGet(
  options: SpamClassifierGetOptions,
): PromiseResult<JmapGetResponse<RegistrySpamClassifier>> {
  const op = "spamClassifierGet"
  const parsed = a.safeParse(spamClassifierGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "SpamClassifier" })
}
