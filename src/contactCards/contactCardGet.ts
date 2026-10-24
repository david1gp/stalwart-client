import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import type { JmapGetResponse } from "../jmap/jmapGetResponse.js"
import { contactCardAccountIdResolve } from "./contactCardAccountIdResolve.js"
import { contactCardGetOptionsSchema, type ContactCardGetOptions } from "./contactCardGetOptionsSchema.js"
import type { ContactCard } from "./ContactCard.js"

/** `ContactCard/get` — fetch JSContact cards by id. */
export async function contactCardGet(options: ContactCardGetOptions): PromiseResult<JmapGetResponse<ContactCard>> {
  const op = "contactCardGet"
  const parsed = a.safeParse(contactCardGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const resolved = await contactCardAccountIdResolve({
    config: parsed.output.config,
    accountId: parsed.output.accountId,
  })
  if (!resolved.success) return resolved
  return stalwartMethodCall<JmapGetResponse<ContactCard>>({
    config: parsed.output.config,
    session: resolved.data.session,
    methodName: "ContactCard/get",
    arguments: bodyOmitUndefined({
      accountId: resolved.data.accountId,
      ids: parsed.output.ids,
      properties: parsed.output.properties,
    }),
  })
}
