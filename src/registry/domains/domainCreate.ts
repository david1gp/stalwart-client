import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { registrySet } from "../registrySet.js"
import { domainCreateOptionsSchema, type DomainCreateOptions } from "./domainCreateOptionsSchema.js"

/**
 * Create an `x:Domain` with the given name (plus optional extra
 * `RegistryDomainCreate` fields in `domain`). Returns the created id.
 * The server fills defaults for the management sub-objects and
 * auto-provisions `x:DkimSignature` objects for the domain.
 */
export async function domainCreate(options: DomainCreateOptions): PromiseResult<{ id: string }> {
  const op = "domainCreate"
  const parsed = a.safeParse(domainCreateOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const created = await registrySet({
    config: parsed.output.config,
    objectType: "Domain",
    create: { d1: { ...parsed.output.domain, name: parsed.output.name } },
  })
  if (!created.success) return created
  const id = created.data.created?.d1?.id
  if (typeof id !== "string") return createResultError(op, "server created no Domain", JSON.stringify(created.data))
  return createResult({ id })
}
