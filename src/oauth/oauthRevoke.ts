import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { jmapHttpRequest } from "../jmap/jmapHttpRequest.js"
import { oauthRevokeOptionsSchema, type OauthRevokeOptions } from "./oauthRevokeOptionsSchema.js"

/**
 * Revoke an access or refresh token (`POST /auth/revoke`, anonymous;
 * Stalwart v1).
 *
 * Posts the `token` plus client authentication as a form
 * (`handle_token_revocation` in `crates/http/src/auth/oauth/token.rs`):
 * revoking deletes the whole OAuth grant, signing the application out.
 * Unknown tokens and grants from other clients still answer 200 (RFC 7009),
 * so success only means the request was accepted. Error responses
 * (HTTP 400 `{error: "invalid_client" | "invalid_request"}`) surface as a
 * `ResultErr` whose `errorData` holds the server JSON.
 */
export async function oauthRevoke(options: OauthRevokeOptions): PromiseResult<{ revoked: true }> {
  const op = "oauthRevoke"
  const parsed = a.safeParse(oauthRevokeOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, token, clientId, clientSecret } = parsed.output
  const clientAuth = parsed.output.clientAuth ?? "none"
  const fields: Record<string, string> = { token }
  if (clientId !== undefined && clientAuth !== "client_secret_basic") fields.client_id = clientId
  if (clientSecret !== undefined && clientAuth === "client_secret_post") fields.client_secret = clientSecret
  const response = await jmapHttpRequest({
    config,
    method: "POST",
    path: "/auth/revoke",
    auth: false,
    responseType: "void",
    ...(clientAuth === "client_secret_basic" && clientId !== undefined
      ? {
          headers: {
            Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret ?? ""}`).toString("base64")}`,
          },
        }
      : {}),
    body: { kind: "form", value: fields },
  })
  if (!response.success) return response
  return createResult({ revoked: true as const })
}
