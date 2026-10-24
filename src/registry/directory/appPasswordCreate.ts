import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { registrySet } from "../registrySet.js"
import { type AppPasswordCreateOptions, appPasswordCreateOptionsSchema } from "./appPasswordCreateOptionsSchema.js"

/**
 * Create one app password credential and return its id plus the plaintext secret.
 * Credentials live on the owning account: the JMAP `accountId` argument selects
 * the owner (`crates/jmap/src/registry/mapping/account.rs:346-515`), and the
 * server returns `{id, secret}` (`account.rs:451-460,490-499`).
 * The secret is shown once — use it now: an app password secret authenticates as
 * `Bearer` (API key) or Basic password (app password) and cannot be read back.
 * (`docs/local-instance.md`.)
 */
export async function appPasswordCreate(
  options: AppPasswordCreateOptions,
): PromiseResult<{ id: string; secret: string }> {
  const op = "appPasswordCreate"
  const parsed = a.safeParse(appPasswordCreateOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const created = await registrySet({
    config: parsed.output.config,
    objectType: "AppPassword" as const,
    ...(parsed.output.accountId !== undefined ? { accountId: parsed.output.accountId } : {}),
    create: {
      k1: {
        description: parsed.output.description ?? "stalwart-client",
        ...(parsed.output.expiresAt !== undefined ? { expiresAt: parsed.output.expiresAt } : {}),
        ...(parsed.output.allowedIps !== undefined ? { allowedIps: parsed.output.allowedIps } : {}),
        ...(parsed.output.permissions !== undefined ? { permissions: parsed.output.permissions } : {}),
      },
    },
  })
  if (!created.success) return created
  const record = created.data.created?.k1 as { id?: unknown; secret?: unknown } | undefined
  if (typeof record?.id !== "string" || typeof record.secret !== "string")
    return createResultError(op, "server did not return the credential id and secret", JSON.stringify(created.data))
  return createResult({ id: record.id, secret: record.secret })
}
