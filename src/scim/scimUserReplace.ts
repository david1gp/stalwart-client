import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { ScimUser } from "./ScimUser.js"
import { scimRequest } from "./scimRequest.js"
import { scimUserReplaceOptionsSchema, type ScimUserReplaceOptions } from "./scimUserReplaceOptionsSchema.js"

/**
 * `PUT /scim/v2/Users/{id}` — replace a user (answers `200` with the updated
 * resource; `crates/scim/src/users/set.rs:107`). The replacement is full:
 * `userName` stays required and omitted attributes reset to their defaults.
 */
export async function scimUserReplace(options: ScimUserReplaceOptions): PromiseResult<ScimUser> {
  const op = "scimUserReplace"
  const parsed = a.safeParse(scimUserReplaceOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, id, user, attributes, excludedAttributes } = parsed.output
  return scimRequest<ScimUser>({
    op,
    config,
    method: "PUT",
    path: `/scim/v2/Users/${encodeURIComponent(id)}`,
    query: {
      ...(attributes !== undefined ? { attributes: attributes.join(",") } : {}),
      ...(excludedAttributes !== undefined ? { excludedAttributes: excludedAttributes.join(",") } : {}),
    },
    body: user,
  })
}
