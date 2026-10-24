import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { type ReportDestroyOptions, reportDestroyOptionsSchema } from "./reportDestroyOptionsSchema.js"

/**
 * Destroy stored reports (`x:<ReportType>/set` with `destroy`).
 * Create always fails ("Reports cannot be created") and only internal
 * reports accept an update (a future `deliverAt`, see `reportReschedule`);
 * destroy works for every report type
 * (`crates/jmap/src/registry/mapping/report.rs:36-37,113-160`).
 */
export async function reportDestroy(options: ReportDestroyOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "reportDestroy"
  const parsed = a.safeParse(reportDestroyOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, objectType, ids, accountId } = parsed.output
  const response = await registrySet({
    config,
    objectType,
    destroy: ids,
    ...(accountId !== undefined ? { accountId } : {}),
  })
  if (!response.success) return createResultError(op, response.errorMessage, response.errorData)
  return response
}
