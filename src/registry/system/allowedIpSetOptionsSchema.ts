import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

const allowedIpPatchSchema = a.record(a.string(), a.unknown())

export const allowedIpSetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  create: a.optional(a.record(a.string(), allowedIpPatchSchema)),
  update: a.optional(a.record(a.string(), allowedIpPatchSchema)),
  destroy: a.optional(a.array(a.string())),
  ifInState: a.optional(a.string()),
  accountId: a.optional(a.string()),
})

export type AllowedIpSetOptions = a.InferInput<typeof allowedIpSetOptionsSchema>
