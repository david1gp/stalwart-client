import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { registrySet } from "../registrySet.js"
import { blockedIpRemoveOptionsSchema, type BlockedIpRemoveOptions } from "./blockedIpRemoveOptionsSchema.js"

/**
 * Remove a blocked IP entry (`x:BlockedIp/set` destroy-only).
 * Tear down in reverse order anything `blockedIpAdd` created.
 */
export async function blockedIpRemove(options: BlockedIpRemoveOptions): PromiseResult<boolean> {
  const op = "blockedIpRemove"
  const parsed = a.safeParse(blockedIpRemoveOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const response = await registrySet({
    config: parsed.output.config,
    objectType: "BlockedIp",
    destroy: [parsed.output.id],
    ...(parsed.output.accountId !== undefined ? { accountId: parsed.output.accountId } : {}),
  })
  if (!response.success) return response
  return createResult(true)
}
