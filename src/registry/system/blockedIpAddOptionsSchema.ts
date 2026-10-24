import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

export const blockedIpAddOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  /** The IP address or mask to block. Use only documentation ranges (192.0.2.x, 198.51.100.x) in tests. Never 127.0.0.1, ::1 or the deployment's public IP. */
  address: a.pipe(a.string(), a.minLength(1)),
  expiresAt: a.optional(a.string()),
  reason: a.optional(a.picklist(["authFailure", "loitering", "manual", "other", "portScanning", "rcptToFailure"])),
  accountId: a.optional(a.string()),
})

export type BlockedIpAddOptions = a.InferInput<typeof blockedIpAddOptionsSchema>
