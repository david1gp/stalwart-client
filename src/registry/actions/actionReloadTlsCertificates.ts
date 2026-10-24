import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import {
  actionReloadTlsCertificatesOptionsSchema,
  type ActionReloadTlsCertificatesOptions,
} from "./actionReloadTlsCertificatesOptionsSchema.js"
import { actionRun } from "./actionRun.js"

/**
 * Run the `ReloadTlsCertificates` management action. Reloads certificates
 * on live listeners; never run against a live instance in tests.
 */
export async function actionReloadTlsCertificates(options: ActionReloadTlsCertificatesOptions): PromiseResult<string> {
  const op = "actionReloadTlsCertificates"
  const parsed = a.safeParse(actionReloadTlsCertificatesOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return actionRun({ ...parsed.output, action: { "@type": "ReloadTlsCertificates" } })
}
