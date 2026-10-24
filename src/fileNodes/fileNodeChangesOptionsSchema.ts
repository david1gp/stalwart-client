import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `FileNode/changes` arguments. */
export const fileNodeChangesOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  sinceState: a.string(),
  maxChanges: a.optional(a.number()),
})

export type FileNodeChangesOptions = a.InferInput<typeof fileNodeChangesOptionsSchema>
