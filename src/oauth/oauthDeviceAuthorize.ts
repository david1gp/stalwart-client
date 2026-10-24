import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { jmapHttpRequest } from "../jmap/jmapHttpRequest.js"
import type { OAuthDeviceAuthorization } from "./OAuthDeviceAuthorization.js"
import {
  oauthDeviceAuthorizeOptionsSchema,
  type OauthDeviceAuthorizeOptions,
} from "./oauthDeviceAuthorizeOptionsSchema.js"

/**
 * Start the OAuth device flow (`POST /auth/device`, anonymous).
 *
 * Sends `client_id` (plus optional `scope`/`nonce`) as a form body and returns
 * the `device_code` to poll plus the `user_code` for the user to approve
 * (`crates/http/src/auth/oauth/auth.rs`, `handle_device_auth`).
 */
export async function oauthDeviceAuthorize(
  options: OauthDeviceAuthorizeOptions,
): PromiseResult<OAuthDeviceAuthorization> {
  const op = "oauthDeviceAuthorize"
  const parsed = a.safeParse(oauthDeviceAuthorizeOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, clientId, scope, nonce } = parsed.output
  return jmapHttpRequest<OAuthDeviceAuthorization>({
    config,
    method: "POST",
    path: "/auth/device",
    auth: false,
    body: {
      kind: "form",
      value: {
        client_id: clientId,
        ...(scope !== undefined ? { scope } : {}),
        ...(nonce !== undefined ? { nonce } : {}),
      },
    },
  })
}
