import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import { jmapSetErrorCheck } from "../jmap/jmapSetErrorCheck.js"
import type { JmapSetResponse } from "../jmap/jmapSetResponse.js"
import { sieveScriptAccountIdResolve } from "./sieveScriptAccountIdResolve.js"
import { sieveScriptSetOptionsSchema, type SieveScriptSetOptions } from "./sieveScriptSetOptionsSchema.js"
import type { SieveScript } from "./SieveScript.js"

/**
 * `SieveScript/set` — create, update and/or destroy Sieve scripts. `create`
 * entries take `{name, blobId}`; `onSuccessActivateScript` activates a script
 * on success (`crates/jmap/src/sieve/set.rs:353-388`).
 */
export async function sieveScriptSet(options: SieveScriptSetOptions): PromiseResult<JmapSetResponse<SieveScript>> {
  const op = "sieveScriptSet"
  const parsed = a.safeParse(sieveScriptSetOptionsSchema, options)
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
    arguments: bodyOmitUndefined({
      accountId: resolved.data.accountId,
      ifInState: parsed.output.ifInState,
      create: parsed.output.create,
      update: parsed.output.update,
      destroy: parsed.output.destroy,
      onSuccessActivateScript: parsed.output.onSuccessActivateScript,
      onSuccessDeactivateScript: parsed.output.onSuccessDeactivateScript,
    }),
  })
  if (!response.success) return response
  return jmapSetErrorCheck(op, response.data)
}
