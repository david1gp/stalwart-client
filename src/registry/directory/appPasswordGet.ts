import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryAppPassword } from "../generated/RegistryAppPassword.js"
import { registryGet } from "../registryGet.js"
import { type AppPasswordGetOptions, appPasswordGetOptionsSchema } from "./appPasswordGetOptionsSchema.js"

/**
 * `x:AppPassword/get` — fetch directory AppPassword entries by id.
 */
export async function appPasswordGet(
  options: AppPasswordGetOptions,
): PromiseResult<JmapGetResponse<RegistryAppPassword & { id: string }>> {
  const op = "appPasswordGet"
  const parsed = a.safeParse(appPasswordGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...rest } = parsed.output
  return registryGet({ config, objectType: "AppPassword" as const, ...rest })
}
