import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { type RoleUpdateOptions, roleUpdateOptionsSchema } from "./roleUpdateOptionsSchema.js"

/**
 * `x:Role/set` update — update one directory Role entry by id.
 */
export async function roleUpdate(options: RoleUpdateOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "roleUpdate"
  const parsed = a.safeParse(roleUpdateOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({
    config: parsed.output.config,
    objectType: "Role" as const,
    ...(parsed.output.accountId !== undefined ? { accountId: parsed.output.accountId } : {}),
    update: { [parsed.output.id]: parsed.output.patch },
  })
}
