import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { httpLookupSetOptionsSchema, type HttpLookupSetOptions } from "./httpLookupSetOptionsSchema.js"

/**
 * `x:HttpLookup/set` — Defines an HTTP-based lookup list.
 */
export async function httpLookupSet(options: HttpLookupSetOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "httpLookupSet"
  const parsed = a.safeParse(httpLookupSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registrySet({ ...parsed.output, objectType: "HttpLookup" })
}
