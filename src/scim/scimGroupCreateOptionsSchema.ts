import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"
import { scimGroupSchema } from "./scimGroupSchema.js"

/** `POST /scim/v2/Groups` arguments — the new `Group` resource. */
export const scimGroupCreateOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  group: scimGroupSchema,
  attributes: a.optional(a.array(a.string())),
  excludedAttributes: a.optional(a.array(a.string())),
})

export type ScimGroupCreateOptions = a.InferInput<typeof scimGroupCreateOptionsSchema>
