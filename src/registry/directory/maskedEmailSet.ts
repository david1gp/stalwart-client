import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { type MaskedEmailSetOptions, maskedEmailSetOptionsSchema } from "./maskedEmailSetOptionsSchema.js"

/**
 * `x:MaskedEmail/set` — create, update and/or destroy directory MaskedEmail entries.
 * Any `notCreated`/`notUpdated`/`notDestroyed` entry makes the call a ResultErr.
 */
export async function maskedEmailSet(options: MaskedEmailSetOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "maskedEmailSet"
  const parsed = a.safeParse(maskedEmailSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...rest } = parsed.output
  return registrySet({ config, objectType: "MaskedEmail" as const, ...rest })
}
