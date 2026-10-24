import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import { registryGet } from "../registryGet.js"
import type { RegistryAlert } from "../generated/RegistryAlert.js"
import { type AlertGetOptions, alertGetOptionsSchema } from "./alertGetOptionsSchema.js"

/**
 * `x:Alert/get` — fetch metric-condition alert rules by id.
 * The schema marks Alert enterprise, but the runtime enterprise gate
 * (`crates/jmap/src/registry/mod.rs:20-44`) covers only MaskedEmail,
 * ArchivedItem, Metric and Trace — Alert calls reach the store on community
 * builds.
 */
export async function alertGet(options: AlertGetOptions): PromiseResult<JmapGetResponse<RegistryAlert>> {
  const op = "alertGet"
  const parsed = a.safeParse(alertGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...args } = parsed.output
  return registryGet({ config, objectType: "Alert", ...args })
}
