import { createResult, createResultError, type PromiseResult } from "#result"
import type { SseEvent } from "./sseEvent.js"
import { sseEventsParse } from "./sseEventsParse.js"

/** Collect an SSE stream into an array (convenience for tests and one-shot reads). */
export async function sseEventsCollect(stream: ReadableStream<Uint8Array>): PromiseResult<SseEvent[]> {
  const op = "sseEventsCollect"
  try {
    const events: SseEvent[] = []
    for await (const event of sseEventsParse(stream)) events.push(event)
    return createResult(events)
  } catch (error) {
    return createResultError(op, "Reading SSE stream failed", error instanceof Error ? error.message : String(error))
  }
}
