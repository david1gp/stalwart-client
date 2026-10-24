import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `Principal/changes` arguments. */
export const principalChangesOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  sinceState: a.string(),
  maxChanges: a.optional(a.pipe(a.number(), a.integer(), a.minValue(0))),
})

export type PrincipalChangesOptions = a.InferInput<typeof principalChangesOptionsSchema>
