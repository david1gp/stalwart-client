import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import { jmapSetErrorCheck } from "../jmap/jmapSetErrorCheck.js"
import type { JmapSetResponse } from "../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "./RegistryCreated.js"
import { registryMethodName } from "./registryMethodName.js"
import { type RegistrySetOptions, registrySetOptionsSchema } from "./registrySetOptionsSchema.js"

/**
 * `x:<ObjectType>/set` — create, update and/or destroy management objects.
 * Any entry in `notCreated`/`notUpdated`/`notDestroyed` makes the whole call a
 * ResultErr (full SetResponse JSON-stringified in `errorData`).
 */
export async function registrySet(options: RegistrySetOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "registrySet"
  const parsed = a.safeParse(registrySetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, objectType, ...args } = parsed.output
  if (args.create === undefined && args.update === undefined && args.destroy === undefined) {
    return createResultError(op, "registrySet needs at least one of create, update or destroy")
  }
  const response = await stalwartMethodCall<JmapSetResponse<RegistryCreated>>({
    config,
    methodName: registryMethodName(objectType, "set"),
    arguments: Object.fromEntries(Object.entries(args).filter(([, value]) => value !== undefined)),
  })
  if (!response.success) return response
  return jmapSetErrorCheck(op, response.data)
}
