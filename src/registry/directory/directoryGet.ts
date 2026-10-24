import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryDirectory } from "../generated/RegistryDirectory.js"
import { registryGet } from "../registryGet.js"
import { type DirectoryGetOptions, directoryGetOptionsSchema } from "./directoryGetOptionsSchema.js"

/**
 * `x:Directory/get` — fetch directory Directory entries by id.
 */
export async function directoryGet(
  options: DirectoryGetOptions,
): PromiseResult<JmapGetResponse<RegistryDirectory & { id: string }>> {
  const op = "directoryGet"
  const parsed = a.safeParse(directoryGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...rest } = parsed.output
  return registryGet({ config, objectType: "Directory" as const, ...rest })
}
