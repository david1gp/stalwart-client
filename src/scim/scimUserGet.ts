import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { ScimUser } from "./ScimUser.js"
import { scimRequest } from "./scimRequest.js"
import { scimUserGetOptionsSchema, type ScimUserGetOptions } from "./scimUserGetOptionsSchema.js"

/**
 * `GET /scim/v2/Users/{id}` — fetch one user (`crates/scim/src/users/get.rs`).
 * Unknown ids answer `404` SCIM JSON.
 */
export async function scimUserGet(options: ScimUserGetOptions): PromiseResult<ScimUser> {
  const op = "scimUserGet"
  const parsed = a.safeParse(scimUserGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, id, attributes, excludedAttributes } = parsed.output
  return scimRequest<ScimUser>({
    op,
    config,
    method: "GET",
    path: `/scim/v2/Users/${encodeURIComponent(id)}`,
    query: {
      ...(attributes !== undefined ? { attributes: attributes.join(",") } : {}),
      ...(excludedAttributes !== undefined ? { excludedAttributes: excludedAttributes.join(",") } : {}),
    },
  })
}
