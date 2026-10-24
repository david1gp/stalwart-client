import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { type AppPasswordSetOptions, appPasswordSetOptionsSchema } from "./appPasswordSetOptionsSchema.js"

/**
 * `x:AppPassword/set` — create, update and/or destroy directory AppPassword entries.
 * Any `notCreated`/`notUpdated`/`notDestroyed` entry makes the call a ResultErr.
 */
export async function appPasswordSet(options: AppPasswordSetOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "appPasswordSet"
  const parsed = a.safeParse(appPasswordSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...rest } = parsed.output
  return registrySet({ config, objectType: "AppPassword" as const, ...rest })
}
