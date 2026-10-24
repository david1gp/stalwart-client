import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { mtaStageEhloSetOptionsSchema, type MtaStageEhloSetOptions } from "./mtaStageEhloSetOptionsSchema.js"

/**
 * `x:MtaStageEhlo/set` — create, update and/or destroy EHLO command requirements and validation.
 * Any `notCreated`/`notUpdated`/`notDestroyed` entry becomes a ResultErr.
 */
export async function mtaStageEhloSet(
  options: MtaStageEhloSetOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "mtaStageEhloSet"
  const parsed = a.safeParse(mtaStageEhloSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({ ...parsed.output, objectType: "MtaStageEhlo" })
}
