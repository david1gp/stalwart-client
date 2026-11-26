import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/**
 * `MDN/parse` arguments (`crates/jmap-proto/src/method/mdn.rs:47-51`):
 * blob ids of uploaded MDN messages.
 */
export const mdnParseOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  blobIds: a.array(a.string()),
})

export type MdnParseOptions = a.InferInput<typeof mdnParseOptionsSchema>
