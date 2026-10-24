import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import { certificateQueryOptionsSchema, type CertificateQueryOptions } from "./certificateQueryOptionsSchema.js"

/**
 * `x:Certificate/query` — list TLS certificate and its associated private key ids with an optional filter/sort/page.
 */
export async function certificateQuery(options: CertificateQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "certificateQuery"
  const parsed = a.safeParse(certificateQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryQuery({ ...parsed.output, objectType: "Certificate" })
}
