import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { taskFailedQueryOptionsSchema, type TaskFailedQueryOptions } from "./taskFailedQueryOptionsSchema.js"
import { taskQuery } from "./taskQuery.js"

/**
 * `x:Task` failed view — list failed background task ids
 * (`filter: { status: "Failed" }`, the `x:Task/TaskFailed` view).
 */
export async function taskFailedQuery(options: TaskFailedQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "taskFailedQuery"
  const parsed = a.safeParse(taskFailedQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, accountId, sort, position, anchor, anchorOffset, limit, calculateTotal, ...rest } = parsed.output
  return taskQuery({
    config,
    filter: { ...rest, status: "Failed" },
    ...(sort !== undefined ? { sort } : {}),
    ...(position !== undefined ? { position } : {}),
    ...(anchor !== undefined ? { anchor } : {}),
    ...(anchorOffset !== undefined ? { anchorOffset } : {}),
    ...(limit !== undefined ? { limit } : {}),
    ...(calculateTotal !== undefined ? { calculateTotal } : {}),
    ...(accountId !== undefined ? { accountId } : {}),
  })
}
