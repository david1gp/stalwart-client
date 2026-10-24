import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `Principal/get` arguments. */
export const principalGetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  ids: a.optional(a.array(a.string())),
  properties: a.optional(a.array(a.string())),
})

export type PrincipalGetOptions = a.InferInput<typeof principalGetOptionsSchema>
