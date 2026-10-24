import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { type MailingListUpdateOptions, mailingListUpdateOptionsSchema } from "./mailingListUpdateOptionsSchema.js"

/**
 * `x:MailingList/set` update — update one directory MailingList entry by id.
 */
export async function mailingListUpdate(
  options: MailingListUpdateOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "mailingListUpdate"
  const parsed = a.safeParse(mailingListUpdateOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({
    config: parsed.output.config,
    objectType: "MailingList" as const,
    ...(parsed.output.accountId !== undefined ? { accountId: parsed.output.accountId } : {}),
    update: { [parsed.output.id]: parsed.output.patch },
  })
}
