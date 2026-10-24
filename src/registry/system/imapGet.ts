import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryImap } from "../generated/RegistryImap.js"
import { registryGet } from "../registryGet.js"
import { imapGetOptionsSchema, type ImapGetOptions } from "./imapGetOptionsSchema.js"

/**
 * `x:Imap/get` — read the IMAP protocol settings singleton
 * (authentication, timeouts, rate limits). Durations are ms numbers.
 */
export async function imapGet(options: ImapGetOptions): PromiseResult<JmapGetResponse<RegistryImap & { id: string }>> {
  const op = "imapGet"
  const parsed = a.safeParse(imapGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "Imap" })
}
