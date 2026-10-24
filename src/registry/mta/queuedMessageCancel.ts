import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import {
  queuedMessageCancelOptionsSchema,
  type QueuedMessageCancelOptions,
} from "./queuedMessageCancelOptionsSchema.js"
import { queuedMessageSet } from "./queuedMessageSet.js"

/**
 * Cancel a queued `x:QueuedMessage` via `/set` destroy, which removes the
 * message from the queue
 * (`crates/jmap/src/registry/mapping/queued_message.rs`, destroy path).
 */
export async function queuedMessageCancel(
  options: QueuedMessageCancelOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "queuedMessageCancel"
  const parsed = a.safeParse(queuedMessageCancelOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return queuedMessageSet({ config: parsed.output.config, destroy: [parsed.output.id] })
}
