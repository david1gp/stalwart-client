import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import {
  spamFileExtensionSetOptionsSchema,
  type SpamFileExtensionSetOptions,
} from "./spamFileExtensionSetOptionsSchema.js"

/**
 * `x:SpamFileExtension/set` — Defines a file extension classification rule for spam filtering.
 */
export async function spamFileExtensionSet(
  options: SpamFileExtensionSetOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "spamFileExtensionSet"
  const parsed = a.safeParse(spamFileExtensionSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({ ...parsed.output, objectType: "SpamFileExtension" })
}
