import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `GET /api/schema` (authenticated): read the 302 `Location`, do not follow. */
export const managementSchemaRedirectOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
})

export type ManagementSchemaRedirectOptions = a.InferInput<typeof managementSchemaRedirectOptionsSchema>
