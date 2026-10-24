import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import { jmapSetErrorCheck } from "../jmap/jmapSetErrorCheck.js"
import type { JmapSetResponse } from "../jmap/jmapSetResponse.js"
import { addressBookAccountIdResolve } from "./addressBookAccountIdResolve.js"
import { addressBookSetOptionsSchema, type AddressBookSetOptions } from "./addressBookSetOptionsSchema.js"
import type { AddressBook } from "./AddressBook.js"

/**
 * `AddressBook/set` — create, update and/or destroy address books. Sharing
 * uses `shareWith: {<accountId>: {mayRead: true, …}}`
 * (`crates/jmap/src/api/acl.rs`).
 */
export async function addressBookSet(options: AddressBookSetOptions): PromiseResult<JmapSetResponse<AddressBook>> {
  const op = "addressBookSet"
  const parsed = a.safeParse(addressBookSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const resolved = await addressBookAccountIdResolve({
    config: parsed.output.config,
    accountId: parsed.output.accountId,
  })
  if (!resolved.success) return resolved
  const response = await stalwartMethodCall<JmapSetResponse<AddressBook>>({
    config: parsed.output.config,
    session: resolved.data.session,
    methodName: "AddressBook/set",
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
