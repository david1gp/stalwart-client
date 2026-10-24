import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import {
  actionPauseMtaQueueOptionsSchema,
  type ActionPauseMtaQueueOptions,
} from "./actionPauseMtaQueueOptionsSchema.js"
import { actionRun } from "./actionRun.js"

/**
 * Run the `PauseMtaQueue` management action. Pauses queue processing;
 * never run in tests (it stalls delivery for every other agent).
 */
export async function actionPauseMtaQueue(options: ActionPauseMtaQueueOptions): PromiseResult<string> {
  const op = "actionPauseMtaQueue"
  const parsed = a.safeParse(actionPauseMtaQueueOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return actionRun({ ...parsed.output, action: { "@type": "PauseMtaQueue" } })
}
