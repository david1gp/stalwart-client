import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { ScimListResponse } from "./ScimListResponse.js"
import type { ScimSchema } from "./ScimSchema.js"
import { scimRequest } from "./scimRequest.js"
import { scimSchemasOptionsSchema, type ScimSchemasOptions } from "./scimSchemasOptionsSchema.js"

/**
 * `GET /scim/v2/Schemas[/{uri}]` — describe the `User` and `Group` schemas
 * (`crates/scim/src/discovery.rs:66`). Without `id` answers a two-entry
 * `ListResponse`; with `id` (a full schema URN such as
 * `urn:ietf:params:scim:schemas:core:2.0:User`) answers the single schema.
 */
export async function scimSchemas(
  options: ScimSchemasOptions,
): PromiseResult<ScimListResponse<ScimSchema> | ScimSchema> {
  const op = "scimSchemas"
  const parsed = a.safeParse(scimSchemasOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, id } = parsed.output
  return scimRequest<ScimListResponse<ScimSchema> | ScimSchema>({
    op,
    config,
    method: "GET",
    path: id === undefined ? "/scim/v2/Schemas" : `/scim/v2/Schemas/${encodeURIComponent(id)}`,
  })
}
