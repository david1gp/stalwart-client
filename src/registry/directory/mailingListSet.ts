import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { type MailingListSetOptions, mailingListSetOptionsSchema } from "./mailingListSetOptionsSchema.js"

/**
 * `x:MailingList/set` — create, update and/or destroy directory MailingList entries.
 * Any `notCreated`/`notUpdated`/`notDestroyed` entry makes the call a ResultErr.
 */
export async function mailingListSet(options: MailingListSetOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "mailingListSet"
  const parsed = a.safeParse(mailingListSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...rest } = parsed.output
  return registrySet({ config, objectType: "MailingList" as const, ...rest })
}
