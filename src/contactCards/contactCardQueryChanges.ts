import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import type { JmapQueryChangesResponse } from "../jmap/jmapQueryChangesResponse.js"
import { contactCardAccountIdResolve } from "./contactCardAccountIdResolve.js"
import {
  contactCardQueryChangesOptionsSchema,
  type ContactCardQueryChangesOptions,
} from "./contactCardQueryChangesOptionsSchema.js"

/**
 * `ContactCard/queryChanges` — poll query-result changes since
 * `sinceQueryState` (usually the `queryState` from a `ContactCard/query`).
 */
export async function contactCardQueryChanges(
  options: ContactCardQueryChangesOptions,
): PromiseResult<JmapQueryChangesResponse> {
  const op = "contactCardQueryChanges"
  const parsed = a.safeParse(contactCardQueryChangesOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const resolved = await contactCardAccountIdResolve({
    config: parsed.output.config,
    accountId: parsed.output.accountId,
  })
  if (!resolved.success) return resolved
  return stalwartMethodCall<JmapQueryChangesResponse>({
    config: parsed.output.config,
    session: resolved.data.session,
    methodName: "ContactCard/queryChanges",
    arguments: bodyOmitUndefined({
      accountId: resolved.data.accountId,
      sinceQueryState: parsed.output.sinceQueryState,
      filter: parsed.output.filter,
      sort: parsed.output.sort,
      maxChanges: parsed.output.maxChanges,
      calculateTotal: parsed.output.calculateTotal,
    }),
  })
}
