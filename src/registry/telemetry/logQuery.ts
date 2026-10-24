import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import { type LogQueryOptions, logQueryOptionsSchema } from "./logQueryOptionsSchema.js"

/**
 * `x:Log/query` — list recent server log entry ids (newest first).
 * The server supports only the `text` free-text filter, sorting by `id`,
 * and anchor pagination (`position` must be 0)
 * (`crates/jmap/src/registry/mapping/log.rs:84-117`). Each entry carries
 * `timestamp`, `level`, `event` and `details`, so filter by level, event type
 * or time range client-side after `logGet`.
 */
export async function logQuery(options: LogQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "logQuery"
  const parsed = a.safeParse(logQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, filter, ...args } = parsed.output
  return registryQuery({
    config,
    objectType: "Log",
    ...(filter?.text !== undefined ? { filter: { text: filter.text } } : {}),
    ...args,
  })
}
