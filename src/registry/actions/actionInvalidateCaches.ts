import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import {
  actionInvalidateCachesOptionsSchema,
  type ActionInvalidateCachesOptions,
} from "./actionInvalidateCachesOptionsSchema.js"
import { actionRun } from "./actionRun.js"

/** Run the `InvalidateCaches` management action. Safe to run; returns the created action id. */
export async function actionInvalidateCaches(options: ActionInvalidateCachesOptions): PromiseResult<string> {
  const op = "actionInvalidateCaches"
  const parsed = a.safeParse(actionInvalidateCachesOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return actionRun({ ...parsed.output, action: { "@type": "InvalidateCaches" } })
}
