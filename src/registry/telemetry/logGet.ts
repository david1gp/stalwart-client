import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import { registryGet } from "../registryGet.js"
import type { RegistryLog } from "../generated/RegistryLog.js"
import { type LogGetOptions, logGetOptionsSchema } from "./logGetOptionsSchema.js"

/**
 * `x:Log/get` — fetch server log entries by id (opaque file-offset ids).
 * Log entries expose `timestamp`, `level`, `event` and `details`; the server
 * reads them from the configured log files on demand
 * (`crates/jmap/src/registry/mapping/log.rs:36-80`).
 */
export async function logGet(options: LogGetOptions): PromiseResult<JmapGetResponse<RegistryLog>> {
  const op = "logGet"
  const parsed = a.safeParse(logGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...args } = parsed.output
  return registryGet({ config, objectType: "Log", ...args })
}
