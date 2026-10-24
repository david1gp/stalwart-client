import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import type { JmapChangesResponse } from "../jmap/jmapChangesResponse.js"
import { addressBookAccountIdResolve } from "./addressBookAccountIdResolve.js"
import { addressBookChangesOptionsSchema, type AddressBookChangesOptions } from "./addressBookChangesOptionsSchema.js"

/**
 * `AddressBook/changes` — poll address book changes since `sinceState`
 * (usually the `state` from a previous `AddressBook/get`).
 */
export async function addressBookChanges(options: AddressBookChangesOptions): PromiseResult<JmapChangesResponse> {
  const op = "addressBookChanges"
  const parsed = a.safeParse(addressBookChangesOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const resolved = await addressBookAccountIdResolve({
    config: parsed.output.config,
    accountId: parsed.output.accountId,
  })
  if (!resolved.success) return resolved
  return stalwartMethodCall<JmapChangesResponse>({
    config: parsed.output.config,
    session: resolved.data.session,
    methodName: "AddressBook/changes",
    arguments: bodyOmitUndefined({
      accountId: resolved.data.accountId,
      sinceState: parsed.output.sinceState,
      maxChanges: parsed.output.maxChanges,
    }),
  })
}
