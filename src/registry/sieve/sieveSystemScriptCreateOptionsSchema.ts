import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

/** Options for `sieveSystemScriptCreate` — a single-script `x:SieveSystemScript/set` create. */
export const sieveSystemScriptCreateOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  script: a.object({
    name: a.pipe(a.string(), a.minLength(1)),
    contents: a.pipe(a.string(), a.minLength(1)),
    isActive: a.boolean(),
    description: a.optional(a.nullable(a.string())),
  }),
  accountId: a.optional(a.string()),
})

export type SieveSystemScriptCreateOptions = a.InferInput<typeof sieveSystemScriptCreateOptionsSchema>
