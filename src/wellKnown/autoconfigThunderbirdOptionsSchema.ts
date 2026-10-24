import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** Options for `autoconfigThunderbird`: `GET /.well-known/autoconfig/mail/config-v1.1.xml`. */
export const autoconfigThunderbirdOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  email: a.pipe(a.string(), a.minLength(1)),
})

export type AutoconfigThunderbirdOptions = a.InferInput<typeof autoconfigThunderbirdOptionsSchema>
