import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `Blob/get` arguments (JMAP Blob extension; `crates/jmap/src/blob/get.rs`). */
export const blobGetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  ids: a.optional(a.array(a.string())),
  properties: a.optional(a.array(a.string())),
})

export type BlobGetOptions = a.InferInput<typeof blobGetOptionsSchema>
