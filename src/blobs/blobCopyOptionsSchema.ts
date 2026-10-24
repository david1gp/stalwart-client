import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `Blob/copy` arguments (`crates/jmap-proto/src/method/copy.rs`). */
export const blobCopyOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  fromAccountId: a.optional(a.string()),
  blobIds: a.array(a.string()),
})

export type BlobCopyOptions = a.InferInput<typeof blobCopyOptionsSchema>
