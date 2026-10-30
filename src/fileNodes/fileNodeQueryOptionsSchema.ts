import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/**
 * `FileNode/query` arguments. Filter keys
 * (`isTopLevel`/`parentId`/`ancestorId`/`descendantId`/`nodeType`/`role`/
 * `hasAnyRole`/`blobId`/`isExecutable`/`createdBefore`/`createdAfter`/
 * `modifiedBefore`/`modifiedAfter`/`accessedBefore`/`accessedAfter`/
 * `minSize`/`maxSize`/`name`/`nameMatch`/`mediaType`/`mediaTypeMatch`/
 * `body`/`text` plus the six metadata conditions) and comparators
 * (`name`/`size`/`created`/`modified`/`mediaType`/`nodeType`/`tree`) per
 * `crates/jmap-proto/src/object/file_node.rs`. Stalwart v1 renamed the
 * `type`/`typeMatch` filter and comparator to `mediaType`/`mediaTypeMatch`.
 */
export const fileNodeQueryOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  filter: a.optional(a.record(a.string(), a.unknown())),
  sort: a.optional(a.array(a.record(a.string(), a.unknown()))),
  position: a.optional(a.number()),
  limit: a.optional(a.number()),
  calculateTotal: a.optional(a.boolean()),
})

export type FileNodeQueryOptions = a.InferInput<typeof fileNodeQueryOptionsSchema>
