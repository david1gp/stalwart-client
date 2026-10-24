import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** Options for `autodiscoverJson`: Autodiscover V2 lookup for an email address. */
export const autodiscoverJsonOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  email: a.pipe(a.string(), a.minLength(1)),
  protocol: a.optional(a.string()),
})

export type AutodiscoverJsonOptions = a.InferInput<typeof autodiscoverJsonOptionsSchema>
