import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { ScimListResponse } from "./ScimListResponse.js"
import type { ScimUser } from "./ScimUser.js"
import { scimRequest } from "./scimRequest.js"
import { scimUserQueryOptionsSchema, type ScimUserQueryOptions } from "./scimUserQueryOptionsSchema.js"

/**
 * `GET /scim/v2/Users` — list users (RFC 7644 §3.4.2;
 * `crates/scim/src/request.rs:103`, `crates/scim/src/query/mod.rs`).
 *
 * Needs `Bearer` auth (a Stalwart API key with `ScimAccess`); HTTP Basic is
 * rejected by the server. On community servers every SCIM route answers `403`
 * SCIM JSON (`crates/scim/src/auth.rs`), which surfaces as a `ResultErr`.
 */
export async function scimUserQuery(options: ScimUserQueryOptions): PromiseResult<ScimListResponse<ScimUser>> {
  const op = "scimUserQuery"
  const parsed = a.safeParse(scimUserQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, filter, sortBy, sortOrder, startIndex, count, cursor, attributes, excludedAttributes } = parsed.output
  return scimRequest<ScimListResponse<ScimUser>>({
    op,
    config,
    method: "GET",
    path: "/scim/v2/Users",
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
