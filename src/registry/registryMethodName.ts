import type { RegistryObjectType } from "./generated/RegistryObjectType.js"

/** Build the Stalwart management method name: `("Domain", "query")` → `"x:Domain/query"`. */
export function registryMethodName(objectType: RegistryObjectType, verb: "get" | "set" | "query"): string {
  return `x:${objectType}/${verb}`
}
