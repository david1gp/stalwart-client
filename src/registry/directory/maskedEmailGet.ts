import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryMaskedEmail } from "../generated/RegistryMaskedEmail.js"
import { registryGet } from "../registryGet.js"
import { type MaskedEmailGetOptions, maskedEmailGetOptionsSchema } from "./maskedEmailGetOptionsSchema.js"

/**
 * `x:MaskedEmail/get` — fetch directory MaskedEmail entries by id.
 */
export async function maskedEmailGet(
  options: MaskedEmailGetOptions,
): PromiseResult<JmapGetResponse<RegistryMaskedEmail & { id: string }>> {
  const op = "maskedEmailGet"
  const parsed = a.safeParse(maskedEmailGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...rest } = parsed.output
  return registryGet({ config, objectType: "MaskedEmail" as const, ...rest })
}
