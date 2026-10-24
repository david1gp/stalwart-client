import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/**
 * `GET /scim/v2/ResourceTypes[/{name}]` arguments. Omit `name` for both
 * definitions; pass `User` or `Group` for one.
 */
export const scimResourceTypesOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  name: a.optional(a.picklist(["User", "Group"])),
})

export type ScimResourceTypesOptions = a.InferInput<typeof scimResourceTypesOptionsSchema>
