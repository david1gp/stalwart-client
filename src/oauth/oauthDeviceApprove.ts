import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { jmapHttpRequest } from "../jmap/jmapHttpRequest.js"
import type { ManagementLoginResponse } from "../management/ManagementLoginResponse.js"
import { oauthDeviceApproveOptionsSchema, type OauthDeviceApproveOptions } from "./oauthDeviceApproveOptionsSchema.js"

/**
 * Approve a pending device authorization (`POST /api/auth`, anonymous).
 *
 * Posts the `authDevice` login request (`LoginRequest::AuthDevice` in
 * `crates/http/src/auth/oauth/auth.rs`): on valid credentials the device code
 * flips to `Authorized` and the response is `{type: "verified"}`.
 */
export async function oauthDeviceApprove(options: OauthDeviceApproveOptions): PromiseResult<ManagementLoginResponse> {
  const op = "oauthDeviceApprove"
  const parsed = a.safeParse(oauthDeviceApproveOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, accountName, accountSecret, code, mfaToken } = parsed.output
  return jmapHttpRequest<ManagementLoginResponse>({
    config,
    method: "POST",
    path: "/api/auth",
    auth: false,
    body: {
      kind: "json",
      value: {
        type: "authDevice",
        accountName,
        accountSecret,
        code,
        ...(mfaToken !== undefined ? { mfaToken } : {}),
      },
    },
  })
}
