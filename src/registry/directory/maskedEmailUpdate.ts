import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { type MaskedEmailUpdateOptions, maskedEmailUpdateOptionsSchema } from "./maskedEmailUpdateOptionsSchema.js"

/**
 * `x:MaskedEmail/set` update — update one directory MaskedEmail entry by id.
 */
export async function maskedEmailUpdate(
  options: MaskedEmailUpdateOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "maskedEmailUpdate"
  const parsed = a.safeParse(maskedEmailUpdateOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({
    config: parsed.output.config,
    objectType: "MaskedEmail" as const,
    ...(parsed.output.accountId !== undefined ? { accountId: parsed.output.accountId } : {}),
    update: { [parsed.output.id]: parsed.output.patch },
  })
}
