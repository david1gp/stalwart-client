import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { actionUpdateAppsOptionsSchema, type ActionUpdateAppsOptions } from "./actionUpdateAppsOptionsSchema.js"
import { actionRun } from "./actionRun.js"

/**
 * Run the `UpdateApps` management action. Downloads application updates
 * from the internet; never run in tests.
 */
export async function actionUpdateApps(options: ActionUpdateAppsOptions): PromiseResult<string> {
  const op = "actionUpdateApps"
  const parsed = a.safeParse(actionUpdateAppsOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return actionRun({ ...parsed.output, action: { "@type": "UpdateApps" } })
}
