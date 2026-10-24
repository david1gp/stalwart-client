import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { type MailingListDestroyOptions, mailingListDestroyOptionsSchema } from "./mailingListDestroyOptionsSchema.js"

/**
 * `x:MailingList/set` destroy — destroy one directory MailingList entry by id.
 */
export async function mailingListDestroy(
  options: MailingListDestroyOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "mailingListDestroy"
  const parsed = a.safeParse(mailingListDestroyOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({
    config: parsed.output.config,
    objectType: "MailingList" as const,
    ...(parsed.output.accountId !== undefined ? { accountId: parsed.output.accountId } : {}),
    destroy: [parsed.output.id],
  })
}
