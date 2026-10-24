import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { ScimGroup } from "./ScimGroup.js"
import type { ScimListResponse } from "./ScimListResponse.js"
import { scimRequest } from "./scimRequest.js"
import { scimGroupQueryOptionsSchema, type ScimGroupQueryOptions } from "./scimGroupQueryOptionsSchema.js"

/**
 * `GET /scim/v2/Groups` — list groups (RFC 7644 §3.4.2;
 * `crates/scim/src/request.rs:103`, `crates/scim/src/query/mod.rs`).
 *
 * Needs `Bearer` auth (a Stalwart API key with `ScimAccess`); HTTP Basic is
 * rejected by the server. On community servers every SCIM route answers `403`
 * SCIM JSON (`crates/scim/src/auth.rs`), which surfaces as a `ResultErr`.
 */
export async function scimGroupQuery(options: ScimGroupQueryOptions): PromiseResult<ScimListResponse<ScimGroup>> {
  const op = "scimGroupQuery"
  const parsed = a.safeParse(scimGroupQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, filter, sortBy, sortOrder, startIndex, count, cursor, attributes, excludedAttributes } = parsed.output
  return scimRequest<ScimListResponse<ScimGroup>>({
    op,
    config,
    method: "GET",
    path: "/scim/v2/Groups",
    query: {
      ...(filter !== undefined ? { filter } : {}),
      ...(sortBy !== undefined ? { sortBy } : {}),
      ...(sortOrder !== undefined ? { sortOrder } : {}),
      ...(startIndex !== undefined ? { startIndex } : {}),
      ...(count !== undefined ? { count } : {}),
      ...(cursor !== undefined ? { cursor } : {}),
      ...(attributes !== undefined ? { attributes: attributes.join(",") } : {}),
      ...(excludedAttributes !== undefined ? { excludedAttributes: excludedAttributes.join(",") } : {}),
    },
  })
}
