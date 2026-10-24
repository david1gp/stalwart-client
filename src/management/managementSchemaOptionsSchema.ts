import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `GET /api/schema/{hash}` (authenticated). */
export const managementSchemaOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  hash: a.pipe(a.string(), a.minLength(1)),
})

export type ManagementSchemaOptions = a.InferInput<typeof managementSchemaOptionsSchema>
