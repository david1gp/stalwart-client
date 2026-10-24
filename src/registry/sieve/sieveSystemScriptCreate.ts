import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import {
  sieveSystemScriptCreateOptionsSchema,
  type SieveSystemScriptCreateOptions,
} from "./sieveSystemScriptCreateOptionsSchema.js"

/**
 * Create one `x:SieveSystemScript`. The server compiles `contents` and
 * failures surface as a ResultErr (`invalidProperties` on `contents`).
 * Source: `crates/jmap/src/registry/mapping/sieve.rs`.
 */
export async function sieveSystemScriptCreate(
  options: SieveSystemScriptCreateOptions,
): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "sieveSystemScriptCreate"
  const parsed = a.safeParse(sieveSystemScriptCreateOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, script, accountId } = parsed.output
  return registrySet({
    config,
    objectType: "SieveSystemScript",
    create: { script },
    ...(accountId !== undefined ? { accountId } : {}),
  })
}
