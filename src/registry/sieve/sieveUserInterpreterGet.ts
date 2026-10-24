import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import { registryGet } from "../registryGet.js"
import type { RegistrySieveUserInterpreter } from "../generated/RegistrySieveUserInterpreter.js"
import {
  sieveUserInterpreterGetOptionsSchema,
  type SieveUserInterpreterGetOptions,
} from "./sieveUserInterpreterGetOptionsSchema.js"

/**
 * `x:SieveUserInterpreter/get` — Configures the user-level Sieve script interpreter settings and limits.
 */
export async function sieveUserInterpreterGet(
  options: SieveUserInterpreterGetOptions,
): PromiseResult<JmapGetResponse<RegistrySieveUserInterpreter>> {
  const op = "sieveUserInterpreterGet"
  const parsed = a.safeParse(sieveUserInterpreterGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "SieveUserInterpreter" })
}
