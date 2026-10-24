import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import { dkimSignatureQueryOptionsSchema, type DkimSignatureQueryOptions } from "./dkimSignatureQueryOptionsSchema.js"

/**
 * `x:DkimSignature/query` — list DKIM signature used to sign outgoing email messages ids with an optional filter/sort/page.
 */
export async function dkimSignatureQuery(options: DkimSignatureQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "dkimSignatureQuery"
  const parsed = a.safeParse(dkimSignatureQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryQuery({ ...parsed.output, objectType: "DkimSignature" })
}
