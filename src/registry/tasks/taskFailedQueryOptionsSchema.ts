import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

/**
 * `x:Task/TaskFailed` filtered view: the `status` filter is fixed to
 * `"Failed"` server-side (`Property::Status` + `TaskStatusType::Failed`,
 * `crates/jmap/src/registry/mapping/task.rs:429-438`).
 */
export const taskFailedQueryOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  /** Optional extra constraints merged with the fixed `status: "Failed"` filter. */
  due: a.optional(a.string()),
  dueIsGreaterThan: a.optional(a.string()),
  dueIsGreaterThanOrEqual: a.optional(a.string()),
  dueIsLessThan: a.optional(a.string()),
  dueIsLessThanOrEqual: a.optional(a.string()),
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
  sort: a.optional(a.array(a.object({ property: a.literal("due"), isAscending: a.optional(a.boolean()) }))),
  position: a.optional(a.pipe(a.number(), a.integer())),
  anchor: a.optional(a.string()),
  anchorOffset: a.optional(a.pipe(a.number(), a.integer())),
  limit: a.optional(a.pipe(a.number(), a.integer(), a.minValue(0))),
  calculateTotal: a.optional(a.boolean()),
  accountId: a.optional(a.string()),
})

export type TaskFailedQueryOptions = a.InferInput<typeof taskFailedQueryOptionsSchema>
