import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

const blockedIpPatchSchema = a.record(a.string(), a.unknown())

export const blockedIpSetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  create: a.optional(a.record(a.string(), blockedIpPatchSchema)),
  update: a.optional(a.record(a.string(), blockedIpPatchSchema)),
  destroy: a.optional(a.array(a.string())),
  ifInState: a.optional(a.string()),
  accountId: a.optional(a.string()),
})

export type BlockedIpSetOptions = a.InferInput<typeof blockedIpSetOptionsSchema>
