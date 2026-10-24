import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import { registryGet } from "../registryGet.js"
import type { RegistrySieveSystemInterpreter } from "../generated/RegistrySieveSystemInterpreter.js"
import {
  sieveSystemInterpreterGetOptionsSchema,
  type SieveSystemInterpreterGetOptions,
} from "./sieveSystemInterpreterGetOptionsSchema.js"

/**
 * `x:SieveSystemInterpreter/get` — Configures the system-level Sieve script interpreter settings and limits.
 */
export async function sieveSystemInterpreterGet(
  options: SieveSystemInterpreterGetOptions,
): PromiseResult<JmapGetResponse<RegistrySieveSystemInterpreter>> {
  const op = "sieveSystemInterpreterGet"
  const parsed = a.safeParse(sieveSystemInterpreterGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "SieveSystemInterpreter" })
}
