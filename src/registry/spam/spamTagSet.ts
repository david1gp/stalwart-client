import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { spamTagSetOptionsSchema, type SpamTagSetOptions } from "./spamTagSetOptionsSchema.js"

/**
 * `x:SpamTag/set` — Defines a score or action assigned to a spam classification tag.
 */
export async function spamTagSet(options: SpamTagSetOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "spamTagSet"
  const parsed = a.safeParse(spamTagSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({ ...parsed.output, objectType: "SpamTag" })
}
