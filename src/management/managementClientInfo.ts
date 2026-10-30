import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { jmapHttpRequest } from "../jmap/jmapHttpRequest.js"
import type { ManagementClientInfoResponse } from "./ManagementClientInfoResponse.js"
import {
  managementClientInfoOptionsSchema,
  type ManagementClientInfoOptions,
} from "./managementClientInfoOptionsSchema.js"

/**
 * Describe the OAuth client behind an authorization request
 * (`GET /api/auth/client`, anonymous; Stalwart v1).
 *
 * Powers the login/consent screen: pass the authorization `query` (or
 * `user_code=…` for a device flow) and render the returned client record.
 * Unknown clients and expired device codes answer the error variant instead
 * of failing the call.
 */
export async function managementClientInfo(
  options: ManagementClientInfoOptions,
): PromiseResult<ManagementClientInfoResponse> {
  const op = "managementClientInfo"
  const parsed = a.safeParse(managementClientInfoOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return jmapHttpRequest<ManagementClientInfoResponse>({
    config: parsed.output.config,
    method: "GET",
    path: `/api/auth/client?${parsed.output.query}`,
    auth: false,
  })
}
