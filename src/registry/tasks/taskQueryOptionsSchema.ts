import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

/**
 * `x:Task/query` filter. The server only accepts `due`, `status` and `type`
 * properties here (plus `due` range variants, intersected server-side) and
 * only `due` sorting; anything else is rejected
 * (`crates/jmap/src/registry/mapping/task.rs:406-462`).
 */
export const taskQueryFilterSchema = a.object({
  due: a.optional(a.string()),
  dueIsGreaterThan: a.optional(a.string()),
  dueIsGreaterThanOrEqual: a.optional(a.string()),
  dueIsLessThan: a.optional(a.string()),
  dueIsLessThanOrEqual: a.optional(a.string()),
  status: a.optional(a.picklist(["Failed", "Pending", "Retry"])),
  type: a.optional(
    a.picklist([
      "AccountMaintenance",
      "AcmeRenewal",
      "CalendarAlarmEmail",
      "CalendarAlarmNotification",
      "CalendarItipMessage",
      "DestroyAccount",
      "DkimManagement",
      "DmarcReport",
      "DnsManagement",
      "IndexDocument",
      "IndexTrace",
      "MergeThreads",
      "RestoreArchivedItem",
      "SpamFilterMaintenance",
      "StoreMaintenance",
      "TenantMaintenance",
      "TlsReport",
      "UnindexDocument",
    ]),
  ),
})

export const taskQueryOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  filter: a.optional(taskQueryFilterSchema),
  /** Only sorting by `due` is supported server-side. */
  sort: a.optional(a.array(a.object({ property: a.literal("due"), isAscending: a.optional(a.boolean()) }))),
  position: a.optional(a.pipe(a.number(), a.integer())),
  anchor: a.optional(a.string()),
  anchorOffset: a.optional(a.pipe(a.number(), a.integer())),
  limit: a.optional(a.pipe(a.number(), a.integer(), a.minValue(0))),
  calculateTotal: a.optional(a.boolean()),
  accountId: a.optional(a.string()),
})

export type TaskQueryOptions = a.InferInput<typeof taskQueryOptionsSchema>
