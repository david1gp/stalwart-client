import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `Calendar/get` arguments. */
export const calendarGetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  ids: a.optional(a.array(a.string())),
  properties: a.optional(a.array(a.string())),
})

export type CalendarGetOptions = a.InferInput<typeof calendarGetOptionsSchema>
