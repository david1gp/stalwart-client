import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import { registryGet } from "../registryGet.js"
import type { RegistryHttpLookup } from "../generated/RegistryHttpLookup.js"
import { httpLookupGetOptionsSchema, type HttpLookupGetOptions } from "./httpLookupGetOptionsSchema.js"

/**
 * `x:HttpLookup/get` — Defines an HTTP-based lookup list.
 */
export async function httpLookupGet(options: HttpLookupGetOptions): PromiseResult<JmapGetResponse<RegistryHttpLookup>> {
  const op = "httpLookupGet"
  const parsed = a.safeParse(httpLookupGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "HttpLookup" })
}
