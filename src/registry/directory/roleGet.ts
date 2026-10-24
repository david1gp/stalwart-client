import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryRole } from "../generated/RegistryRole.js"
import { registryGet } from "../registryGet.js"
import { type RoleGetOptions, roleGetOptionsSchema } from "./roleGetOptionsSchema.js"

/**
 * `x:Role/get` — fetch directory Role entries by id.
 */
export async function roleGet(options: RoleGetOptions): PromiseResult<JmapGetResponse<RegistryRole & { id: string }>> {
  const op = "roleGet"
  const parsed = a.safeParse(roleGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...rest } = parsed.output
  return registryGet({ config, objectType: "Role" as const, ...rest })
}
