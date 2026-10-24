import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import { registryGet } from "../registryGet.js"
import type { RegistrySpamDnsblSettings } from "../generated/RegistrySpamDnsblSettings.js"
import {
  spamDnsblSettingsGetOptionsSchema,
  type SpamDnsblSettingsGetOptions,
} from "./spamDnsblSettingsGetOptionsSchema.js"

/**
 * `x:SpamDnsblSettings/get` — Configures DNSBL query limits for spam filtering.
 */
export async function spamDnsblSettingsGet(
  options: SpamDnsblSettingsGetOptions,
): PromiseResult<JmapGetResponse<RegistrySpamDnsblSettings>> {
  const op = "spamDnsblSettingsGet"
  const parsed = a.safeParse(spamDnsblSettingsGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "SpamDnsblSettings" })
}
