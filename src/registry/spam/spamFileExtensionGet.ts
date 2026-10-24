import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import { registryGet } from "../registryGet.js"
import type { RegistrySpamFileExtension } from "../generated/RegistrySpamFileExtension.js"
import {
  spamFileExtensionGetOptionsSchema,
  type SpamFileExtensionGetOptions,
} from "./spamFileExtensionGetOptionsSchema.js"

/**
 * `x:SpamFileExtension/get` — Defines a file extension classification rule for spam filtering.
 */
export async function spamFileExtensionGet(
  options: SpamFileExtensionGetOptions,
): PromiseResult<JmapGetResponse<RegistrySpamFileExtension>> {
  const op = "spamFileExtensionGet"
  const parsed = a.safeParse(spamFileExtensionGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "SpamFileExtension" })
}
