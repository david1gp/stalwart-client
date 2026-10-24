import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { registrySet } from "../registrySet.js"
import { allowedIpRemoveOptionsSchema, type AllowedIpRemoveOptions } from "./allowedIpRemoveOptionsSchema.js"

/**
 * Remove an allowed IP entry (`x:AllowedIp/set` destroy-only).
 * Tear down in reverse order anything `allowedIpAdd` created.
 */
export async function allowedIpRemove(options: AllowedIpRemoveOptions): PromiseResult<true> {
  const op = "allowedIpRemove"
  const parsed = a.safeParse(allowedIpRemoveOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const response = await registrySet({
    config: parsed.output.config,
    objectType: "AllowedIp",
    destroy: [parsed.output.id],
    ...(parsed.output.accountId !== undefined ? { accountId: parsed.output.accountId } : {}),
  })
  if (!response.success) return response
  return createResult(true)
}
