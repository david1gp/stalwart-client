import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"
import { scimGroupSchema } from "./scimGroupSchema.js"

/** `PUT /scim/v2/Groups/{id}` arguments — the full replacement `Group`. */
export const scimGroupReplaceOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  id: a.pipe(a.string(), a.minLength(1)),
  group: scimGroupSchema,
  attributes: a.optional(a.array(a.string())),
  excludedAttributes: a.optional(a.array(a.string())),
})

export type ScimGroupReplaceOptions = a.InferInput<typeof scimGroupReplaceOptionsSchema>
