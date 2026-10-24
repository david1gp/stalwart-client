import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { type PublicKeyUpdateOptions, publicKeyUpdateOptionsSchema } from "./publicKeyUpdateOptionsSchema.js"

/**
 * `x:PublicKey/set` update — update one directory PublicKey entry by id.
 */
export async function publicKeyUpdate(
  options: PublicKeyUpdateOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "publicKeyUpdate"
  const parsed = a.safeParse(publicKeyUpdateOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({
    config: parsed.output.config,
    objectType: "PublicKey" as const,
    ...(parsed.output.accountId !== undefined ? { accountId: parsed.output.accountId } : {}),
    update: { [parsed.output.id]: parsed.output.patch },
  })
}
