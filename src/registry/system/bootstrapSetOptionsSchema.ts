import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

export const bootstrapSetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  /** Patch applied to the singleton (`update: {"singleton": patch}`). Only usable in bootstrap mode. */
  patch: a.record(a.string(), a.unknown()),
  accountId: a.optional(a.string()),
})

export type BootstrapSetOptions = a.InferInput<typeof bootstrapSetOptionsSchema>
