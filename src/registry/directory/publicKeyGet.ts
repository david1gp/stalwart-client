import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryPublicKey } from "../generated/RegistryPublicKey.js"
import { registryGet } from "../registryGet.js"
import { type PublicKeyGetOptions, publicKeyGetOptionsSchema } from "./publicKeyGetOptionsSchema.js"

/**
 * `x:PublicKey/get` — fetch directory PublicKey entries by id.
 */
export async function publicKeyGet(
  options: PublicKeyGetOptions,
): PromiseResult<JmapGetResponse<RegistryPublicKey & { id: string }>> {
  const op = "publicKeyGet"
  const parsed = a.safeParse(publicKeyGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...rest } = parsed.output
  return registryGet({ config, objectType: "PublicKey" as const, ...rest })
}
