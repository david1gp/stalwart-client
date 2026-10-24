import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { spamDnsblServerSetOptionsSchema, type SpamDnsblServerSetOptions } from "./spamDnsblServerSetOptionsSchema.js"

/**
 * `x:SpamDnsblServer/set` — Defines a DNSBL server used for spam filtering lookups.
 */
export async function spamDnsblServerSet(
  options: SpamDnsblServerSetOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "spamDnsblServerSet"
  const parsed = a.safeParse(spamDnsblServerSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({ ...parsed.output, objectType: "SpamDnsblServer" })
}
