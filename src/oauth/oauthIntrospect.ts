import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { jmapHttpRequest } from "../jmap/jmapHttpRequest.js"
import type { OAuthIntrospection } from "./OAuthIntrospection.js"
import { oauthIntrospectOptionsSchema, type OauthIntrospectOptions } from "./oauthIntrospectOptionsSchema.js"

/**
 * Introspect an access token (`POST /auth/introspect`, authenticated).
 *
 * Posts the inspected `token` as a form field (`handle_token_introspect` in
 * `crates/http/src/auth/oauth/token.rs`); the call itself authenticates via
 * the configured admin/self credential.
 */
export async function oauthIntrospect(options: OauthIntrospectOptions): PromiseResult<OAuthIntrospection> {
  const op = "oauthIntrospect"
  const parsed = a.safeParse(oauthIntrospectOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return jmapHttpRequest<OAuthIntrospection>({
    config: parsed.output.config,
    method: "POST",
    path: "/auth/introspect",
    body: { kind: "form", value: { token: parsed.output.token } },
  })
}
