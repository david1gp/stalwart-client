import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import { type MailingListQueryOptions, mailingListQueryOptionsSchema } from "./mailingListQueryOptionsSchema.js"

/**
 * `x:MailingList/query` — list directory MailingList ids with an optional filter/sort/page.
 */
export async function mailingListQuery(options: MailingListQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "mailingListQuery"
  const parsed = a.safeParse(mailingListQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...rest } = parsed.output
  return registryQuery({ config, objectType: "MailingList" as const, ...rest })
}
