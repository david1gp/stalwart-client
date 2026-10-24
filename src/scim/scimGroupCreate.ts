import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { ScimGroup } from "./ScimGroup.js"
import { scimRequest } from "./scimRequest.js"
import { scimGroupCreateOptionsSchema, type ScimGroupCreateOptions } from "./scimGroupCreateOptionsSchema.js"

/**
 * `POST /scim/v2/Groups` — create a group (answers `201` with the new
 * resource; `crates/scim/src/groups/set.rs:54`).
 *
 * Needs `SysAccountCreate` on the token and the `allowScimProvisioning` flag
 * on the target domain (`crates/scim/src/groups/set.rs:248`), otherwise the
 * server answers a `403` SCIM error.
 */
export async function scimGroupCreate(options: ScimGroupCreateOptions): PromiseResult<ScimGroup> {
  const op = "scimGroupCreate"
  const parsed = a.safeParse(scimGroupCreateOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, group, attributes, excludedAttributes } = parsed.output
  return scimRequest<ScimGroup>({
    op,
    config,
    method: "POST",
    path: "/scim/v2/Groups",
    query: {
      ...(attributes !== undefined ? { attributes: attributes.join(",") } : {}),
      ...(excludedAttributes !== undefined ? { excludedAttributes: excludedAttributes.join(",") } : {}),
    },
    body: group,
  })
}
