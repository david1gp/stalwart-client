import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistrySharing } from "../generated/RegistrySharing.js"
import { registryGet } from "../registryGet.js"
import { sharingGetOptionsSchema, type SharingGetOptions } from "./sharingGetOptionsSchema.js"

/**
 * `x:Sharing/get` — read the sharing settings singleton
 * (directory queries, max shares per item).
 */
export async function sharingGet(
  options: SharingGetOptions,
): PromiseResult<JmapGetResponse<RegistrySharing & { id: string }>> {
  const op = "sharingGet"
  const parsed = a.safeParse(sharingGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "Sharing" })
}
