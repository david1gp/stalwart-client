import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { jmapHttpRequest } from "../jmap/jmapHttpRequest.js"
import type { ManagementLoginResponse } from "./ManagementLoginResponse.js"
import { managementLoginOptionsSchema, type ManagementLoginOptions } from "./managementLoginOptionsSchema.js"

/**
 * Authenticate a user for the OAuth flows (`POST /api/auth`, anonymous).
 *
 * Issues an authorization `client_code` (`authCode`) rather than a session;
 * the web UI and device clients exchange it at `POST /auth/token`
 * (`operationId: login` in `api/v1/openapi.yml`).
 */
export async function managementLogin(options: ManagementLoginOptions): PromiseResult<ManagementLoginResponse> {
  const op = "managementLogin"
  const parsed = a.safeParse(managementLoginOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return jmapHttpRequest<ManagementLoginResponse>({
    config: parsed.output.config,
    method: "POST",
    path: "/api/auth",
    auth: false,
    body: { kind: "json", value: parsed.output.login },
  })
}
