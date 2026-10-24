import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import type { JmapQueryResponse } from "../jmap/jmapQueryResponse.js"
import { contactCardAccountIdResolve } from "./contactCardAccountIdResolve.js"
import { contactCardQueryOptionsSchema, type ContactCardQueryOptions } from "./contactCardQueryOptionsSchema.js"

/** `ContactCard/query` — list contact card ids. */
export async function contactCardQuery(options: ContactCardQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "contactCardQuery"
  const parsed = a.safeParse(contactCardQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const resolved = await contactCardAccountIdResolve({
    config: parsed.output.config,
    accountId: parsed.output.accountId,
  })
  if (!resolved.success) return resolved
  return stalwartMethodCall<JmapQueryResponse>({
    config: parsed.output.config,
    session: resolved.data.session,
    methodName: "ContactCard/query",
    arguments: bodyOmitUndefined({
      accountId: resolved.data.accountId,
      filter: parsed.output.filter,
      sort: parsed.output.sort,
      position: parsed.output.position,
      limit: parsed.output.limit,
      calculateTotal: parsed.output.calculateTotal,
    }),
  })
}
