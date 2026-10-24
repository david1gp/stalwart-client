import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import type { JmapQueryResponse } from "../jmap/jmapQueryResponse.js"
import { registryObjectTypes } from "./generated/registryObjectTypes.js"
import { registryMethodName } from "./registryMethodName.js"
import { type RegistryQueryOptions, registryQueryOptionsSchema } from "./registryQueryOptionsSchema.js"

/**
 * `x:<ObjectType>/query` — list management object ids with an optional filter/sort/page.
 * Singletons have no `/query`; asking for one is a ResultErr without a request.
 */
export async function registryQuery(options: RegistryQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "registryQuery"
  const parsed = a.safeParse(registryQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, objectType, ...args } = parsed.output
  const methods: readonly string[] = registryObjectTypes[objectType].methods
  if (!methods.includes("query")) {
    return createResultError(op, `${objectType} is a singleton and has no /query method; use registryGet`)
  }
  return stalwartMethodCall<JmapQueryResponse>({
    config,
    methodName: registryMethodName(objectType, "query"),
    arguments: Object.fromEntries(Object.entries(args).filter(([, value]) => value !== undefined)),
  })
}
