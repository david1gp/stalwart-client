import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import { jmapAccountIdForCapability } from "../jmap/jmapAccountIdForCapability.js"
import { jmapCapabilities } from "../jmap/jmapCapabilities.js"
import type { JmapChangesResponse } from "../jmap/jmapChangesResponse.js"
import { type PrincipalChangesOptions, principalChangesOptionsSchema } from "./principalChangesOptionsSchema.js"

/** `Principal/changes` — created/updated/destroyed principal ids since a state. */
export async function principalChanges(options: PrincipalChangesOptions): PromiseResult<JmapChangesResponse> {
  const op = "principalChanges"
  const parsed = a.safeParse(principalChangesOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, accountId, sinceState, maxChanges } = parsed.output
  const resolved = await jmapAccountIdForCapability({ config, accountId, capability: jmapCapabilities.principals })
  if (!resolved.success) return resolved
  const { accountId: resolvedAccountId, session } = resolved.data
  return stalwartMethodCall<JmapChangesResponse>({
    config,
    methodName: "Principal/changes",
    arguments: {
      accountId: resolvedAccountId,
      sinceState,
      ...(maxChanges !== undefined ? { maxChanges } : {}),
    },
    ...(session !== undefined ? { session } : {}),
  })
}
