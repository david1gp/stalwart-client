import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `DELETE /scim/v2/Users/{id}` arguments. */
export const scimUserDeleteOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  id: a.pipe(a.string(), a.minLength(1)),
})

export type ScimUserDeleteOptions = a.InferInput<typeof scimUserDeleteOptionsSchema>
