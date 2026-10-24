import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import { registryGet } from "../registryGet.js"
import type { RegistrySpamRule } from "../generated/RegistrySpamRule.js"
import { spamRuleGetOptionsSchema, type SpamRuleGetOptions } from "./spamRuleGetOptionsSchema.js"

/**
 * `x:SpamRule/get` — Defines a spam filter rule for message classification.
 */
export async function spamRuleGet(options: SpamRuleGetOptions): PromiseResult<JmapGetResponse<RegistrySpamRule>> {
  const op = "spamRuleGet"
  const parsed = a.safeParse(spamRuleGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "SpamRule" })
}
