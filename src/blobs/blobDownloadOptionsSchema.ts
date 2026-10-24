import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/**
 * `blobDownload` arguments: `GET /jmap/download/{accountId}/{blobId}/{name}`
 * (`request.rs:163`). The `name` segment is required by the URL template;
 * `accept` overrides the content type.
 */
export const blobDownloadOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  blobId: a.string(),
  name: a.optional(a.string()),
  accept: a.optional(a.string()),
})

export type BlobDownloadOptions = a.InferInput<typeof blobDownloadOptionsSchema>
