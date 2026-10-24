import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryBootstrap } from "../generated/RegistryBootstrap.js"
import { registryGet } from "../registryGet.js"
import { bootstrapGetOptionsSchema, type BootstrapGetOptions } from "./bootstrapGetOptionsSchema.js"

/**
 * `x:Bootstrap/get` — read the first-run setup singleton. Outside bootstrap
 * mode the server returns an empty list with `notFound: ["singleton"]`
 * (`crates/jmap/src/registry/mapping/bootstrap.rs`); only `x:Bootstrap/set`
 * is usable while bootstrapping.
 */
export async function bootstrapGet(
  options: BootstrapGetOptions,
): PromiseResult<JmapGetResponse<RegistryBootstrap & { id: string }>> {
  const op = "bootstrapGet"
  const parsed = a.safeParse(bootstrapGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "Bootstrap" })
}
