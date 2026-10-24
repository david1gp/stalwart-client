import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import type { JmapGetResponse } from "../jmap/jmapGetResponse.js"
import type { RegistryObjectMap } from "./generated/RegistryObjectMap.js"
import type { RegistryObjectType } from "./generated/RegistryObjectType.js"
import { registryObjectTypes } from "./generated/registryObjectTypes.js"
import { REGISTRY_SINGLETON_ID } from "./REGISTRY_SINGLETON_ID.js"
import { type RegistryGetOptions, registryGetOptionsSchema } from "./registryGetOptionsSchema.js"
import { registryMethodName } from "./registryMethodName.js"

/**
 * `x:<ObjectType>/get` — fetch management objects by id (or all of them).
 * For singletons, omitting `ids` fetches the single instance (`ids: ["singleton"]`).
 */
export async function registryGet<T extends RegistryObjectType>(
  options: RegistryGetOptions & { objectType: T },
): PromiseResult<JmapGetResponse<RegistryObjectMap[T]>> {
  const op = "registryGet"
  const parsed = a.safeParse(registryGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, objectType, ids, properties, accountId } = parsed.output
  const isSingleton = registryObjectTypes[objectType].kind === "singleton"
  const resolvedIds = ids ?? (isSingleton ? [REGISTRY_SINGLETON_ID] : null)
  return stalwartMethodCall<JmapGetResponse<RegistryObjectMap[T]>>({
    config,
    methodName: registryMethodName(objectType, "get"),
    arguments: {
      ids: resolvedIds,
      ...(properties !== undefined ? { properties } : {}),
      ...(accountId !== undefined ? { accountId } : {}),
    },
  })
}
