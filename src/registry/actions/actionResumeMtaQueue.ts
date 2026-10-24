import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import {
  actionResumeMtaQueueOptionsSchema,
  type ActionResumeMtaQueueOptions,
} from "./actionResumeMtaQueueOptionsSchema.js"
import { actionRun } from "./actionRun.js"

/**
 * Run the `ResumeMtaQueue` management action. Never run in tests unless
 * the queue was paused by the same test (it changes global delivery state).
 */
export async function actionResumeMtaQueue(options: ActionResumeMtaQueueOptions): PromiseResult<string> {
  const op = "actionResumeMtaQueue"
  const parsed = a.safeParse(actionResumeMtaQueueOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return actionRun({ ...parsed.output, action: { "@type": "ResumeMtaQueue" } })
}
