import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/**
 * `GET /scim/v2/Schemas[/{uri}]` arguments. Omit `id` for both schemas; pass
 * a full schema URN (e.g. `urn:ietf:params:scim:schemas:core:2.0:User`) for one.
 */
export const scimSchemasOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  id: a.optional(a.pipe(a.string(), a.minLength(1))),
})

export type ScimSchemasOptions = a.InferInput<typeof scimSchemasOptionsSchema>
