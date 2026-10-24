import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import { type ArchivedItemQueryOptions, archivedItemQueryOptionsSchema } from "./archivedItemQueryOptionsSchema.js"

/**
 * `x:ArchivedItem/query` — list archived item ids (enterprise-only).
 * Supported filter
 * (`crates/jmap/src/registry/mapping/archived_item.rs:282-311`): `accountId`.
 * Sort by `id`.
 */
export async function archivedItemQuery(options: ArchivedItemQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "archivedItemQuery"
  const parsed = a.safeParse(archivedItemQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...args } = parsed.output
  return registryQuery({ config, objectType: "ArchivedItem", ...args })
}
