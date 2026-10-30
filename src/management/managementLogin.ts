import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { jmapHttpRequest } from "../jmap/jmapHttpRequest.js"
import type { ManagementLoginResponse } from "./ManagementLoginResponse.js"
import { managementLoginOptionsSchema, type ManagementLoginOptions } from "./managementLoginOptionsSchema.js"

/**
 * Authenticate a user for the OAuth flows (`POST /api/auth`, anonymous).
 *
 * `authCode` logins answer `authenticated` with a redirect `location`
 * carrying `?code=&state=&iss=`; exchange the `code` at `POST /auth/token`.
 * `authDevice` approvals answer `verified`; consent-gated logins answer
 * `consentRequired` with a `token` for a follow-up `authConsent` login
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
