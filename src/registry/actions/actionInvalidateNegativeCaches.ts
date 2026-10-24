import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import {
  actionInvalidateNegativeCachesOptionsSchema,
  type ActionInvalidateNegativeCachesOptions,
} from "./actionInvalidateNegativeCachesOptionsSchema.js"
import { actionRun } from "./actionRun.js"

/** Run the `InvalidateNegativeCaches` management action. Safe to run; returns the created action id. */
export async function actionInvalidateNegativeCaches(
  options: ActionInvalidateNegativeCachesOptions,
): PromiseResult<string> {
  const op = "actionInvalidateNegativeCaches"
  const parsed = a.safeParse(actionInvalidateNegativeCachesOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return actionRun({ ...parsed.output, action: { "@type": "InvalidateNegativeCaches" } })
}
