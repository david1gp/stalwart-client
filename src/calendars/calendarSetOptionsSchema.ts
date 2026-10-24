import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

const calendarPatchSchema = a.record(a.string(), a.unknown())

/**
 * `Calendar/set` arguments. `CalendarSetArguments`
 * (`crates/jmap-proto/src/object/calendar.rs:267-292`) adds
 * `onDestroyRemoveEvents` and `onSuccessSetIsDefault`.
 */
export const calendarSetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  ifInState: a.optional(a.string()),
  create: a.optional(a.record(a.string(), calendarPatchSchema)),
  update: a.optional(a.record(a.string(), calendarPatchSchema)),
  destroy: a.optional(a.array(a.string())),
  onDestroyRemoveEvents: a.optional(a.boolean()),
  onSuccessSetIsDefault: a.optional(a.string()),
})

export type CalendarSetOptions = a.InferInput<typeof calendarSetOptionsSchema>
