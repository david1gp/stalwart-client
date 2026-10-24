import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import type { JmapQueryResponse } from "../jmap/jmapQueryResponse.js"
import { addressBookAccountIdResolve } from "./addressBookAccountIdResolve.js"
import { addressBookQueryOptionsSchema, type AddressBookQueryOptions } from "./addressBookQueryOptionsSchema.js"

/** `AddressBook/query` — list address book ids. */
export async function addressBookQuery(options: AddressBookQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "addressBookQuery"
  const parsed = a.safeParse(addressBookQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const resolved = await addressBookAccountIdResolve({
    config: parsed.output.config,
    accountId: parsed.output.accountId,
  })
  if (!resolved.success) return resolved
  return stalwartMethodCall<JmapQueryResponse>({
    config: parsed.output.config,
    session: resolved.data.session,
    methodName: "AddressBook/query",
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
