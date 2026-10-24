import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import {
  spamDnsblSettingsSetOptionsSchema,
  type SpamDnsblSettingsSetOptions,
} from "./spamDnsblSettingsSetOptionsSchema.js"

/**
 * `x:SpamDnsblSettings/set` — Configures DNSBL query limits for spam filtering.
 */
export async function spamDnsblSettingsSet(
  options: SpamDnsblSettingsSetOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "spamDnsblSettingsSet"
  const parsed = a.safeParse(spamDnsblSettingsSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({ ...parsed.output, objectType: "SpamDnsblSettings" })
}
