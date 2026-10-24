import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { ScimUser } from "./ScimUser.js"
import { scimRequest } from "./scimRequest.js"
import { scimUserPatchOptionsSchema, type ScimUserPatchOptions } from "./scimUserPatchOptionsSchema.js"

const scimPatchOpSchemaUrn = "urn:ietf:params:scim:api:messages:2.0:PatchOp"

/**
 * `PATCH /scim/v2/Users/{id}` — patch a user (RFC 7644 §3.5.2; answers `200`
 * with the updated resource; `crates/scim/src/users/patch.rs`). At least one
 * operation is required; `remove` carries no `value`.
 */
export async function scimUserPatch(options: ScimUserPatchOptions): PromiseResult<ScimUser> {
  const op = "scimUserPatch"
  const parsed = a.safeParse(scimUserPatchOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, id, operations, attributes, excludedAttributes } = parsed.output
  return scimRequest<ScimUser>({
    op,
    config,
    method: "PATCH",
    path: `/scim/v2/Users/${encodeURIComponent(id)}`,
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
