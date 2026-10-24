import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import type { JmapChangesResponse } from "../jmap/jmapChangesResponse.js"
import { contactCardAccountIdResolve } from "./contactCardAccountIdResolve.js"
import { contactCardChangesOptionsSchema, type ContactCardChangesOptions } from "./contactCardChangesOptionsSchema.js"

/**
 * `ContactCard/changes` — poll contact card changes since `sinceState`
 * (usually the `state` from a previous `ContactCard/get`).
 */
export async function contactCardChanges(options: ContactCardChangesOptions): PromiseResult<JmapChangesResponse> {
  const op = "contactCardChanges"
  const parsed = a.safeParse(contactCardChangesOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const resolved = await contactCardAccountIdResolve({
    config: parsed.output.config,
    accountId: parsed.output.accountId,
  })
  if (!resolved.success) return resolved
  return stalwartMethodCall<JmapChangesResponse>({
    config: parsed.output.config,
    session: resolved.data.session,
    methodName: "ContactCard/changes",
    arguments: bodyOmitUndefined({
      accountId: resolved.data.accountId,
      sinceState: parsed.output.sinceState,
      maxChanges: parsed.output.maxChanges,
    }),
  })
}
