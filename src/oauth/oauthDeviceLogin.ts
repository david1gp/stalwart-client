import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { OAuthTokenGranted } from "./OAuthTokenGranted.js"
import { oauthDeviceApprove } from "./oauthDeviceApprove.js"
import { oauthDeviceAuthorize } from "./oauthDeviceAuthorize.js"
import { oauthToken } from "./oauthToken.js"
import { oauthDeviceLoginOptionsSchema, type OauthDeviceLoginOptions } from "./oauthDeviceLoginOptionsSchema.js"

function oauthTokenErrorCode(errorData: string | null | undefined): string | undefined {
  if (!errorData) return undefined
  try {
    const body = JSON.parse(errorData) as { error?: unknown }
    return typeof body.error === "string" ? body.error : undefined
  } catch {
    return undefined
  }
}

/**
 * Full OAuth device login as tokens.
 *
 * Starts the flow with `oauthDeviceAuthorize`, approves the `user_code` with
 * the account credentials (`oauthDeviceApprove`, i.e. `POST /api/auth` type
 * `authDevice`), then polls `POST /auth/token` (`device_code` grant) until
 * the server issues tokens. `authorization_pending`/`slow_down` responses
 * continue the loop; any other token error ends it.
 */
export async function oauthDeviceLogin(options: OauthDeviceLoginOptions): PromiseResult<OAuthTokenGranted> {
  const op = "oauthDeviceLogin"
  const parsed = a.safeParse(oauthDeviceLoginOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, clientId, accountName, accountSecret, scope, nonce, consent } = parsed.output
  const maxAttempts = parsed.output.maxAttempts ?? 12
  const authorize = await oauthDeviceAuthorize({
    config,
    clientId,
    ...(scope !== undefined ? { scope } : {}),
    ...(nonce !== undefined ? { nonce } : {}),
  })
  if (!authorize.success) return authorize
  const approve = await oauthDeviceApprove({
    config,
    accountName,
    accountSecret,
    code: authorize.data.user_code,
    ...(consent !== undefined ? { consent } : {}),
  })
  if (!approve.success) return approve
  if (approve.data.type !== "verified") {
    return createResultError(
      op,
      `Device approval did not verify (response type: ${approve.data.type})`,
      JSON.stringify(approve.data),
    )
  }
  const pollIntervalMs = parsed.output.pollIntervalMs ?? authorize.data.interval * 1000
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const tokens = await oauthToken({
      config,
      grantType: "urn:ietf:params:oauth:grant-type:device_code",
      deviceCode: authorize.data.device_code,
      clientId,
    })
    if (tokens.success) return tokens
    const code = oauthTokenErrorCode(tokens.errorData)
    if (code !== "authorization_pending" && code !== "slow_down") return tokens
    await new Promise((resolve) => setTimeout(resolve, code === "slow_down" ? pollIntervalMs * 2 : pollIntervalMs))
  }
  return createResultError(op, `Device grant still pending after ${maxAttempts} attempts`)
}
