import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { type RoleSetOptions, roleSetOptionsSchema } from "./roleSetOptionsSchema.js"

/**
 * `x:Role/set` — create, update and/or destroy directory Role entries.
 * Any `notCreated`/`notUpdated`/`notDestroyed` entry makes the call a ResultErr.
 */
export async function roleSet(options: RoleSetOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "roleSet"
  const parsed = a.safeParse(roleSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...rest } = parsed.output
  return registrySet({ config, objectType: "Role" as const, ...rest })
}
