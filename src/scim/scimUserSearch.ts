import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { ScimListResponse } from "./ScimListResponse.js"
import type { ScimUser } from "./ScimUser.js"
import { scimRequest } from "./scimRequest.js"
import { scimUserSearchOptionsSchema, type ScimUserSearchOptions } from "./scimUserSearchOptionsSchema.js"

/**
 * `POST /scim/v2/Users/.search` — query users with a `SearchRequest` body
 * (RFC 7644 §3.5.2; `crates/scim/src/request.rs:116`). Unlike the `GET`
 * collection route this carries the filter in the body, so long filter
 * expressions stay out of the URL.
 */
export async function scimUserSearch(options: ScimUserSearchOptions): PromiseResult<ScimListResponse<ScimUser>> {
  const op = "scimUserSearch"
  const parsed = a.safeParse(scimUserSearchOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, filter, sortBy, sortOrder, startIndex, count, cursor, attributes, excludedAttributes } = parsed.output
  return scimRequest<ScimListResponse<ScimUser>>({
    op,
    config,
    method: "POST",
    path: "/scim/v2/Users/.search",
    body: {
      schemas: ["urn:ietf:params:scim:api:messages:2.0:SearchRequest"],
      ...(filter !== undefined ? { filter } : {}),
      ...(sortBy !== undefined ? { sortBy } : {}),
      ...(sortOrder !== undefined ? { sortOrder } : {}),
      ...(startIndex !== undefined ? { startIndex } : {}),
      ...(count !== undefined ? { count } : {}),
      ...(cursor !== undefined ? { cursor } : {}),
      ...(attributes !== undefined ? { attributes } : {}),
      ...(excludedAttributes !== undefined ? { excludedAttributes } : {}),
    },
  })
}
