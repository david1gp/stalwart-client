import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `Principal/queryChanges` arguments. */
export const principalQueryChangesOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  sinceQueryState: a.string(),
  maxChanges: a.optional(a.pipe(a.number(), a.integer(), a.minValue(0))),
})

export type PrincipalQueryChangesOptions = a.InferInput<typeof principalQueryChangesOptionsSchema>
