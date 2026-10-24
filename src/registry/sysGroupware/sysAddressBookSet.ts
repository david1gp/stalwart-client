import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { sysAddressBookSetOptionsSchema, type SysAddressBookSetOptions } from "./sysAddressBookSetOptionsSchema.js"

/**
 * `x:AddressBook/set` — patch the address book server settings singleton.
 * Prefixed with `sys` because `addressBookSet` is the standard JMAP
 * `AddressBook/set` op. Any `notUpdated` entry becomes a ResultErr
 * via `jmapSetErrorCheck`.
 */
export async function sysAddressBookSet(
  options: SysAddressBookSetOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "sysAddressBookSet"
  const parsed = a.safeParse(sysAddressBookSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const response = await registrySet({
    config: parsed.output.config,
    objectType: "AddressBook",
    update: { singleton: parsed.output.patch },
    ...(parsed.output.accountId !== undefined ? { accountId: parsed.output.accountId } : {}),
  })
  if (!response.success) return createResultError(op, response.errorMessage, response.errorData)
  return response
}
