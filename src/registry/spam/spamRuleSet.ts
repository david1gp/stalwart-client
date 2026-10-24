import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { spamRuleSetOptionsSchema, type SpamRuleSetOptions } from "./spamRuleSetOptionsSchema.js"

/**
 * `x:SpamRule/set` — Defines a spam filter rule for message classification.
 */
export async function spamRuleSet(options: SpamRuleSetOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "spamRuleSet"
  const parsed = a.safeParse(spamRuleSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({ ...parsed.output, objectType: "SpamRule" })
}
