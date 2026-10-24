import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import { contactCardAccountIdResolve } from "./contactCardAccountIdResolve.js"
import { contactCardParseOptionsSchema, type ContactCardParseOptions } from "./contactCardParseOptionsSchema.js"
import type { ContactCard } from "./ContactCard.js"

/** `ContactCard/parse` response (`ParseResponse`, `crates/jmap-proto/src/method/parse.rs`). */
export type ContactCardParseResult = {
  accountId: string | number
  parsed?: Record<string, ContactCard>
  notParsable?: readonly string[]
  notFound?: readonly string[]
}

/**
 * `ContactCard/parse` — parse vCard blobs into JSContact cards
 * (`crates/jmap/src/contact/parse.rs`). Unparseable blobs land in
 * `notParsable`, missing ones in `notFound`.
 */
export async function contactCardParse(options: ContactCardParseOptions): PromiseResult<ContactCardParseResult> {
  const op = "contactCardParse"
  const parsed = a.safeParse(contactCardParseOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const resolved = await contactCardAccountIdResolve({
    config: parsed.output.config,
    accountId: parsed.output.accountId,
  })
  if (!resolved.success) return resolved
  return stalwartMethodCall<ContactCardParseResult>({
    config: parsed.output.config,
    session: resolved.data.session,
    methodName: "ContactCard/parse",
    arguments: bodyOmitUndefined({
      accountId: resolved.data.accountId,
      blobIds: parsed.output.blobIds,
      properties: parsed.output.properties,
    }),
  })
}
