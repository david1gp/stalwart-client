import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import { registryGet } from "../registryGet.js"
import type { RegistryArchivedItem } from "../generated/RegistryArchivedItem.js"
import { type ArchivedItemGetOptions, archivedItemGetOptionsSchema } from "./archivedItemGetOptionsSchema.js"

/**
 * `x:ArchivedItem/get` — fetch archived items by id (`Email`, `FileNode`,
 * `CalendarEvent`, `ContactCard` or `SieveScript` variants).
 * Enterprise-only: on the community edition every method fails with
 * "This feature is only available in the Enterprise edition"
 * (`crates/jmap/src/registry/mod.rs:20-44`).
 */
export async function archivedItemGet(
  options: ArchivedItemGetOptions,
): PromiseResult<JmapGetResponse<RegistryArchivedItem>> {
  const op = "archivedItemGet"
  const parsed = a.safeParse(archivedItemGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...args } = parsed.output
  return registryGet({ config, objectType: "ArchivedItem", ...args })
}
