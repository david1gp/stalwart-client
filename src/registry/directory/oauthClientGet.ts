import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryOAuthClient } from "../generated/RegistryOAuthClient.js"
import { registryGet } from "../registryGet.js"
import { type OauthClientGetOptions, oauthClientGetOptionsSchema } from "./oauthClientGetOptionsSchema.js"

/**
 * `x:OAuthClient/get` — fetch directory OAuthClient entries by id.
 */
export async function oauthClientGet(
  options: OauthClientGetOptions,
): PromiseResult<JmapGetResponse<RegistryOAuthClient & { id: string }>> {
  const op = "oauthClientGet"
  const parsed = a.safeParse(oauthClientGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...rest } = parsed.output
  return registryGet({ config, objectType: "OAuthClient" as const, ...rest })
}
