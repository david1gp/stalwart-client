import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { httpFormSetOptionsSchema, type HttpFormSetOptions } from "./httpFormSetOptionsSchema.js"

/**
 * `x:HttpForm/set` — patch the contact form submission endpoint singleton.
 * Any `notUpdated` entry becomes a ResultErr via `jmapSetErrorCheck`.
 */
export async function httpFormSet(options: HttpFormSetOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "httpFormSet"
  const parsed = a.safeParse(httpFormSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const response = await registrySet({
    config: parsed.output.config,
    objectType: "HttpForm",
    update: { singleton: parsed.output.patch },
    ...(parsed.output.accountId !== undefined ? { accountId: parsed.output.accountId } : {}),
  })
  if (!response.success) return createResultError(op, response.errorMessage, response.errorData)
  return response
}
