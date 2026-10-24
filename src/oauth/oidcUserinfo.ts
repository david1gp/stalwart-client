import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { jmapHttpRequest } from "../jmap/jmapHttpRequest.js"
import type { OidcUserinfoClaims } from "./OidcUserinfoClaims.js"
import { oidcUserinfoOptionsSchema, type OidcUserinfoOptions } from "./oidcUserinfoOptionsSchema.js"

/** Fetch the OIDC userinfo claims for the configured token's account. */
export async function oidcUserinfo(options: OidcUserinfoOptions): PromiseResult<OidcUserinfoClaims> {
  const op = "oidcUserinfo"
  const parsed = a.safeParse(oidcUserinfoOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return jmapHttpRequest<OidcUserinfoClaims>({
    config: parsed.output.config,
    method: "GET",
    path: "/auth/userinfo",
  })
}
