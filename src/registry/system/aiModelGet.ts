import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryAiModel } from "../generated/RegistryAiModel.js"
import { registryGet } from "../registryGet.js"
import { aiModelGetOptionsSchema, type AiModelGetOptions } from "./aiModelGetOptionsSchema.js"

/**
 * `x:AiModel/get` — fetch AI model endpoints for LLM-based features by id.
 * Flagged `schema:enterprise` but not runtime-gated; the server behaviour
 * (success vs "Enterprise feature") is surfaced, not emulated.
 */
export async function aiModelGet(
  options: AiModelGetOptions,
): PromiseResult<JmapGetResponse<RegistryAiModel & { id: string }>> {
  const op = "aiModelGet"
  const parsed = a.safeParse(aiModelGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "AiModel" })
}
