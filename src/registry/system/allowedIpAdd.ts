import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { registrySet } from "../registrySet.js"
import { allowedIpAddOptionsSchema, type AllowedIpAddOptions } from "./allowedIpAddOptionsSchema.js"

/**
 * Allow an IP address or network range (`x:AllowedIp/set` create-only).
 * The server fills in `createdAt`; returns the created entry id.
 * Never allow 127.0.0.1, ::1 or the deployment's public IP.
 */
export async function allowedIpAdd(options: AllowedIpAddOptions): PromiseResult<string> {
  const op = "allowedIpAdd"
  const parsed = a.safeParse(allowedIpAddOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const response = await registrySet({
    config: parsed.output.config,
    objectType: "AllowedIp",
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
    return createResultError(op, "AllowedIp created without an id", JSON.stringify(response.data))
  return createResult(id)
}
