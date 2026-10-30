import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import { registryGet } from "../registryGet.js"
import type { RegistrySpamAi } from "../generated/RegistrySpamAi.js"
import { spamAiGetOptionsSchema, type SpamAiGetOptions } from "./spamAiGetOptionsSchema.js"

/**
 * `x:SpamAi/get` — Configures the AI spam classifier (enterprise schema; Enable needs an AiModel id).
 */
export async function spamAiGet(options: SpamAiGetOptions): PromiseResult<JmapGetResponse<RegistrySpamAi>> {
  const op = "spamAiGet"
  const parsed = a.safeParse(spamAiGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "SpamAi" })
}
