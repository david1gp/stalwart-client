import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `DELETE /scim/v2/Groups/{id}` arguments. */
export const scimGroupDeleteOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  id: a.pipe(a.string(), a.minLength(1)),
})

export type ScimGroupDeleteOptions = a.InferInput<typeof scimGroupDeleteOptionsSchema>
