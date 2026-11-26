import * as a from "valibot"
import { type PromiseResult } from "#result"
import { createResultError } from "#result"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import { jmapCapabilities } from "../jmap/jmapCapabilities.js"
import { mailAccountIdResolve } from "../mailboxes/mailAccountIdResolve.js"
import type { MdnParseResponse } from "./MdnParseResponse.js"
import { type MdnParseOptions, mdnParseOptionsSchema } from "./mdnParseOptionsSchema.js"

/**
 * `MDN/parse` — parse uploaded MDN blobs into MDN objects without importing
 * them (RFC 9007 §4.3; `crates/jmap-proto/src/method/mdn.rs:47-51`, handler at
 * `crates/jmap/src/mdn/parse.rs`). `using` is core + mdn, derived from the
 * method name by `jmapMethodCapabilities`. Account auto-resolution prefers
 * the `mdn` primary account with a `mail` primary fallback. Unparsable and
 * missing blobs are reported in the response (`notParsable`/`notFound`),
 * not as a ResultErr.
 */
export async function mdnParse(options: MdnParseOptions): PromiseResult<MdnParseResponse> {
  const op = "mdnParse"
  const parsed = a.safeParse(mdnParseOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, accountId, ...args } = parsed.output
  const preferred = await mailAccountIdResolve({ accountId, config, capability: jmapCapabilities.mdn })
  const resolved = preferred.success
    ? preferred
    : preferred.errorMessage.startsWith("No accountId")
      ? await mailAccountIdResolve({ accountId, config, capability: jmapCapabilities.mail })
      : preferred
  if (!resolved.success) return resolved
  return stalwartMethodCall<MdnParseResponse>({
    config,
    methodName: "MDN/parse",
    arguments: { accountId: resolved.data.accountId, ...args },
    ...(resolved.data.session === undefined ? {} : { session: resolved.data.session }),
  })
}
