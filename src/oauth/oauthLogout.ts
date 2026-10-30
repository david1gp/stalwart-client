import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { jmapHttpRequest } from "../jmap/jmapHttpRequest.js"
import type { OAuthLogoutResult } from "./OAuthLogoutResult.js"
import { oauthLogoutOptionsSchema, type OauthLogoutOptions } from "./oauthLogoutOptionsSchema.js"

/**
 * End the SSO session (`GET /auth/logout`, anonymous; Stalwart v1).
 *
 * With a registered `postLogoutRedirectUri` the server answers 303 with the
 * final `location` (state appended); otherwise it renders the "signed out"
 * page (200). The redirect is observed, never followed — the caller decides
 * where the user agent goes next.
 */
export async function oauthLogout(options: OauthLogoutOptions): PromiseResult<OAuthLogoutResult> {
  const op = "oauthLogout"
  const parsed = a.safeParse(oauthLogoutOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, clientId, postLogoutRedirectUri, state, idTokenHint } = parsed.output
  const response = await jmapHttpRequest({
    config,
    method: "GET",
    path: "/auth/logout",
    auth: false,
    responseType: "redirect",
    query: {
      ...(clientId !== undefined ? { client_id: clientId } : {}),
      ...(postLogoutRedirectUri !== undefined ? { post_logout_redirect_uri: postLogoutRedirectUri } : {}),
      ...(state !== undefined ? { state } : {}),
      ...(idTokenHint !== undefined ? { id_token_hint: idTokenHint } : {}),
    },
  })
  if (response.success) return createResult({ ended: true as const, location: response.data.location })
  // The "signed out" page is a 200, which the redirect reader reports as an
  // error — map it back to success. Anything else propagates unchanged.
  const loggedOutPage = /^Expected a redirect, got status (\d+)$/.exec(response.errorMessage)
  const status = loggedOutPage?.[1] === undefined ? Number.NaN : Number(loggedOutPage[1])
  if (status >= 200 && status < 300) return createResult({ ended: true as const })
  return createResultError(op, response.errorMessage, response.errorData)
}
