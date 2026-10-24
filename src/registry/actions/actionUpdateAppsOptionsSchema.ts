import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

export const actionUpdateAppsOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
})

export type ActionUpdateAppsOptions = a.InferInput<typeof actionUpdateAppsOptionsSchema>
