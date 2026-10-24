import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `PATCH /scim/v2/Users/{id}` arguments — RFC 7644 §3.5.2 operations. */
export const scimUserPatchOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  id: a.pipe(a.string(), a.minLength(1)),
  operations: a.pipe(
    a.array(
      a.object({
        op: a.picklist(["add", "remove", "replace"]),
        path: a.optional(a.string()),
        value: a.optional(a.unknown()),
      }),
    ),
    a.minLength(1),
  ),
  attributes: a.optional(a.array(a.string())),
  excludedAttributes: a.optional(a.array(a.string())),
})

export type ScimUserPatchOptions = a.InferInput<typeof scimUserPatchOptionsSchema>
