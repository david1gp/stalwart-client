import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { spamClassifierSetOptionsSchema, type SpamClassifierSetOptions } from "./spamClassifierSetOptionsSchema.js"

/**
 * `x:SpamClassifier/set` — Configures the spam classifier model, training parameters, and auto-learning settings.
 */
export async function spamClassifierSet(
  options: SpamClassifierSetOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "spamClassifierSet"
  const parsed = a.safeParse(spamClassifierSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({ ...parsed.output, objectType: "SpamClassifier" })
}
