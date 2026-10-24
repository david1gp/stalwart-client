import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import type { JmapGetResponse } from "../jmap/jmapGetResponse.js"
import { addressBookAccountIdResolve } from "./addressBookAccountIdResolve.js"
import { addressBookGetOptionsSchema, type AddressBookGetOptions } from "./addressBookGetOptionsSchema.js"
import type { AddressBook } from "./AddressBook.js"

/** `AddressBook/get` — fetch address books by id. */
export async function addressBookGet(options: AddressBookGetOptions): PromiseResult<JmapGetResponse<AddressBook>> {
  const op = "addressBookGet"
  const parsed = a.safeParse(addressBookGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const resolved = await addressBookAccountIdResolve({
    config: parsed.output.config,
    accountId: parsed.output.accountId,
  })
  if (!resolved.success) return resolved
  return stalwartMethodCall<JmapGetResponse<AddressBook>>({
    config: parsed.output.config,
    session: resolved.data.session,
    methodName: "AddressBook/get",
    arguments: bodyOmitUndefined({
      accountId: resolved.data.accountId,
      ids: parsed.output.ids,
      properties: parsed.output.properties,
    }),
  })
}
