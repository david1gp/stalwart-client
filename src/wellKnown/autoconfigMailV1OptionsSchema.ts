import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** Options for `autoconfigMailV1`: `GET /.well-known/mail-v1.xml` for an email address. */
export const autoconfigMailV1OptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  email: a.pipe(a.string(), a.minLength(1)),
})

export type AutoconfigMailV1Options = a.InferInput<typeof autoconfigMailV1OptionsSchema>
