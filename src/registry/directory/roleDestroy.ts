import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { type RoleDestroyOptions, roleDestroyOptionsSchema } from "./roleDestroyOptionsSchema.js"

/**
 * `x:Role/set` destroy — destroy one directory Role entry by id.
 */
export async function roleDestroy(options: RoleDestroyOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "roleDestroy"
  const parsed = a.safeParse(roleDestroyOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({
    config: parsed.output.config,
    objectType: "Role" as const,
    ...(parsed.output.accountId !== undefined ? { accountId: parsed.output.accountId } : {}),
    destroy: [parsed.output.id],
  })
}
