import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/**
 * `ContactCard/parse` arguments (`ParseRequest`,
 * `crates/jmap-proto/src/method/parse.rs`; needs the `contacts:parse`
 * capability, advertised on the session).
 */
export const contactCardParseOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  blobIds: a.array(a.string()),
  properties: a.optional(a.array(a.string())),
})

export type ContactCardParseOptions = a.InferInput<typeof contactCardParseOptionsSchema>
