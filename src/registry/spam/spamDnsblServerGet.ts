import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import { registryGet } from "../registryGet.js"
import type { RegistrySpamDnsblServer } from "../generated/RegistrySpamDnsblServer.js"
import { spamDnsblServerGetOptionsSchema, type SpamDnsblServerGetOptions } from "./spamDnsblServerGetOptionsSchema.js"

/**
 * `x:SpamDnsblServer/get` — Defines a DNSBL server used for spam filtering lookups.
 */
export async function spamDnsblServerGet(
  options: SpamDnsblServerGetOptions,
): PromiseResult<JmapGetResponse<RegistrySpamDnsblServer>> {
  const op = "spamDnsblServerGet"
  const parsed = a.safeParse(spamDnsblServerGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "SpamDnsblServer" })
}
