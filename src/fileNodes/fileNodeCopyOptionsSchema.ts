import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `FileNode/copy` arguments (`CopyRequest`, `crates/jmap-proto/src/method/copy.rs`). */
export const fileNodeCopyOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  fromAccountId: a.optional(a.string()),
  create: a.optional(a.record(a.string(), a.record(a.string(), a.unknown()))),
  onSuccessDestroyOriginal: a.optional(a.boolean()),
})

export type FileNodeCopyOptions = a.InferInput<typeof fileNodeCopyOptionsSchema>
