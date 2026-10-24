import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { jmapHttpRequest } from "../jmap/jmapHttpRequest.js"
import type { OidcDiscoveryDocument } from "./OidcDiscoveryDocument.js"
import { oidcMetadataOptionsSchema, type OidcMetadataOptions } from "./oidcMetadataOptionsSchema.js"

/** Fetch the OpenID Connect discovery document (anonymous, safe). */
export async function oidcMetadata(options: OidcMetadataOptions): PromiseResult<OidcDiscoveryDocument> {
  const op = "oidcMetadata"
  const parsed = a.safeParse(oidcMetadataOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return jmapHttpRequest<OidcDiscoveryDocument>({
    config: parsed.output.config,
    method: "GET",
    path: "/.well-known/openid-configuration",
    auth: false,
  })
}
