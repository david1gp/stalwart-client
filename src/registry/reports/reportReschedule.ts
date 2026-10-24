import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { type ReportRescheduleOptions, reportRescheduleOptionsSchema } from "./reportRescheduleOptionsSchema.js"

/**
 * Reschedule an outbound (internal) report by setting a future `deliverAt`.
 * The only update internal reports accept: any other patched property fails
 * with `invalidProperties`, a past timestamp fails with `invalidPatch`, and a
 * missing `deliverAt` fails as well
 * (`crates/jmap/src/registry/mapping/report.rs:42-102`).
 */
export async function reportReschedule(
  options: ReportRescheduleOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "reportReschedule"
  const parsed = a.safeParse(reportRescheduleOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, objectType, id, deliverAt, accountId } = parsed.output
  const response = await registrySet({
    config,
    objectType,
    update: { [id]: { deliverAt } },
    ...(accountId !== undefined ? { accountId } : {}),
  })
  if (!response.success) return createResultError(op, response.errorMessage, response.errorData)
  return response
}
