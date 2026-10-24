import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `GET /scim/v2/Groups/{id}` arguments. */
export const scimGroupGetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  id: a.pipe(a.string(), a.minLength(1)),
  attributes: a.optional(a.array(a.string())),
  excludedAttributes: a.optional(a.array(a.string())),
})

export type ScimGroupGetOptions = a.InferInput<typeof scimGroupGetOptionsSchema>
