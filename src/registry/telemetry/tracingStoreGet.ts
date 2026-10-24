import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import { registryGet } from "../registryGet.js"
import type { RegistryTracingStore } from "../generated/RegistryTracingStore.js"
import { type TracingStoreGetOptions, tracingStoreGetOptionsSchema } from "./tracingStoreGetOptionsSchema.js"

/**
 * `x:TracingStore/get` — fetch the tracing storage backend singleton
 * (`Disabled`, `Default`, `FoundationDb`, `PostgreSql` or `MySql`).
 * Read-only in practice: repointing the store breaks the server.
 */
export async function tracingStoreGet(
  options: TracingStoreGetOptions,
): PromiseResult<JmapGetResponse<RegistryTracingStore>> {
  const op = "tracingStoreGet"
  const parsed = a.safeParse(tracingStoreGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...args } = parsed.output
  return registryGet({ config, objectType: "TracingStore", ...args })
}
