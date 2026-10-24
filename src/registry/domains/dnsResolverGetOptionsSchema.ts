import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

/** Options for `dnsResolverGet` (`x:DnsResolver/get`). */
export const dnsResolverGetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  ids: a.optional(a.array(a.string())),
  properties: a.optional(a.array(a.string())),
  accountId: a.optional(a.string()),
})

export type DnsResolverGetOptions = a.InferInput<typeof dnsResolverGetOptionsSchema>
