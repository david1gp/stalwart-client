import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/**
 * `ShareNotification/set` arguments. Only `destroy` (acknowledge) works;
 * create/update always fail with `forbidden`
 * (`crates/jmap/src/share_notification/set.rs`).
 */
export const shareNotificationSetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  create: a.optional(a.record(a.string(), a.record(a.string(), a.unknown()))),
  update: a.optional(a.record(a.string(), a.record(a.string(), a.unknown()))),
  destroy: a.optional(a.array(a.string())),
})

export type ShareNotificationSetOptions = a.InferInput<typeof shareNotificationSetOptionsSchema>
