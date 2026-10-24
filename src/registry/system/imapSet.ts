import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapSetResponse } from "../../jmap/jmapSetResponse.js"
import type { RegistryCreated } from "../RegistryCreated.js"
import { registrySet } from "../registrySet.js"
import { imapSetOptionsSchema, type ImapSetOptions } from "./imapSetOptionsSchema.js"

/**
 * `x:Imap/set` — patch the IMAP protocol settings singleton
 * (e.g. `{ timeoutIdle: 1200000 }`; durations are ms numbers).
 * Any `notUpdated` entry becomes a ResultErr via `jmapSetErrorCheck`.
 */
export async function imapSet(options: ImapSetOptions): PromiseResult<JmapSetResponse<RegistryCreated>> {
  const op = "imapSet"
  const parsed = a.safeParse(imapSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const response = await registrySet({
    config: parsed.output.config,
    objectType: "Imap",
    update: { singleton: parsed.output.patch },
    ...(parsed.output.accountId !== undefined ? { accountId: parsed.output.accountId } : {}),
  })
  if (!response.success) return createResultError(op, response.errorMessage, response.errorData)
  return response
}
