import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/**
 * `Principal/getAvailability` arguments
 * (`crates/jmap-proto/src/method/availability.rs:18-26`). Only `id` (plus
 * `baseEventId`) is supported inside `eventProperties`
 * (`crates/jmap/src/principal/availability.rs:81-90`).
 */
export const principalGetAvailabilityOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  id: a.string(),
  utcStart: a.string(),
  utcEnd: a.string(),
  showDetails: a.optional(a.boolean()),
  eventProperties: a.optional(a.array(a.string())),
})

export type PrincipalGetAvailabilityOptions = a.InferInput<typeof principalGetAvailabilityOptionsSchema>
