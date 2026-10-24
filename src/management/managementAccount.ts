import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { jmapHttpRequest } from "../jmap/jmapHttpRequest.js"
import type { ManagementAccountInfo as ManagementAccountInfoResult } from "./ManagementAccountInfo.js"
import { managementAccountOptionsSchema, type ManagementAccountOptions } from "./managementAccountOptionsSchema.js"

/** Fetch the authenticated account's permissions, edition and locale. */
export async function managementAccount(options: ManagementAccountOptions): PromiseResult<ManagementAccountInfoResult> {
  const op = "managementAccount"
  const parsed = a.safeParse(managementAccountOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return jmapHttpRequest<ManagementAccountInfoResult>({
    config: parsed.output.config,
    method: "GET",
    path: "/api/account",
  })
}
