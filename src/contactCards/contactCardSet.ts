import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import { jmapSetErrorCheck } from "../jmap/jmapSetErrorCheck.js"
import type { JmapSetResponse } from "../jmap/jmapSetResponse.js"
import { contactCardAccountIdResolve } from "./contactCardAccountIdResolve.js"
import { contactCardSetOptionsSchema, type ContactCardSetOptions } from "./contactCardSetOptionsSchema.js"
import type { ContactCard } from "./ContactCard.js"

/**
 * `ContactCard/set` — create, update and/or destroy JSContact cards (RFC 9553;
 * stored as vCard, `crates/jmap/src/contact/set.rs:175-176`).
 */
export async function contactCardSet(options: ContactCardSetOptions): PromiseResult<JmapSetResponse<ContactCard>> {
  const op = "contactCardSet"
  const parsed = a.safeParse(contactCardSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const resolved = await contactCardAccountIdResolve({
    config: parsed.output.config,
    accountId: parsed.output.accountId,
  })
  if (!resolved.success) return resolved
  const response = await stalwartMethodCall<JmapSetResponse<ContactCard>>({
    config: parsed.output.config,
    session: resolved.data.session,
    methodName: "ContactCard/set",
    arguments: bodyOmitUndefined({
      accountId: resolved.data.accountId,
      ifInState: parsed.output.ifInState,
      create: parsed.output.create,
      update: parsed.output.update,
      destroy: parsed.output.destroy,
    }),
  })
  if (!response.success) return response
  return jmapSetErrorCheck(op, response.data)
}
