import * as a from "valibot"
import { type PromiseResult } from "#result"
import { createResultError } from "#result"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import type { JmapSetResponse } from "../jmap/jmapSetResponse.js"
import { jmapSetErrorCheck } from "../jmap/jmapSetErrorCheck.js"
import { mailAccountIdResolve } from "../mailboxes/mailAccountIdResolve.js"
import type { Identity } from "./Identity.js"
import { type IdentitySetOptions, identitySetOptionsSchema } from "./identitySetOptionsSchema.js"

const capability = "urn:ietf:params:jmap:submission"

/**
 * `Identity/set` — create, update and/or destroy sending identities. Any
 * `not*` entry makes the whole call a ResultErr via `jmapSetErrorCheck`.
 */
export async function identitySet(options: IdentitySetOptions): PromiseResult<JmapSetResponse<Identity>> {
  const op = "identitySet"
  const parsed = a.safeParse(identitySetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, accountId, ...args } = parsed.output
  if (args.create === undefined && args.update === undefined && args.destroy === undefined) {
    return createResultError(op, "identitySet needs at least one of create, update or destroy")
  }
  const resolved = await mailAccountIdResolve({ accountId, capability, config })
  if (!resolved.success) return resolved
  const response = await stalwartMethodCall<JmapSetResponse<Identity>>({
    config,
    methodName: "Identity/set",
    arguments: Object.fromEntries(
      Object.entries({ accountId: resolved.data.accountId, ...args }).filter(([, value]) => value !== undefined),
    ),
    ...(resolved.data.session === undefined ? {} : { session: resolved.data.session }),
  })
  if (!response.success) return response
  return jmapSetErrorCheck(op, response.data)
}
