import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { spamPyzorSetOptionsSchema, type SpamPyzorSetOptions } from "./spamPyzorSetOptionsSchema.js"

/**
 * `x:SpamPyzor/set` — Configures the Pyzor collaborative spam detection service.
 */
export async function spamPyzorSet(options: SpamPyzorSetOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "spamPyzorSet"
  const parsed = a.safeParse(spamPyzorSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({ ...parsed.output, objectType: "SpamPyzor" })
}
