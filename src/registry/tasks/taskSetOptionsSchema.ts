import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

const taskPatchSchema = a.record(a.string(), a.unknown())

export const taskSetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  create: a.optional(a.record(a.string(), taskPatchSchema)),
  update: a.optional(a.record(a.string(), taskPatchSchema)),
  destroy: a.optional(a.array(a.string())),
  ifInState: a.optional(a.string()),
  accountId: a.optional(a.string()),
})

export type TaskSetOptions = a.InferInput<typeof taskSetOptionsSchema>
