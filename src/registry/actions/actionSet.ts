import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { actionSetOptionsSchema, type ActionSetOptions } from "./actionSetOptionsSchema.js"

/**
 * `x:Action/set` — raw create/update/destroy passthrough. Actions are
 * create-only server-side: every `update`/`destroy` entry fails with
 * "Actions cannot be updated/destroyed" and becomes a ResultErr via
 * `jmapSetErrorCheck` (`crates/jmap/src/registry/mapping/action.rs:43-45`).
 * Prefer the typed `actionRun` and its shortcuts.
 */
export async function actionSet(options: ActionSetOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "actionSet"
  const parsed = a.safeParse(actionSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const response = await registrySet({ ...parsed.output, objectType: "Action" })
  if (!response.success) return createResultError(op, response.errorMessage, response.errorData)
  return response
}
