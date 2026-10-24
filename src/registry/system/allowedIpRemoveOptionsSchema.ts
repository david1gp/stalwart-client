import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

export const allowedIpRemoveOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  /** Id of the allowed IP entry to destroy. */
  id: a.pipe(a.string(), a.minLength(1)),
  accountId: a.optional(a.string()),
})

export type AllowedIpRemoveOptions = a.InferInput<typeof allowedIpRemoveOptionsSchema>
