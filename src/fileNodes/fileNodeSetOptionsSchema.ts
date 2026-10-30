import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/**
 * `FileNode/set` arguments (`crates/jmap/src/file/set.rs`). Creation extras:
 * `onDestroyRemoveChildren`, `onExists` (`replace`/`rename`/`newest`;
 * `unchanged` is rejected — no JMAP Conditional Set support) and
 * `compareCaseInsensitively`.
 */
export const fileNodeSetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  ifInState: a.optional(a.string()),
  create: a.optional(a.record(a.string(), a.record(a.string(), a.unknown()))),
  update: a.optional(a.record(a.string(), a.record(a.string(), a.unknown()))),
  destroy: a.optional(a.array(a.string())),
})

export type FileNodeSetOptions = a.InferInput<typeof fileNodeSetOptionsSchema>
