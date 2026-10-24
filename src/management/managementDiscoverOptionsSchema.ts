import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `GET /api/discover/{email}` (anonymous). */
export const managementDiscoverOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  email: a.pipe(a.string(), a.minLength(1)),
})

export type ManagementDiscoverOptions = a.InferInput<typeof managementDiscoverOptionsSchema>
