import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryMailingList } from "../generated/RegistryMailingList.js"
import { registryGet } from "../registryGet.js"
import { type MailingListGetOptions, mailingListGetOptionsSchema } from "./mailingListGetOptionsSchema.js"

/**
 * `x:MailingList/get` — fetch directory MailingList entries by id.
 */
export async function mailingListGet(
  options: MailingListGetOptions,
): PromiseResult<JmapGetResponse<RegistryMailingList & { id: string }>> {
  const op = "mailingListGet"
  const parsed = a.safeParse(mailingListGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...rest } = parsed.output
  return registryGet({ config, objectType: "MailingList" as const, ...rest })
}
