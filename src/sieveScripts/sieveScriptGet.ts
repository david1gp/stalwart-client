import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import type { JmapGetResponse } from "../jmap/jmapGetResponse.js"
import { sieveScriptAccountIdResolve } from "./sieveScriptAccountIdResolve.js"
import { sieveScriptGetOptionsSchema, type SieveScriptGetOptions } from "./sieveScriptGetOptionsSchema.js"
import type { SieveScript } from "./SieveScript.js"

/**
 * `SieveScript/get` — fetch Sieve scripts by id (properties `id`, `name`,
 * `blobId`, `isActive`; `crates/jmap-proto/src/object/sieve.rs:14-27`).
 */
export async function sieveScriptGet(options: SieveScriptGetOptions): PromiseResult<JmapGetResponse<SieveScript>> {
  const op = "sieveScriptGet"
  const parsed = a.safeParse(sieveScriptGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const resolved = await sieveScriptAccountIdResolve({
    config: parsed.output.config,
    accountId: parsed.output.accountId,
  })
  if (!resolved.success) return resolved
  return stalwartMethodCall<JmapGetResponse<SieveScript>>({
    config: parsed.output.config,
    session: resolved.data.session,
    methodName: "SieveScript/get",
    arguments: bodyOmitUndefined({
      accountId: resolved.data.accountId,
      ids: parsed.output.ids,
      properties: parsed.output.properties,
    }),
  })
}
