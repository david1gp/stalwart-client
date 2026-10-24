import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import { jmapSetErrorCheck } from "../jmap/jmapSetErrorCheck.js"
import type { JmapSetResponse } from "../jmap/jmapSetResponse.js"
import { sieveScriptAccountIdResolve } from "./sieveScriptAccountIdResolve.js"
import {
  sieveScriptActivateOptionsSchema,
  type SieveScriptActivateOptions,
} from "./sieveScriptActivateOptionsSchema.js"
import type { SieveScript } from "./SieveScript.js"

/**
 * Activate a Sieve script via `SieveScript/set` with `onSuccessActivateScript`
 * and no other changes (`crates/jmap/src/sieve/set.rs:353-388`).
 */
export async function sieveScriptActivate(
  options: SieveScriptActivateOptions,
): PromiseResult<JmapSetResponse<SieveScript>> {
  const op = "sieveScriptActivate"
  const parsed = a.safeParse(sieveScriptActivateOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const resolved = await sieveScriptAccountIdResolve({
    config: parsed.output.config,
    accountId: parsed.output.accountId,
  })
  if (!resolved.success) return resolved
  const response = await stalwartMethodCall<JmapSetResponse<SieveScript>>({
    config: parsed.output.config,
    session: resolved.data.session,
    methodName: "SieveScript/set",
    arguments: {
      accountId: resolved.data.accountId,
      onSuccessActivateScript: parsed.output.id,
    },
  })
  if (!response.success) return response
  return jmapSetErrorCheck(op, response.data)
}
