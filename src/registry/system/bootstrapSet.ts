import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { bootstrapSetOptionsSchema, type BootstrapSetOptions } from "./bootstrapSetOptionsSchema.js"

/**
 * `x:Bootstrap/set` — write the first-run setup singleton. Only accessible
 * while the store is uninitialized; every other registry method fails in
 * bootstrap mode (`crates/jmap/src/registry/query.rs:56-60`, `set.rs:103`).
 * Any `notUpdated` entry becomes a ResultErr via `jmapSetErrorCheck`.
 */
export async function bootstrapSet(options: BootstrapSetOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "bootstrapSet"
  const parsed = a.safeParse(bootstrapSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const response = await registrySet({
    config: parsed.output.config,
    objectType: "Bootstrap",
    update: { singleton: parsed.output.patch },
    ...(parsed.output.accountId !== undefined ? { accountId: parsed.output.accountId } : {}),
  })
  if (!response.success) return createResultError(op, response.errorMessage, response.errorData)
  return response
}
