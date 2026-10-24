import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

/** Options for `mtaDeliveryScheduleGet` (`x:MtaDeliverySchedule/get`). */
export const mtaDeliveryScheduleGetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  ids: a.optional(a.array(a.string())),
  properties: a.optional(a.array(a.string())),
  accountId: a.optional(a.string()),
})

export type MtaDeliveryScheduleGetOptions = a.InferInput<typeof mtaDeliveryScheduleGetOptionsSchema>
