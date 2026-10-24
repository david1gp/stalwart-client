import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

const aiModelPatchSchema = a.record(a.string(), a.unknown())

export const aiModelSetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  create: a.optional(a.record(a.string(), aiModelPatchSchema)),
  update: a.optional(a.record(a.string(), aiModelPatchSchema)),
  destroy: a.optional(a.array(a.string())),
  ifInState: a.optional(a.string()),
  accountId: a.optional(a.string()),
})

export type AiModelSetOptions = a.InferInput<typeof aiModelSetOptionsSchema>
