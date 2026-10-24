import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { ScimGroup } from "./ScimGroup.js"
import { scimRequest } from "./scimRequest.js"
import { scimGroupPatchOptionsSchema, type ScimGroupPatchOptions } from "./scimGroupPatchOptionsSchema.js"

const scimPatchOpSchemaUrn = "urn:ietf:params:scim:api:messages:2.0:PatchOp"

/**
 * `PATCH /scim/v2/Groups/{id}` — patch a group (RFC 7644 §3.5.2; answers `200`
 * with the updated resource; `crates/scim/src/groups/patch.rs`). At least one
 * operation is required; `remove` carries no `value`.
 */
export async function scimGroupPatch(options: ScimGroupPatchOptions): PromiseResult<ScimGroup> {
  const op = "scimGroupPatch"
  const parsed = a.safeParse(scimGroupPatchOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, id, operations, attributes, excludedAttributes } = parsed.output
  return scimRequest<ScimGroup>({
    op,
    config,
    method: "PATCH",
    path: `/scim/v2/Groups/${encodeURIComponent(id)}`,
    query: {
      ...(attributes !== undefined ? { attributes: attributes.join(",") } : {}),
      ...(excludedAttributes !== undefined ? { excludedAttributes: excludedAttributes.join(",") } : {}),
    },
    body: {
      schemas: [scimPatchOpSchemaUrn],
      Operations: operations.map((operation) => ({
        op: operation.op,
        ...(operation.path !== undefined ? { path: operation.path } : {}),
        ...(operation.value !== undefined ? { value: operation.value } : {}),
      })),
    },
  })
}
