import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryAction } from "../generated/RegistryAction.js"
import { registryGet } from "../registryGet.js"
import { actionGetOptionsSchema, type ActionGetOptions } from "./actionGetOptionsSchema.js"

/**
 * `x:Action/get` — fetch server management action records by id
 * (e.g. a finished `TroubleshootDmarc` result).
 */
export async function actionGet(
  options: ActionGetOptions,
): PromiseResult<JmapGetResponse<RegistryAction & { id: string }>> {
  const op = "actionGet"
  const parsed = a.safeParse(actionGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "Action" })
}
