import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import { registryGet } from "../registryGet.js"
import type { RegistrySpamSettings } from "../generated/RegistrySpamSettings.js"
import { spamSettingsGetOptionsSchema, type SpamSettingsGetOptions } from "./spamSettingsGetOptionsSchema.js"

/**
 * `x:SpamSettings/get` — Configures global spam filter thresholds, greylisting, and trust settings.
 */
export async function spamSettingsGet(
  options: SpamSettingsGetOptions,
): PromiseResult<JmapGetResponse<RegistrySpamSettings>> {
  const op = "spamSettingsGet"
  const parsed = a.safeParse(spamSettingsGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "SpamSettings" })
}
