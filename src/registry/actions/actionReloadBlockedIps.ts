import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import {
  actionReloadBlockedIpsOptionsSchema,
  type ActionReloadBlockedIpsOptions,
} from "./actionReloadBlockedIpsOptionsSchema.js"
import { actionRun } from "./actionRun.js"

/** Run the `ReloadBlockedIps` management action. Safe to run; returns the created action id. */
export async function actionReloadBlockedIps(options: ActionReloadBlockedIpsOptions): PromiseResult<string> {
  const op = "actionReloadBlockedIps"
  const parsed = a.safeParse(actionReloadBlockedIpsOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return actionRun({ ...parsed.output, action: { "@type": "ReloadBlockedIps" } })
}
