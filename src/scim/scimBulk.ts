import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { ScimBulkResponse } from "./ScimBulkResponse.js"
import { scimBulkOptionsSchema, type ScimBulkOptions } from "./scimBulkOptionsSchema.js"
import { scimRequest } from "./scimRequest.js"

const scimBulkRequestSchemaUrn = "urn:ietf:params:scim:api:messages:2.0:BulkRequest"

/**
 * `POST /scim/v2/Bulk` — run a batch of SCIM operations (RFC 7644 §3.7;
 * `crates/scim/src/bulk.rs`, `crates/scim/src/request.rs:171`). Answers `200`
 * with one entry per operation; a failed entry carries its SCIM error in
 * `response` without failing the whole call.
 */
export async function scimBulk(options: ScimBulkOptions): PromiseResult<ScimBulkResponse> {
  const op = "scimBulk"
  const parsed = a.safeParse(scimBulkOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, failOnErrors, operations } = parsed.output
  return scimRequest<ScimBulkResponse>({
    op,
    config,
    method: "POST",
    path: "/scim/v2/Bulk",
    body: {
      schemas: [scimBulkRequestSchemaUrn],
      ...(failOnErrors !== undefined ? { failOnErrors } : {}),
      Operations: operations.map((operation) => ({
        method: operation.method,
        path: operation.path,
        ...(operation.bulkId !== undefined ? { bulkId: operation.bulkId } : {}),
        ...(operation.version !== undefined ? { version: operation.version } : {}),
        ...(operation.data !== undefined ? { data: operation.data } : {}),
      })),
    },
  })
}
