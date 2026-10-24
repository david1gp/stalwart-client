import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { type PublicKeySetOptions, publicKeySetOptionsSchema } from "./publicKeySetOptionsSchema.js"

/**
 * `x:PublicKey/set` — create, update and/or destroy directory PublicKey entries.
 * Any `notCreated`/`notUpdated`/`notDestroyed` entry makes the call a ResultErr.
 */
export async function publicKeySet(options: PublicKeySetOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "publicKeySet"
  const parsed = a.safeParse(publicKeySetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...rest } = parsed.output
  return registrySet({ config, objectType: "PublicKey" as const, ...rest })
}
