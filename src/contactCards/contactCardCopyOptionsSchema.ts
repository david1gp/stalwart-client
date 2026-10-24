import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `ContactCard/copy` arguments (`CopyRequest`, `crates/jmap-proto/src/method/copy.rs`). */
export const contactCardCopyOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  fromAccountId: a.optional(a.string()),
  create: a.optional(a.record(a.string(), a.record(a.string(), a.unknown()))),
  onSuccessDestroyOriginal: a.optional(a.boolean()),
})

export type ContactCardCopyOptions = a.InferInput<typeof contactCardCopyOptionsSchema>
