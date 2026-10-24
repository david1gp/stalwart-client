import * as a from "valibot"

/**
 * Loose `Group` input for create/replace: known SCIM attributes are validated
 * while extension attributes pass through untouched. `displayName` is required
 * and unique server-wide — the server rejects create and replace without it
 * (`invalidValue`) and duplicates with a `uniqueness` SCIM error
 * (`crates/scim/src/groups/set.rs`, `crates/scim/src/error.rs`).
 */
export const scimGroupSchema = a.looseObject({
  schemas: a.optional(a.array(a.string())),
  id: a.optional(a.string()),
  externalId: a.optional(a.string()),
  displayName: a.pipe(a.string(), a.minLength(1)),
  members: a.optional(
    a.array(
      a.looseObject({
        value: a.optional(a.string()),
        $ref: a.optional(a.string()),
        display: a.optional(a.string()),
        type: a.optional(a.string()),
      }),
    ),
  ),
  meta: a.optional(
    a.looseObject({
      resourceType: a.optional(a.string()),
      created: a.optional(a.string()),
      lastModified: a.optional(a.string()),
      location: a.optional(a.string()),
      version: a.optional(a.string()),
    }),
  ),
})

export type ScimGroupInput = a.InferInput<typeof scimGroupSchema>
