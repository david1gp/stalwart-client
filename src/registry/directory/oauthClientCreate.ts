import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import type { RegistryCreated } from "../RegistryCreated.js"
import type { RegistryOAuthClientCreate } from "../generated/RegistryOAuthClientCreate.js"
import { registrySet } from "../registrySet.js"
import { type OauthClientCreateOptions, oauthClientCreateOptionsSchema } from "./oauthClientCreateOptionsSchema.js"

/**
 * `x:OAuthClient/set` create — create one directory OAuthClient entry.
 * The payload follows `RegistryOAuthClientCreate` (see the generated type); only the
 * creation id `c1` of this call is returned.
 */
export async function oauthClientCreate(options: OauthClientCreateOptions): PromiseResult<RegistryCreated> {
  const op = "oauthClientCreate"
  const parsed = a.safeParse(oauthClientCreateOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const created = await registrySet({
    config: parsed.output.config,
    objectType: "OAuthClient" as const,
    ...(parsed.output.accountId !== undefined ? { accountId: parsed.output.accountId } : {}),
    create: { c1: parsed.output.oauthClient as unknown as Record<string, unknown> },
  })
  if (!created.success) return created
  const record = created.data.created?.c1
  if (record === undefined)
    return createResultError(op, "server did not return the created object", JSON.stringify(created.data))
  return createResult(record)
}
