import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

const applicationPatchSchema = a.record(a.string(), a.unknown())

export const applicationSetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  create: a.optional(a.record(a.string(), applicationPatchSchema)),
  update: a.optional(a.record(a.string(), applicationPatchSchema)),
  destroy: a.optional(a.array(a.string())),
  ifInState: a.optional(a.string()),
  accountId: a.optional(a.string()),
})

export type ApplicationSetOptions = a.InferInput<typeof applicationSetOptionsSchema>
