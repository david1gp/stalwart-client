import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import { jmapAccountIdForCapability } from "../jmap/jmapAccountIdForCapability.js"
import { jmapCapabilities } from "../jmap/jmapCapabilities.js"
import { jmapSetErrorCheck } from "../jmap/jmapSetErrorCheck.js"
import type { JmapSetResponse } from "../jmap/jmapSetResponse.js"
import type { Principal } from "./Principal.js"
import { type PrincipalSetOptions, principalSetOptionsSchema } from "./principalSetOptionsSchema.js"

/**
 * `Principal/set` — create, update and/or destroy principals. Stalwart
 * currently ships no `SetRequestMethod::Principal` arm, so the server rejects
 * the whole request ("Invalid method function/object combination"); the
 * rejection surfaces here as a ResultErr.
 */
export async function principalSet(options: PrincipalSetOptions): PromiseResult<JmapSetResponse<Principal>> {
  const op = "principalSet"
  const parsed = a.safeParse(principalSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, accountId, ifInState, create, update, destroy } = parsed.output
  const resolved = await jmapAccountIdForCapability({ config, accountId, capability: jmapCapabilities.principals })
  if (!resolved.success) return resolved
  const { accountId: resolvedAccountId, session } = resolved.data
  const response = await stalwartMethodCall<JmapSetResponse<Principal>>({
    config,
    methodName: "Principal/set",
    arguments: {
      accountId: resolvedAccountId,
      ...(ifInState !== undefined ? { ifInState } : {}),
      ...(create !== undefined ? { create } : {}),
      ...(update !== undefined ? { update } : {}),
      ...(destroy !== undefined ? { destroy } : {}),
    },
    ...(session !== undefined ? { session } : {}),
  })
  if (!response.success) return response
  return jmapSetErrorCheck(op, response.data)
}
