import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { spamSettingsSetOptionsSchema, type SpamSettingsSetOptions } from "./spamSettingsSetOptionsSchema.js"

/**
 * `x:SpamSettings/set` — Configures global spam filter thresholds, greylisting, and trust settings.
 */
export async function spamSettingsSet(
  options: SpamSettingsSetOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "spamSettingsSet"
  const parsed = a.safeParse(spamSettingsSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({ ...parsed.output, objectType: "SpamSettings" })
}
