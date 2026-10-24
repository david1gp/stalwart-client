import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { registrySet } from "../registrySet.js"
import { blockedIpAddOptionsSchema, type BlockedIpAddOptions } from "./blockedIpAddOptionsSchema.js"

/**
 * Block an IP address or network range (`x:BlockedIp/set` create-only).
 * The server defaults `reason` to `"manual"`; returns the created entry id.
 * Never block 127.0.0.1, ::1 or the deployment's public IP.
 */
export async function blockedIpAdd(options: BlockedIpAddOptions): PromiseResult<string> {
  const op = "blockedIpAdd"
  const parsed = a.safeParse(blockedIpAddOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const response = await registrySet({
    config: parsed.output.config,
    objectType: "BlockedIp",
    create: {
      a1: {
        address: parsed.output.address,
        ...(parsed.output.expiresAt !== undefined ? { expiresAt: parsed.output.expiresAt } : {}),
        ...(parsed.output.reason !== undefined ? { reason: parsed.output.reason } : {}),
      },
    },
    ...(parsed.output.accountId !== undefined ? { accountId: parsed.output.accountId } : {}),
  })
  if (!response.success) return response
  const id = response.data.created?.a1?.id
  if (typeof id !== "string")
    return createResultError(op, "BlockedIp created without an id", JSON.stringify(response.data))
  return createResult(id)
}
