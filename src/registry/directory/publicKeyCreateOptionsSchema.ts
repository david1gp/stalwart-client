import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

export const publicKeyCreateOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  publicKey: a.record(a.string(), a.unknown()),
  accountId: a.optional(a.string()),
})

export type PublicKeyCreateOptions = a.InferInput<typeof publicKeyCreateOptionsSchema>
