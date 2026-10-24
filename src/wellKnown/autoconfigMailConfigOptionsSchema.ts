import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** Options for `autoconfigMailConfig`: `GET /mail/config-v1.1.xml` for an email address. */
export const autoconfigMailConfigOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  email: a.pipe(a.string(), a.minLength(1)),
})

export type AutoconfigMailConfigOptions = a.InferInput<typeof autoconfigMailConfigOptionsSchema>
