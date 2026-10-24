import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { jmapHttpRequest } from "../jmap/jmapHttpRequest.js"
import { sseEventsParse } from "../jmap/sseEventsParse.js"
import type { LiveDeliveryStage } from "./LiveDeliveryStage.js"
import { liveDeliveryOptionsSchema, type LiveDeliveryOptions } from "./liveDeliveryOptionsSchema.js"

/**
 * Stream outbound-delivery diagnostics for a domain or email address
 * (`GET /api/live/delivery/{target}`, authenticated, read-only).
 *
 * Collects the SSE frames into typed stages (`DeliveryStage` in
 * `crates/http/src/api/diagnose.rs`; each frame is `data: [<stage>]`) until
 * the final `{type: "completed"}` frame or `maxEvents`.
 */
export async function liveDelivery(options: LiveDeliveryOptions): PromiseResult<LiveDeliveryStage[]> {
  const op = "liveDelivery"
  const parsed = a.safeParse(liveDeliveryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, target, timeout, token, maxEvents } = parsed.output
  const stream = await jmapHttpRequest({
    config,
    method: "GET",
    path: `/api/live/delivery/${encodeURIComponent(target)}`,
    query: {
      ...(timeout !== undefined ? { timeout } : {}),
      ...(token !== undefined ? { token } : {}),
    },
    responseType: "stream",
  })
  if (!stream.success) return stream
  const limit = maxEvents ?? 500
  const stages: LiveDeliveryStage[] = []
  try {
    for await (const event of sseEventsParse(stream.data)) {
      let frame: unknown
      try {
        frame = JSON.parse(event.data) as unknown
      } catch (error) {
        return createResultError(
          op,
          "Delivery stream frame was not JSON",
          error instanceof Error ? error.message : String(error),
        )
      }
      const stage = (Array.isArray(frame) ? frame[0] : frame) as LiveDeliveryStage
      stages.push(stage)
      if (stage?.type === "completed" || stages.length >= limit) break
    }
  } catch (error) {
    return createResultError(
      op,
      "Reading the delivery stream failed",
      error instanceof Error ? error.message : String(error),
    )
  } finally {
    try {
      await stream.data.cancel()
    } catch {
      // The stream already ended; nothing to cancel.
    }
  }
  return createResult(stages)
}
