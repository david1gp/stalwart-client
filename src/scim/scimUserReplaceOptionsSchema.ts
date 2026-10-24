import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"
import { scimUserSchema } from "./scimUserSchema.js"

/** `PUT /scim/v2/Users/{id}` arguments — the full replacement `User`. */
export const scimUserReplaceOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  id: a.pipe(a.string(), a.minLength(1)),
  user: scimUserSchema,
  attributes: a.optional(a.array(a.string())),
  excludedAttributes: a.optional(a.array(a.string())),
})

export type ScimUserReplaceOptions = a.InferInput<typeof scimUserReplaceOptionsSchema>
