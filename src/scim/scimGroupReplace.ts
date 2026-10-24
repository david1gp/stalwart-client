import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { ScimGroup } from "./ScimGroup.js"
import { scimRequest } from "./scimRequest.js"
import { scimGroupReplaceOptionsSchema, type ScimGroupReplaceOptions } from "./scimGroupReplaceOptionsSchema.js"

/**
 * `PUT /scim/v2/Groups/{id}` — replace a group (answers `200` with the updated
 * resource; `crates/scim/src/groups/set.rs:142`). The replacement is full:
 * `displayName` stays required and omitted members are cleared.
 */
export async function scimGroupReplace(options: ScimGroupReplaceOptions): PromiseResult<ScimGroup> {
  const op = "scimGroupReplace"
  const parsed = a.safeParse(scimGroupReplaceOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, id, group, attributes, excludedAttributes } = parsed.output
  return scimRequest<ScimGroup>({
    op,
    config,
    method: "PUT",
    path: `/scim/v2/Groups/${encodeURIComponent(id)}`,
    query: {
      ...(attributes !== undefined ? { attributes: attributes.join(",") } : {}),
      ...(excludedAttributes !== undefined ? { excludedAttributes: excludedAttributes.join(",") } : {}),
    },
    body: group,
  })
}
