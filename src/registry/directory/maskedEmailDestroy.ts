import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { type MaskedEmailDestroyOptions, maskedEmailDestroyOptionsSchema } from "./maskedEmailDestroyOptionsSchema.js"

/**
 * `x:MaskedEmail/set` destroy — destroy one directory MaskedEmail entry by id.
 */
export async function maskedEmailDestroy(
  options: MaskedEmailDestroyOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "maskedEmailDestroy"
  const parsed = a.safeParse(maskedEmailDestroyOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({
    config: parsed.output.config,
    objectType: "MaskedEmail" as const,
    ...(parsed.output.accountId !== undefined ? { accountId: parsed.output.accountId } : {}),
    destroy: [parsed.output.id],
  })
}
