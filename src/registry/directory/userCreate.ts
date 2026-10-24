import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { type UserCreateOptions, userCreateOptionsSchema } from "./userCreateOptionsSchema.js"

/**
 * Create a User account with an inline password credential.
 * The initial secret must be set inline at create time: `x:AccountPassword/set`
 * refuses accounts that have no password yet (`docs/local-instance.md`,
 * `crates/jmap/src/registry/mapping/account.rs:213-222`).
 */
export async function userCreate(options: UserCreateOptions): PromiseResult<RegistryCreated> {
  const op = "userCreate"
  const parsed = a.safeParse(userCreateOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { name, domainId, password, roles, description } = parsed.output
  const created = await registrySet({
    config: parsed.output.config,
    objectType: "Account" as const,
    ...(parsed.output.accountId !== undefined ? { accountId: parsed.output.accountId } : {}),
    create: {
      c1: {
        "@type": "User",
        name,
        domainId,
        credentials: { 0: { "@type": "Password", secret: password } },
        ...(roles !== undefined ? { roles } : {}),
        ...(description !== undefined ? { description } : {}),
      },
    },
  })
  if (!created.success) return created
  const record = created.data.created?.c1
  if (record === undefined)
    return createResultError(op, "server did not return the created user", JSON.stringify(created.data))
  return createResult(record)
}
