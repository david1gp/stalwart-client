import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryAddressBook } from "../generated/RegistryAddressBook.js"
import { registryGet } from "../registryGet.js"
import { sysAddressBookGetOptionsSchema, type SysAddressBookGetOptions } from "./sysAddressBookGetOptionsSchema.js"

/**
 * `x:AddressBook/get` — read the address book server settings singleton
 * (vCard limits, defaults). Prefixed with `sys` because `addressBookGet`
 * is the standard JMAP `AddressBook/get` op.
 */
export async function sysAddressBookGet(
  options: SysAddressBookGetOptions,
): PromiseResult<JmapGetResponse<RegistryAddressBook & { id: string }>> {
  const op = "sysAddressBookGet"
  const parsed = a.safeParse(sysAddressBookGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "AddressBook" })
}
