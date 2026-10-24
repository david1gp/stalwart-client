import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import { jmapAccountIdForCapability } from "../jmap/jmapAccountIdForCapability.js"
import { jmapCapabilities } from "../jmap/jmapCapabilities.js"
import type { JmapQueryChangesResponse } from "../jmap/jmapQueryChangesResponse.js"
import {
  type PrincipalQueryChangesOptions,
  principalQueryChangesOptionsSchema,
} from "./principalQueryChangesOptionsSchema.js"

/** `Principal/queryChanges` — changes to a previous `Principal/query` result. */
export async function principalQueryChanges(
  options: PrincipalQueryChangesOptions,
): PromiseResult<JmapQueryChangesResponse> {
  const op = "principalQueryChanges"
  const parsed = a.safeParse(principalQueryChangesOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, accountId, sinceQueryState, maxChanges } = parsed.output
  const resolved = await jmapAccountIdForCapability({ config, accountId, capability: jmapCapabilities.principals })
  if (!resolved.success) return resolved
  const { accountId: resolvedAccountId, session } = resolved.data
  return stalwartMethodCall<JmapQueryChangesResponse>({
    config,
    methodName: "Principal/queryChanges",
    arguments: {
      accountId: resolvedAccountId,
      sinceQueryState,
      ...(maxChanges !== undefined ? { maxChanges } : {}),
    },
    ...(session !== undefined ? { session } : {}),
  })
}
