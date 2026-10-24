import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryHttpForm } from "../generated/RegistryHttpForm.js"
import { registryGet } from "../registryGet.js"
import { httpFormGetOptionsSchema, type HttpFormGetOptions } from "./httpFormGetOptionsSchema.js"

/**
 * `x:HttpForm/get` — read the contact form submission endpoint singleton.
 */
export async function httpFormGet(
  options: HttpFormGetOptions,
): PromiseResult<JmapGetResponse<RegistryHttpForm & { id: string }>> {
  const op = "httpFormGet"
  const parsed = a.safeParse(httpFormGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "HttpForm" })
}
