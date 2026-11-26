import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import { jmapCapabilities } from "../jmap/jmapCapabilities.js"
import { mailAccountIdResolve } from "../mailboxes/mailAccountIdResolve.js"
import type { MdnSendResponse } from "./MdnSendResponse.js"
import { type MdnSendOptions, mdnSendOptionsSchema } from "./mdnSendOptionsSchema.js"

/**
 * `MDN/send` — send message disposition notifications (RFC 9007 §4.2;
 * `crates/jmap-proto/src/method/mdn.rs:24-31`, handler at
 * `crates/jmap/src/mdn/send.rs`). `using` is core + mdn + mail: the generic
 * gate requires the `urn:ietf:params:jmap:mdn` capability and the handler
 * additionally requires `urn:ietf:params:jmap:mail`
 * (`crates/jmap/src/api/request.rs:756-770`). Account auto-resolution prefers
 * the `mdn` primary account with a `mail` primary fallback. Any `notSent`
 * entry makes the whole call a ResultErr, mirroring `jmapSetErrorCheck`
 * semantics for the standard `not*` maps.
 */
export async function mdnSend(options: MdnSendOptions): PromiseResult<MdnSendResponse> {
  const op = "mdnSend"
  const parsed = a.safeParse(mdnSendOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, accountId, ...args } = parsed.output
  if (Object.keys(args.send).length === 0) {
    return createResultError(op, "mdnSend needs a non-empty send map")
  }
  const preferred = await mailAccountIdResolve({ accountId, config, capability: jmapCapabilities.mdn })
  const resolved = preferred.success
    ? preferred
    : preferred.errorMessage.startsWith("No accountId")
      ? await mailAccountIdResolve({ accountId, config, capability: jmapCapabilities.mail })
      : preferred
  if (!resolved.success) return resolved
  const response = await stalwartMethodCall<MdnSendResponse>({
    config,
    methodName: "MDN/send",
    arguments: bodyOmitUndefined({ accountId: resolved.data.accountId, ...args }),
    ...(resolved.data.session === undefined ? {} : { session: resolved.data.session }),
  })
  if (!response.success) return response
  const notSent = response.data.notSent
  if (notSent !== undefined && Object.keys(notSent).length > 0) {
    const [id, error] = Object.entries(notSent)[0] as [string, { type: string; description?: string }]
    return createResultError(
      op,
      `MDN/send partially failed: notSent: ${id} (${error.type}${error.description ? `: ${error.description}` : ""})`,
      JSON.stringify(response.data),
    )
  }
  return createResult(response.data)
}
