import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `GET /scim/v2/Users/{id}` arguments. */
export const scimUserGetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  id: a.pipe(a.string(), a.minLength(1)),
  attributes: a.optional(a.array(a.string())),
  excludedAttributes: a.optional(a.array(a.string())),
})

export type ScimUserGetOptions = a.InferInput<typeof scimUserGetOptionsSchema>
