import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

const setPatchSchema = a.record(a.string(), a.unknown())

/**
 * `x:ArchivedItem/set` options. Create always fails with
 * "Archived items cannot be created"; update accepts `status` and
 * `archivedUntil` (restore flow)
 * (`crates/jmap/src/registry/mapping/archived_item.rs:38-80`).
 */
export const archivedItemSetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  update: a.optional(a.record(a.string(), setPatchSchema)),
  destroy: a.optional(a.array(a.string())),
  ifInState: a.optional(a.string()),
  accountId: a.optional(a.string()),
})

export type ArchivedItemSetOptions = a.InferInput<typeof archivedItemSetOptionsSchema>
