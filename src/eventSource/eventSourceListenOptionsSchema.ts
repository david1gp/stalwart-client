import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/**
 * `eventSourceListen` options: `GET /jmap/eventsource` query params
 * (`crates/jmap/src/api/event_source.rs:47-83`). `types` defaults to `"*"`
 * (all types), `closeafter` to `"no"` (stream until `close()`), `ping` to `0`
 * (no pings; the server clamps positive values to a minimum of 30 s outside
 * test builds). `signal` aborts the subscription client-side.
 */
export const eventSourceListenOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  types: a.optional(a.string()),
  closeafter: a.optional(a.picklist(["state", "no"])),
  ping: a.optional(a.pipe(a.number(), a.integer(), a.minValue(0))),
  signal: a.optional(a.custom<AbortSignal>((value) => value instanceof AbortSignal, "AbortSignal expected")),
})

export type EventSourceListenOptions = a.InferInput<typeof eventSourceListenOptionsSchema>
