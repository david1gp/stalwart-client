import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

export const allowedIpAddOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  /** The IP address or mask to allow. Use only documentation ranges (192.0.2.x, 198.51.100.x) in tests. */
  address: a.pipe(a.string(), a.minLength(1)),
  expiresAt: a.optional(a.string()),
  reason: a.optional(a.string()),
  accountId: a.optional(a.string()),
})

export type AllowedIpAddOptions = a.InferInput<typeof allowedIpAddOptionsSchema>
