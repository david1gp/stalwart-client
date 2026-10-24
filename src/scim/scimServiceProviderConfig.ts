import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { scimRequest } from "./scimRequest.js"
import type { ScimServiceProviderConfig } from "./ScimServiceProviderConfigType.js"
import {
  scimServiceProviderConfigOptionsSchema,
  type ScimServiceProviderConfigOptions,
} from "./scimServiceProviderConfigOptionsSchema.js"

/**
 * `GET /scim/v2/ServiceProviderConfig` — fetch the provider's capabilities
 * (`crates/scim/src/discovery.rs:33`). The discovery routes reject filtered
 * requests, so this takes no query arguments.
 */
export async function scimServiceProviderConfig(
  options: ScimServiceProviderConfigOptions,
): PromiseResult<ScimServiceProviderConfig> {
  const op = "scimServiceProviderConfig"
  const parsed = a.safeParse(scimServiceProviderConfigOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return scimRequest<ScimServiceProviderConfig>({
    op,
    config: parsed.output.config,
    method: "GET",
    path: "/scim/v2/ServiceProviderConfig",
  })
}
