import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { jmapHttpRequest } from "../jmap/jmapHttpRequest.js"
import { sseEventsParse } from "../jmap/sseEventsParse.js"
import type { SseEvent } from "../jmap/sseEvent.js"
import { liveMetricsOptionsSchema, type LiveMetricsOptions } from "./liveMetricsOptionsSchema.js"

/**
 * Read live metrics events (`GET /api/live/metrics`, authenticated).
 *
 * Collects up to `maxEvents` SSE frames and then cancels the stream (the
 * server stream itself never ends). Enterprise-only: the community build has no
 * such arm and answers a generic 404 (`crates/http/src/api/mod.rs`), which
 * surfaces as a `ResultErr` — never retried.
 */
export async function liveMetrics(options: LiveMetricsOptions): PromiseResult<SseEvent[]> {
  const op = "liveMetrics"
  const parsed = a.safeParse(liveMetricsOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, token, maxEvents } = parsed.output
  const stream = await jmapHttpRequest({
    config,
    method: "GET",
    path: "/api/live/metrics",
    query: { ...(token !== undefined ? { token } : {}) },
    responseType: "stream",
  })
  if (!stream.success) return stream
  const limit = maxEvents ?? 50
  const events: SseEvent[] = []
  try {
    for await (const event of sseEventsParse(stream.data)) {
      events.push(event)
      if (events.length >= limit) break
    }
  } catch (error) {
    return createResultError(
      op,
      "Reading the metrics stream failed",
      error instanceof Error ? error.message : String(error),
    )
  } finally {
    try {
      await stream.data.cancel()
    } catch {
      // The stream already ended; nothing to cancel.
    }
  }
  return createResult(events)
}
