import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/**
 * `Blob/upload` (method form) arguments
 * (`BlobUploadRequest`, `crates/jmap-proto/src/method/upload.rs`). Each entry
 * carries inline data: `{data:asText: "…"}` or `{data:asBase64: "…"}`.
 */
export const blobUploadOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  create: a.record(a.string(), a.record(a.string(), a.unknown())),
})

export type BlobUploadOptions = a.InferInput<typeof blobUploadOptionsSchema>
