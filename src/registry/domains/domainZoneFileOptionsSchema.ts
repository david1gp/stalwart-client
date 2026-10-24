import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

/** Options for `domainZoneFile`: read the `dnsZoneFile` property of a domain. */
export const domainZoneFileOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  id: a.string(),
})

export type DomainZoneFileOptions = a.InferInput<typeof domainZoneFileOptionsSchema>
