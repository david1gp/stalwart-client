import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

const actionPatchSchema = a.record(a.string(), a.unknown())

export const actionSetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  create: a.optional(a.record(a.string(), actionPatchSchema)),
  update: a.optional(a.record(a.string(), actionPatchSchema)),
  destroy: a.optional(a.array(a.string())),
  ifInState: a.optional(a.string()),
  accountId: a.optional(a.string()),
})

export type ActionSetOptions = a.InferInput<typeof actionSetOptionsSchema>
