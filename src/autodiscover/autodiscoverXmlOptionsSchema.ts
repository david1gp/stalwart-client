import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** Options for `autodiscoverXml`: POST an Outlook autodiscover request document. */
export const autodiscoverXmlOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  requestXml: a.pipe(a.string(), a.minLength(1)),
})

export type AutodiscoverXmlOptions = a.InferInput<typeof autodiscoverXmlOptionsSchema>
