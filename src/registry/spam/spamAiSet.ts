import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { spamAiSetOptionsSchema, type SpamAiSetOptions } from "./spamAiSetOptionsSchema.js"

/**
 * `x:SpamAi/set` — Configures the AI spam classifier (enterprise schema; Enable needs an AiModel id).
 */
export async function spamAiSet(options: SpamAiSetOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "spamAiSet"
  const parsed = a.safeParse(spamAiSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({ ...parsed.output, objectType: "SpamAi" })
}
