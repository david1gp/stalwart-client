import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import { registryGet } from "../registryGet.js"
import type { RegistrySpamTag } from "../generated/RegistrySpamTag.js"
import { spamTagGetOptionsSchema, type SpamTagGetOptions } from "./spamTagGetOptionsSchema.js"

/**
 * `x:SpamTag/get` — Defines a score or action assigned to a spam classification tag.
 */
export async function spamTagGet(options: SpamTagGetOptions): PromiseResult<JmapGetResponse<RegistrySpamTag>> {
  const op = "spamTagGet"
  const parsed = a.safeParse(spamTagGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "SpamTag" })
}
