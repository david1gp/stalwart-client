import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** Options for `contactFormSubmit`: POST urlencoded fields to a contact form path. */
export const contactFormSubmitOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  form: a.pipe(a.string(), a.minLength(1)),
  fields: a.record(a.string(), a.string()),
})

export type ContactFormSubmitOptions = a.InferInput<typeof contactFormSubmitOptionsSchema>
