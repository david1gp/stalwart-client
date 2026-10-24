import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { ScimGroup } from "./ScimGroup.js"
import type { ScimListResponse } from "./ScimListResponse.js"
import type { ScimUser } from "./ScimUser.js"
import { scimRequest } from "./scimRequest.js"
import { scimSearchAllOptionsSchema, type ScimSearchAllOptions } from "./scimSearchAllOptionsSchema.js"

/**
 * `POST /scim/v2/.search` — search users and groups in one call
 * (`crates/scim/src/request.rs:187`, `crates/scim/src/query/mod.rs:113`).
 * Answers the usual `ListResponse` envelope mixing both resource types.
 */
export async function scimSearchAll(
  options: ScimSearchAllOptions,
): PromiseResult<ScimListResponse<ScimUser | ScimGroup>> {
  const op = "scimSearchAll"
  const parsed = a.safeParse(scimSearchAllOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, filter, sortBy, sortOrder, startIndex, count, cursor, attributes, excludedAttributes } = parsed.output
  return scimRequest<ScimListResponse<ScimUser | ScimGroup>>({
    op,
    config,
    method: "POST",
    path: "/scim/v2/.search",
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
