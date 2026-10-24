import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import {
  actionReloadLookupStoresOptionsSchema,
  type ActionReloadLookupStoresOptions,
} from "./actionReloadLookupStoresOptionsSchema.js"
import { actionRun } from "./actionRun.js"

/** Run the `ReloadLookupStores` management action. Returns the created action id. */
export async function actionReloadLookupStores(options: ActionReloadLookupStoresOptions): PromiseResult<string> {
  const op = "actionReloadLookupStores"
  const parsed = a.safeParse(actionReloadLookupStoresOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return actionRun({ ...parsed.output, action: { "@type": "ReloadLookupStores" } })
}
