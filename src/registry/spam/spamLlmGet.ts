import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import { registryGet } from "../registryGet.js"
import type { RegistrySpamLlm } from "../generated/RegistrySpamLlm.js"
import { spamLlmGetOptionsSchema, type SpamLlmGetOptions } from "./spamLlmGetOptionsSchema.js"

/**
 * `x:SpamLlm/get` — Configures the LLM-based spam classifier (enterprise schema; Enable needs an AiModel id).
 */
export async function spamLlmGet(options: SpamLlmGetOptions): PromiseResult<JmapGetResponse<RegistrySpamLlm>> {
  const op = "spamLlmGet"
  const parsed = a.safeParse(spamLlmGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "SpamLlm" })
}
