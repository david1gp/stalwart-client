import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import {
  actionReloadSettingsOptionsSchema,
  type ActionReloadSettingsOptions,
} from "./actionReloadSettingsOptionsSchema.js"
import { actionRun } from "./actionRun.js"

/** Run the `ReloadSettings` management action. Safe to run; returns the created action id. */
export async function actionReloadSettings(options: ActionReloadSettingsOptions): PromiseResult<string> {
  const op = "actionReloadSettings"
  const parsed = a.safeParse(actionReloadSettingsOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return actionRun({ ...parsed.output, action: { "@type": "ReloadSettings" } })
}
