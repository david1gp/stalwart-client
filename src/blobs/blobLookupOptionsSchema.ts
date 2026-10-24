import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `Blob/lookup` arguments (`crates/jmap-proto/src/method/lookup.rs`). */
export const blobLookupOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  typeNames: a.array(a.string()),
  ids: a.array(a.string()),
})

export type BlobLookupOptions = a.InferInput<typeof blobLookupOptionsSchema>
