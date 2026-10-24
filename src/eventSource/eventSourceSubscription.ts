import type { JmapStateChange } from "./jmapStateChangeSchema.js"

/**
 * Live SSE subscription from `eventSourceListen`: iterate `stateChanges` for
 * typed `StateChange` pushes, call `close()` to terminate the stream
 * (also runs automatically when the server closes after `closeafter=state`).
 */
export type EventSourceSubscription = {
  stateChanges: AsyncIterable<JmapStateChange>
  close: () => void
}
