import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { ScimGroup } from "./ScimGroup.js"
import type { ScimListResponse } from "./ScimListResponse.js"
import { scimRequest } from "./scimRequest.js"
import { scimGroupSearchOptionsSchema, type ScimGroupSearchOptions } from "./scimGroupSearchOptionsSchema.js"

/**
 * `POST /scim/v2/Groups/.search` — query groups with a `SearchRequest` body
 * (RFC 7644 §3.5.2; `crates/scim/src/request.rs:116`). Unlike the `GET`
 * collection route this carries the filter in the body, so long filter
 * expressions stay out of the URL.
 */
export async function scimGroupSearch(options: ScimGroupSearchOptions): PromiseResult<ScimListResponse<ScimGroup>> {
  const op = "scimGroupSearch"
  const parsed = a.safeParse(scimGroupSearchOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, filter, sortBy, sortOrder, startIndex, count, cursor, attributes, excludedAttributes } = parsed.output
  return scimRequest<ScimListResponse<ScimGroup>>({
    op,
    config,
    method: "POST",
    path: "/scim/v2/Groups/.search",
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
