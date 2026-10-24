import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { queuedMessageSetOptionsSchema, type QueuedMessageSetOptions } from "./queuedMessageSetOptionsSchema.js"

/**
 * `x:QueuedMessage/set` — create, update and/or destroy queued email message pending delivery.
 * Any `notCreated`/`notUpdated`/`notDestroyed` entry becomes a ResultErr.
 */
export async function queuedMessageSet(
  options: QueuedMessageSetOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "queuedMessageSet"
  const parsed = a.safeParse(queuedMessageSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({ ...parsed.output, objectType: "QueuedMessage" })
}
