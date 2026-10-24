import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { type AppPasswordUpdateOptions, appPasswordUpdateOptionsSchema } from "./appPasswordUpdateOptionsSchema.js"

/**
 * `x:AppPassword/set` update — update one directory AppPassword entry by id.
 */
export async function appPasswordUpdate(
  options: AppPasswordUpdateOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "appPasswordUpdate"
  const parsed = a.safeParse(appPasswordUpdateOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({
    config: parsed.output.config,
    objectType: "AppPassword" as const,
    ...(parsed.output.accountId !== undefined ? { accountId: parsed.output.accountId } : {}),
    update: { [parsed.output.id]: parsed.output.patch },
  })
}
