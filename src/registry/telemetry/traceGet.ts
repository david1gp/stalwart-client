import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import { registryGet } from "../registryGet.js"
import type { RegistryTrace } from "../generated/RegistryTrace.js"
import { type TraceGetOptions, traceGetOptionsSchema } from "./traceGetOptionsSchema.js"

/**
 * `x:Trace/get` — fetch message delivery traces by id.
 * Read-only and enterprise-only: `/set` always fails with
 * "Telemetry objects cannot be modified", and on the community edition every
 * method fails with "This feature is only available in the Enterprise edition"
 * (`crates/jmap/src/registry/set.rs`, `crates/jmap/src/registry/mod.rs:20-44`).
 */
export async function traceGet(options: TraceGetOptions): PromiseResult<JmapGetResponse<RegistryTrace>> {
  const op = "traceGet"
  const parsed = a.safeParse(traceGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...args } = parsed.output
  return registryGet({ config, objectType: "Trace", ...args })
}
