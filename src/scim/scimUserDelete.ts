import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { scimRequest } from "./scimRequest.js"
import { scimUserDeleteOptionsSchema, type ScimUserDeleteOptions } from "./scimUserDeleteOptionsSchema.js"

/**
 * `DELETE /scim/v2/Users/{id}` — delete a user (answers `204 No Content`;
 * `crates/scim/src/users/set.rs:190`). A SCIM client cannot delete its own
 * service principal (`crates/scim/src/auth.rs:81`).
 */
export async function scimUserDelete(options: ScimUserDeleteOptions): PromiseResult<undefined> {
  const op = "scimUserDelete"
  const parsed = a.safeParse(scimUserDeleteOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return scimRequest<undefined>({
    op,
    config: parsed.output.config,
    method: "DELETE",
    path: `/scim/v2/Users/${encodeURIComponent(parsed.output.id)}`,
  })
}
