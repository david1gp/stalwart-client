import * as a from "valibot"
import { type PromiseResult } from "#result"
import { createResultError } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import type { JmapGetResponse } from "../jmap/jmapGetResponse.js"
import { mailAccountIdResolve } from "../mailboxes/mailAccountIdResolve.js"
import type { SearchSnippet } from "./SearchSnippet.js"
import { type SearchSnippetGetOptions, searchSnippetGetOptionsSchema } from "./searchSnippetGetOptionsSchema.js"

const capability = "urn:ietf:params:jmap:mail"

/** `SearchSnippet/get` — subject/preview snippets for the given email ids. */
export async function searchSnippetGet(
  options: SearchSnippetGetOptions,
): PromiseResult<JmapGetResponse<SearchSnippet>> {
  const op = "searchSnippetGet"
  const parsed = a.safeParse(searchSnippetGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, accountId, ...args } = parsed.output
  const resolved = await mailAccountIdResolve({ accountId, capability, config })
  if (!resolved.success) return resolved
  return stalwartMethodCall<JmapGetResponse<SearchSnippet>>({
    config,
    methodName: "SearchSnippet/get",
    arguments: bodyOmitUndefined({ accountId: resolved.data.accountId, ...args }),
    ...(resolved.data.session === undefined ? {} : { session: resolved.data.session }),
  })
}
