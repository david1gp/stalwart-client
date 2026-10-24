import * as a from "valibot"
import { type PromiseResult } from "#result"
import { createResultError } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import type { JmapGetResponse } from "../jmap/jmapGetResponse.js"
import { mailAccountIdResolve } from "../mailboxes/mailAccountIdResolve.js"
import type { Identity } from "./Identity.js"
import { type IdentityGetOptions, identityGetOptionsSchema } from "./identityGetOptionsSchema.js"

const capability = "urn:ietf:params:jmap:submission"

/** `Identity/get` — fetch sending identities (always resolve before send: ids are unstable). */
export async function identityGet(options: IdentityGetOptions): PromiseResult<JmapGetResponse<Identity>> {
  const op = "identityGet"
  const parsed = a.safeParse(identityGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, accountId, ...args } = parsed.output
  const resolved = await mailAccountIdResolve({ accountId, capability, config })
  if (!resolved.success) return resolved
  return stalwartMethodCall<JmapGetResponse<Identity>>({
    config,
    methodName: "Identity/get",
    arguments: bodyOmitUndefined({ accountId: resolved.data.accountId, ...args }),
    ...(resolved.data.session === undefined ? {} : { session: resolved.data.session }),
  })
}
