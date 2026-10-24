import * as a from "valibot"

/**
 * Wire shape of an SSE `state` event (`crates/jmap/src/api/event_source.rs:118-124`)
 * and a WebSocket `StateChange` push (`crates/jmap-proto/src/response/status.rs:15-18`):
 * `{"@type":"StateChange","changed":{"<accountId>":{"<DataType>":"<state>"}}}`.
 * States are opaque mod-state strings (`crates/jmap-proto/src/types/state.rs:99-106`).
 */
export const jmapStateChangeSchema = a.object({
  changed: a.record(a.string(), a.record(a.string(), a.string())),
})

export type JmapStateChange = a.InferInput<typeof jmapStateChangeSchema>
