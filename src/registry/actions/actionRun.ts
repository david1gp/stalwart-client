import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { registrySet } from "../registrySet.js"
import { actionRunOptionsSchema, type ActionRunOptions } from "./actionRunOptionsSchema.js"
import { actionTypes } from "./actionTypes.js"

/**
 * Run a server management action (`x:Action/set` create-only) and return
 * the created action id. Unknown `@type` values are rejected client-side
 * without a request.
 *
 * Diagnostic actions (`TroubleshootDmarc`, `ClassifySpam`) carry no id:
 * the server answers with the diagnostic result instead
 * (`crates/jmap/src/registry/mapping/action.rs:152-205`). Prefer
 * `actionTroubleshootDmarc`/`actionClassifySpam` for those; calling
 * `actionRun` with them returns a ResultErr since no id exists.
 */
export async function actionRun(options: ActionRunOptions): PromiseResult<string> {
  const op = "actionRun"
  const parsed = a.safeParse(actionRunOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const action = parsed.output.action as unknown as Record<string, unknown>
  if (typeof action["@type"] !== "string" || !(actionTypes as readonly string[]).includes(action["@type"])) {
    return createResultError(op, `Unknown action @type: ${String(action["@type"])}`)
  }
  const response = await registrySet({
    config: parsed.output.config,
    objectType: "Action",
    create: { a1: action },
    ...(parsed.output.accountId !== undefined ? { accountId: parsed.output.accountId } : {}),
  })
  if (!response.success) return response
  const id = response.data.created?.a1?.id
  if (typeof id !== "string")
    return createResultError(op, "Action created without an id", JSON.stringify(response.data))
  return createResult(id)
}
