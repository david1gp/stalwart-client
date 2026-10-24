import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { spamLlmSetOptionsSchema, type SpamLlmSetOptions } from "./spamLlmSetOptionsSchema.js"

/**
 * `x:SpamLlm/set` — Configures the LLM-based spam classifier (enterprise schema; Enable needs an AiModel id).
 */
export async function spamLlmSet(options: SpamLlmSetOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "spamLlmSet"
  const parsed = a.safeParse(spamLlmSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({ ...parsed.output, objectType: "SpamLlm" })
}
