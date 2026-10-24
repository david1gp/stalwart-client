import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { jmapHttpRequest } from "../jmap/jmapHttpRequest.js"
import type { OidcDiscoveryDocument } from "../oauth/OidcDiscoveryDocument.js"
import { managementDiscoverOptionsSchema, type ManagementDiscoverOptions } from "./managementDiscoverOptionsSchema.js"

/**
 * Discover the OIDC provider for an email address (`GET /api/discover/{email}`,
 * anonymous).
 *
 * Returns the owning directory's OIDC discovery document, or the server's own
 * document for local domains (`handle_discover_request` in
 * `crates/http/src/auth/oauth/auth.rs`), which shares the shape of
 * `OidcDiscoveryDocument`.
 */
export async function managementDiscover(options: ManagementDiscoverOptions): PromiseResult<OidcDiscoveryDocument> {
  const op = "managementDiscover"
  const parsed = a.safeParse(managementDiscoverOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return jmapHttpRequest<OidcDiscoveryDocument>({
    config: parsed.output.config,
    method: "GET",
    path: `/api/discover/${encodeURIComponent(parsed.output.email)}`,
    auth: false,
  })
}
