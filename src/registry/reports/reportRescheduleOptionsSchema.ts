import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

export const reportRescheduleOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  objectType: a.union([a.literal("DmarcInternalReport"), a.literal("TlsInternalReport")]),
  id: a.pipe(a.string(), a.minLength(1)),
  /** New delivery time; must be a future UTC date-time string. */
  deliverAt: a.pipe(a.string(), a.minLength(1)),
  accountId: a.optional(a.string()),
})

export type ReportRescheduleOptions = a.InferInput<typeof reportRescheduleOptionsSchema>
