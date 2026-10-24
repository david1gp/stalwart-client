import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import { registryGet } from "../registryGet.js"
import type { RegistrySpamPyzor } from "../generated/RegistrySpamPyzor.js"
import { spamPyzorGetOptionsSchema, type SpamPyzorGetOptions } from "./spamPyzorGetOptionsSchema.js"

/**
 * `x:SpamPyzor/get` — Configures the Pyzor collaborative spam detection service.
 */
export async function spamPyzorGet(options: SpamPyzorGetOptions): PromiseResult<JmapGetResponse<RegistrySpamPyzor>> {
  const op = "spamPyzorGet"
  const parsed = a.safeParse(spamPyzorGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "SpamPyzor" })
}
