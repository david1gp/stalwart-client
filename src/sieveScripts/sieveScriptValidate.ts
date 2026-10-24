import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import { sieveScriptAccountIdResolve } from "./sieveScriptAccountIdResolve.js"
import {
  sieveScriptValidateOptionsSchema,
  type SieveScriptValidateOptions,
} from "./sieveScriptValidateOptionsSchema.js"

/** `SieveScript/validate` response: `error` is null when the script compiles. */
export type SieveScriptValidateResult = {
  accountId: string | number
  error?: { type: string; description?: string } | null
}

/**
 * `SieveScript/validate` — compile-check a script stored in `blobId`
 * without changing state (`crates/jmap/src/sieve/validate.rs`). Success
 * carries the envelope; inspect `error` (null means valid).
 */
export async function sieveScriptValidate(
  options: SieveScriptValidateOptions,
): PromiseResult<SieveScriptValidateResult> {
  const op = "sieveScriptValidate"
  const parsed = a.safeParse(sieveScriptValidateOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const resolved = await sieveScriptAccountIdResolve({
    config: parsed.output.config,
    accountId: parsed.output.accountId,
  })
  if (!resolved.success) return resolved
  return stalwartMethodCall<SieveScriptValidateResult>({
    config: parsed.output.config,
    session: resolved.data.session,
    methodName: "SieveScript/validate",
    arguments: {
      accountId: resolved.data.accountId,
      blobId: parsed.output.blobId,
    },
  })
}
