import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { type GroupCreateOptions, groupCreateOptionsSchema } from "./groupCreateOptionsSchema.js"

/** Create a Group account. Members join via their `memberGroupIds` patch. */
export async function groupCreate(options: GroupCreateOptions): PromiseResult<RegistryCreated> {
  const op = "groupCreate"
  const parsed = a.safeParse(groupCreateOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const created = await registrySet({
    config: parsed.output.config,
    objectType: "Account" as const,
    ...(parsed.output.accountId !== undefined ? { accountId: parsed.output.accountId } : {}),
    create: {
      c1: {
        "@type": "Group",
        name: parsed.output.name,
        domainId: parsed.output.domainId,
        ...(parsed.output.description !== undefined ? { description: parsed.output.description } : {}),
      },
    },
  })
  if (!created.success) return created
  const record = created.data.created?.c1
  if (record === undefined)
    return createResultError(op, "server did not return the created group", JSON.stringify(created.data))
  return createResult(record)
}
