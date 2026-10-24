import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

/** Options for `dkimSignatureGet` (`x:DkimSignature/get`). */
export const dkimSignatureGetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  ids: a.optional(a.array(a.string())),
  properties: a.optional(a.array(a.string())),
  accountId: a.optional(a.string()),
})

export type DkimSignatureGetOptions = a.InferInput<typeof dkimSignatureGetOptionsSchema>
