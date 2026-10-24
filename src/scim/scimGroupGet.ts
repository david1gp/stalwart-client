import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { ScimGroup } from "./ScimGroup.js"
import { scimRequest } from "./scimRequest.js"
import { scimGroupGetOptionsSchema, type ScimGroupGetOptions } from "./scimGroupGetOptionsSchema.js"

/**
 * `GET /scim/v2/Groups/{id}` — fetch one group (`crates/scim/src/groups/get.rs`).
 * Unknown ids answer `404` SCIM JSON.
 */
export async function scimGroupGet(options: ScimGroupGetOptions): PromiseResult<ScimGroup> {
  const op = "scimGroupGet"
  const parsed = a.safeParse(scimGroupGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, id, attributes, excludedAttributes } = parsed.output
  return scimRequest<ScimGroup>({
    op,
    config,
    method: "GET",
    path: `/scim/v2/Groups/${encodeURIComponent(id)}`,
    query: {
      ...(attributes !== undefined ? { attributes: attributes.join(",") } : {}),
      ...(excludedAttributes !== undefined ? { excludedAttributes: excludedAttributes.join(",") } : {}),
    },
  })
}
