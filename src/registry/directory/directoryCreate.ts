import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import type { RegistryCreated } from "../RegistryCreated.js"
import type { RegistryDirectoryCreate } from "../generated/RegistryDirectoryCreate.js"
import { registrySet } from "../registrySet.js"
import { type DirectoryCreateOptions, directoryCreateOptionsSchema } from "./directoryCreateOptionsSchema.js"

/**
 * `x:Directory/set` create — create one directory Directory entry.
 * The payload follows `RegistryDirectoryCreate` (see the generated type); only the
 * creation id `c1` of this call is returned.
 */
export async function directoryCreate(options: DirectoryCreateOptions): PromiseResult<RegistryCreated> {
  const op = "directoryCreate"
  const parsed = a.safeParse(directoryCreateOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const created = await registrySet({
    config: parsed.output.config,
    objectType: "Directory" as const,
    ...(parsed.output.accountId !== undefined ? { accountId: parsed.output.accountId } : {}),
    create: { c1: parsed.output.directory as unknown as Record<string, unknown> },
  })
  if (!created.success) return created
  const record = created.data.created?.c1
  if (record === undefined)
    return createResultError(op, "server did not return the created object", JSON.stringify(created.data))
  return createResult(record)
}
