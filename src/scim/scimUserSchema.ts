import * as a from "valibot"

/**
 * Loose `User` input for create/replace: known SCIM attributes are validated
 * while extension attributes (e.g. the enterprise `User` extension) pass
 * through untouched. `userName` is required — the server rejects create and
 * replace without it (`invalidValue`, `crates/scim/src/users/set.rs`).
 */
export const scimUserSchema = a.looseObject({
  schemas: a.optional(a.array(a.string())),
  id: a.optional(a.string()),
  externalId: a.optional(a.string()),
  userName: a.pipe(a.string(), a.minLength(1)),
  name: a.optional(
    a.looseObject({
      formatted: a.optional(a.string()),
      familyName: a.optional(a.string()),
      givenName: a.optional(a.string()),
      middleName: a.optional(a.string()),
      honorificPrefix: a.optional(a.string()),
      honorificSuffix: a.optional(a.string()),
    }),
  ),
  displayName: a.optional(a.string()),
  active: a.optional(a.boolean()),
  emails: a.optional(
    a.array(
      a.looseObject({
        value: a.optional(a.string()),
        display: a.optional(a.string()),
        type: a.optional(a.string()),
        primary: a.optional(a.boolean()),
      }),
    ),
  ),
  locale: a.optional(a.string()),
  preferredLanguage: a.optional(a.string()),
  timezone: a.optional(a.string()),
  groups: a.optional(
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

export type ScimUserInput = a.InferInput<typeof scimUserSchema>
