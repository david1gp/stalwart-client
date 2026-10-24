import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import type { RegistryCreated } from "../RegistryCreated.js"
import type { RegistryMailingListCreate } from "../generated/RegistryMailingListCreate.js"
import { registrySet } from "../registrySet.js"
import { type MailingListCreateOptions, mailingListCreateOptionsSchema } from "./mailingListCreateOptionsSchema.js"

/**
 * `x:MailingList/set` create — create one directory MailingList entry.
 * The payload follows `RegistryMailingListCreate` (see the generated type); only the
 * creation id `c1` of this call is returned.
 */
export async function mailingListCreate(options: MailingListCreateOptions): PromiseResult<RegistryCreated> {
  const op = "mailingListCreate"
  const parsed = a.safeParse(mailingListCreateOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const created = await registrySet({
    config: parsed.output.config,
    objectType: "MailingList" as const,
    ...(parsed.output.accountId !== undefined ? { accountId: parsed.output.accountId } : {}),
    create: { c1: parsed.output.mailingList as unknown as Record<string, unknown> },
  })
  if (!created.success) return created
  const record = created.data.created?.c1
  if (record === undefined)
    return createResultError(op, "server did not return the created object", JSON.stringify(created.data))
  return createResult(record)
}
