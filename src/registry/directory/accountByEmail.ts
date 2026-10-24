import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import type { RegistryAccount } from "../generated/RegistryAccount.js"
import { registryGet } from "../registryGet.js"
import { registryQuery } from "../registryQuery.js"
import { type AccountByEmailOptions, accountByEmailOptionsSchema } from "./accountByEmailOptionsSchema.js"

/**
 * Find one directory account by its derived email address (`name@domain`).
 * `x:Account` has no `emailAddress` index (indexed: text, type, domainId,
 * externalId, memberGroupIds, memberTenantId, name —
 * `crates/registry/src/schema/properties_impl.rs:3380-3416`), so the domain
 * is resolved first via `x:Domain/query` and the account is filtered by
 * `(name, domainId)`, then read. A query with no hits is a ResultErr.
 */
export async function accountByEmail(options: AccountByEmailOptions): PromiseResult<RegistryAccount & { id: string }> {
  const op = "accountByEmail"
  const parsed = a.safeParse(accountByEmailOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, email, accountId } = parsed.output
  const at = email.lastIndexOf("@")
  if (at <= 0 || at === email.length - 1) return createResultError(op, `invalid email address ${email}`)
  const name = email.slice(0, at)
  const domain = email.slice(at + 1)
  const scope = accountId !== undefined ? { accountId } : {}
  const domains = await registryQuery({ config, objectType: "Domain" as const, filter: { name: domain }, ...scope })
  if (!domains.success) return domains
  const domainId = domains.data.ids[0]
  if (domainId === undefined) return createResultError(op, `no account with email ${email}`)
  const queried = await registryQuery({
    config,
    objectType: "Account" as const,
    filter: { name, domainId: String(domainId) },
    ...scope,
  })
  if (!queried.success) return queried
  const id = queried.data.ids[0]
  if (id === undefined) return createResultError(op, `no account with email ${email}`)
  const fetched = await registryGet({
    config,
    objectType: "Account" as const,
    ids: [String(id)],
    ...scope,
  })
  if (!fetched.success) return fetched
  const account = fetched.data.list[0] as (RegistryAccount & { id: string }) | undefined
  if (account === undefined) return createResultError(op, `no account with email ${email}`)
  return createResult(account)
}
