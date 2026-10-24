import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

/** Options for `mtaRouteGet` (`x:MtaRoute/get`). */
export const mtaRouteGetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  ids: a.optional(a.array(a.string())),
  properties: a.optional(a.array(a.string())),
  accountId: a.optional(a.string()),
})

export type MtaRouteGetOptions = a.InferInput<typeof mtaRouteGetOptionsSchema>
