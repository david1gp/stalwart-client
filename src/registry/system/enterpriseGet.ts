import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryEnterprise } from "../generated/RegistryEnterprise.js"
import { registryGet } from "../registryGet.js"
import { enterpriseGetOptionsSchema, type EnterpriseGetOptions } from "./enterpriseGetOptionsSchema.js"

/**
 * `x:Enterprise/get` — read the enterprise licensing and branding singleton.
 * Readable on the community edition (license fields are empty there).
 */
export async function enterpriseGet(
  options: EnterpriseGetOptions,
): PromiseResult<JmapGetResponse<RegistryEnterprise & { id: string }>> {
  const op = "enterpriseGet"
  const parsed = a.safeParse(enterpriseGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "Enterprise" })
}
