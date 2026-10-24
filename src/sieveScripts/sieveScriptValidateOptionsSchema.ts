import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `SieveScript/validate` arguments. */
export const sieveScriptValidateOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  blobId: a.string(),
})

export type SieveScriptValidateOptions = a.InferInput<typeof sieveScriptValidateOptionsSchema>
