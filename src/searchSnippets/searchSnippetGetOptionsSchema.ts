import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

export const searchSnippetGetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  /** Email ids to snippet (required server-side: `crates/jmap/src/email/snippet.rs:107`). */
  emailIds: a.optional(a.array(a.string())),
  filter: a.optional(a.record(a.string(), a.unknown())),
  sort: a.optional(a.array(a.record(a.string(), a.unknown()))),
  position: a.optional(a.pipe(a.number(), a.integer(), a.minValue(0))),
  anchor: a.optional(a.string()),
  anchorOffset: a.optional(a.pipe(a.number(), a.integer())),
  limit: a.optional(a.pipe(a.number(), a.integer(), a.minValue(0))),
  calculateTotal: a.optional(a.boolean()),
})

export type SearchSnippetGetOptions = a.InferInput<typeof searchSnippetGetOptionsSchema>
