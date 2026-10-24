import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

/** Options for `domainCreate`: `name` plus any extra `RegistryDomainCreate` fields. */
export const domainCreateOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  name: a.pipe(a.string(), a.minLength(1)),
  domain: a.optional(a.record(a.string(), a.unknown())),
})

export type DomainCreateOptions = a.InferInput<typeof domainCreateOptionsSchema>
