import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { ScimListResponse } from "./ScimListResponse.js"
import type { ScimResourceType } from "./ScimResourceType.js"
import { scimRequest } from "./scimRequest.js"
import { scimResourceTypesOptionsSchema, type ScimResourceTypesOptions } from "./scimResourceTypesOptionsSchema.js"

/**
 * `GET /scim/v2/ResourceTypes[/{name}]` — describe the `User` and `Group`
 * resource types (`crates/scim/src/discovery.rs:40`). Without `name` answers
 * a two-entry `ListResponse`; with `name` (`User` or `Group`) answers the
 * single definition.
 */
export async function scimResourceTypes(
  options: ScimResourceTypesOptions,
): PromiseResult<ScimListResponse<ScimResourceType> | ScimResourceType> {
  const op = "scimResourceTypes"
  const parsed = a.safeParse(scimResourceTypesOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, name } = parsed.output
  return scimRequest<ScimListResponse<ScimResourceType> | ScimResourceType>({
    op,
    config,
    method: "GET",
    path: name === undefined ? "/scim/v2/ResourceTypes" : `/scim/v2/ResourceTypes/${encodeURIComponent(name)}`,
  })
}
