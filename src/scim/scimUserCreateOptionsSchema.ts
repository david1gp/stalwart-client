import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"
import { scimUserSchema } from "./scimUserSchema.js"

/** `POST /scim/v2/Users` arguments — the new `User` resource. */
export const scimUserCreateOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  user: scimUserSchema,
  attributes: a.optional(a.array(a.string())),
  excludedAttributes: a.optional(a.array(a.string())),
})

export type ScimUserCreateOptions = a.InferInput<typeof scimUserCreateOptionsSchema>
