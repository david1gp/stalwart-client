import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/**
 * `blobHttpUpload` arguments: raw `POST /jmap/upload/{accountId}/` transport
 * (`request.rs:179`), distinct from the `Blob/upload` method form wrapped by
 * `blobUpload`.
 */
export const blobHttpUploadOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  data: a.union([a.string(), a.instance(Uint8Array)]),
  contentType: a.optional(a.string()),
})

export type BlobHttpUploadOptions = a.InferInput<typeof blobHttpUploadOptionsSchema>
