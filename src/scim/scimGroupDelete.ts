import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { scimRequest } from "./scimRequest.js"
import { scimGroupDeleteOptionsSchema, type ScimGroupDeleteOptions } from "./scimGroupDeleteOptionsSchema.js"

/**
 * `DELETE /scim/v2/Groups/{id}` — delete a group (answers `204 No Content`;
 * `crates/scim/src/groups/set.rs:203`).
 */
export async function scimGroupDelete(options: ScimGroupDeleteOptions): PromiseResult<undefined> {
  const op = "scimGroupDelete"
  const parsed = a.safeParse(scimGroupDeleteOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return scimRequest<undefined>({
    op,
    config: parsed.output.config,
    method: "DELETE",
    path: `/scim/v2/Groups/${encodeURIComponent(parsed.output.id)}`,
  })
}
