import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import { taskQueryOptionsSchema, type TaskQueryOptions } from "./taskQueryOptionsSchema.js"

/**
 * `x:Task/query` — list background task ids. Unlike the generic
 * `registryQuery`, only `due`/`status`/`type` filters and `due` sorting
 * are accepted, matching the server's special task mapping
 * (`crates/jmap/src/registry/mapping/task.rs:399-462`).
 */
export async function taskQuery(options: TaskQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "taskQuery"
  const parsed = a.safeParse(taskQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryQuery({ ...parsed.output, objectType: "Task" })
}
