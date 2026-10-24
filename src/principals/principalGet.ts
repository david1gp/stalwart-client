import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import { jmapAccountIdForCapability } from "../jmap/jmapAccountIdForCapability.js"
import { jmapCapabilities } from "../jmap/jmapCapabilities.js"
import type { JmapGetResponse } from "../jmap/jmapGetResponse.js"
import type { Principal } from "./Principal.js"
import { type PrincipalGetOptions, principalGetOptionsSchema } from "./principalGetOptionsSchema.js"

/** `Principal/get` — fetch principals by id. */
export async function principalGet(options: PrincipalGetOptions): PromiseResult<JmapGetResponse<Principal>> {
  const op = "principalGet"
  const parsed = a.safeParse(principalGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, accountId, ids, properties } = parsed.output
  const resolved = await jmapAccountIdForCapability({ config, accountId, capability: jmapCapabilities.principals })
  if (!resolved.success) return resolved
  const { accountId: resolvedAccountId, session } = resolved.data
  return stalwartMethodCall<JmapGetResponse<Principal>>({
    config,
    methodName: "Principal/get",
    arguments: {
      accountId: resolvedAccountId,
      ...(ids !== undefined ? { ids } : {}),
      ...(properties !== undefined ? { properties } : {}),
    },
    ...(session !== undefined ? { session } : {}),
  })
}
