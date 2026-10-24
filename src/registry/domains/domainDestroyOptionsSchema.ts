import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

/** Options for `domainDestroy`: destroy a domain after its DKIM signatures. */
export const domainDestroyOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  id: a.string(),
})

export type DomainDestroyOptions = a.InferInput<typeof domainDestroyOptionsSchema>
