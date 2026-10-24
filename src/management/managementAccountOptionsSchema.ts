import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `GET /api/account` (authenticated). */
export const managementAccountOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
})

export type ManagementAccountOptions = a.InferInput<typeof managementAccountOptionsSchema>
