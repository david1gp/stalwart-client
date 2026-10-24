import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { queuedMessageRetryOptionsSchema, type QueuedMessageRetryOptions } from "./queuedMessageRetryOptionsSchema.js"
import { queuedMessageSet } from "./queuedMessageSet.js"

/**
 * Reschedule a queued `x:QueuedMessage` by patching `nextRetry` (defaults to
 * now, i.e. retry immediately). Patching `nextRetry` moves each scheduled
 * recipient's retry-due timestamp and refreshes the queue
 * (`crates/jmap/src/registry/mapping/queued_message.rs`, update path).
 */
export async function queuedMessageRetry(
  options: QueuedMessageRetryOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "queuedMessageRetry"
  const parsed = a.safeParse(queuedMessageRetryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return queuedMessageSet({
    config: parsed.output.config,
    update: { [parsed.output.id]: { nextRetry: parsed.output.nextRetry ?? new Date().toISOString() } },
  })
}
