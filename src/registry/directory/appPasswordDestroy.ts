import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { type AppPasswordDestroyOptions, appPasswordDestroyOptionsSchema } from "./appPasswordDestroyOptionsSchema.js"

/**
 * `x:AppPassword/set` destroy — destroy one directory AppPassword entry by id.
 */
export async function appPasswordDestroy(
  options: AppPasswordDestroyOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "appPasswordDestroy"
  const parsed = a.safeParse(appPasswordDestroyOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({
    config: parsed.output.config,
    objectType: "AppPassword" as const,
    ...(parsed.output.accountId !== undefined ? { accountId: parsed.output.accountId } : {}),
    destroy: [parsed.output.id],
  })
}
