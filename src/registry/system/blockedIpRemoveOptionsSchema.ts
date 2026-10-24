import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

export const blockedIpRemoveOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  /** Id of the blocked IP entry to destroy. */
  id: a.pipe(a.string(), a.minLength(1)),
  accountId: a.optional(a.string()),
})

export type BlockedIpRemoveOptions = a.InferInput<typeof blockedIpRemoveOptionsSchema>
