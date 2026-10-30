import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/**
 * `Principal/query` arguments. Filter keys
 * (`accountIds`/`email`/`name`/`text`/`type`/`timeZone`/`calendarAddress`)
 * per `crates/jmap-proto/src/object/principal.rs`. Since Stalwart v1 the
 * timezone key is spelled `timeZone` and principals can be filtered by
 * `calendarAddress`.
 */
export const principalQueryOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  filter: a.optional(a.record(a.string(), a.unknown())),
  sort: a.optional(a.array(a.object({ property: a.string(), isAscending: a.optional(a.boolean()) }))),
  position: a.optional(a.pipe(a.number(), a.integer())),
  anchor: a.optional(a.string()),
  anchorOffset: a.optional(a.pipe(a.number(), a.integer())),
  limit: a.optional(a.pipe(a.number(), a.integer(), a.minValue(0))),
  calculateTotal: a.optional(a.boolean()),
})

export type PrincipalQueryOptions = a.InferInput<typeof principalQueryOptionsSchema>
