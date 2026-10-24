import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

const setPatchSchema = a.record(a.string(), a.unknown())

/**
 * `x:WebHook/set` options. `create` entries use `RegistryWebHookCreate`;
 * `update` is a JMAP PatchObject per id.
 */
export const webHookSetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  create: a.optional(a.record(a.string(), setPatchSchema)),
  update: a.optional(a.record(a.string(), setPatchSchema)),
  destroy: a.optional(a.array(a.string())),
  ifInState: a.optional(a.string()),
  accountId: a.optional(a.string()),
})

export type WebHookSetOptions = a.InferInput<typeof webHookSetOptionsSchema>
