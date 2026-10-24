import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { ScimUser } from "./ScimUser.js"
import { scimRequest } from "./scimRequest.js"
import { scimUserCreateOptionsSchema, type ScimUserCreateOptions } from "./scimUserCreateOptionsSchema.js"

/**
 * `POST /scim/v2/Users` — create a user (answers `201` with the new resource
 * plus a `Location` header; `crates/scim/src/users/set.rs:47`).
 *
 * Needs `SysAccountCreate` on the token and the `allowScimProvisioning` flag
 * on the target domain (`crates/scim/src/context.rs:130`), otherwise the
 * server answers a `403` SCIM error.
 */
export async function scimUserCreate(options: ScimUserCreateOptions): PromiseResult<ScimUser> {
  const op = "scimUserCreate"
  const parsed = a.safeParse(scimUserCreateOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, user, attributes, excludedAttributes } = parsed.output
  return scimRequest<ScimUser>({
    op,
    config,
    method: "POST",
    path: "/scim/v2/Users",
    query: {
      ...(attributes !== undefined ? { attributes: attributes.join(",") } : {}),
      ...(excludedAttributes !== undefined ? { excludedAttributes: excludedAttributes.join(",") } : {}),
    },
    body: user,
  })
}
