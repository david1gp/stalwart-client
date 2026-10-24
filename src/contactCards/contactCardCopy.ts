import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import type { JmapCopyResponse } from "../jmap/jmapCopyResponse.js"
import { contactCardAccountIdResolve } from "./contactCardAccountIdResolve.js"
import { contactCardCopyOptionsSchema, type ContactCardCopyOptions } from "./contactCardCopyOptionsSchema.js"
import type { ContactCard } from "./ContactCard.js"

/**
 * `ContactCard/copy` — copy cards between accounts (`create` maps new ids to
 * the source card reference, e.g. `{"c1": {"id": "<sourceId>"}}`).
 */
export async function contactCardCopy(options: ContactCardCopyOptions): PromiseResult<JmapCopyResponse<ContactCard>> {
  const op = "contactCardCopy"
  const parsed = a.safeParse(contactCardCopyOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const resolved = await contactCardAccountIdResolve({
    config: parsed.output.config,
    accountId: parsed.output.accountId,
  })
  if (!resolved.success) return resolved
  const response = await stalwartMethodCall<JmapCopyResponse<ContactCard>>({
    config: parsed.output.config,
    session: resolved.data.session,
    methodName: "ContactCard/copy",
    arguments: bodyOmitUndefined({
      accountId: resolved.data.accountId,
      fromAccountId: parsed.output.fromAccountId ?? resolved.data.accountId,
      create: parsed.output.create,
      onSuccessDestroyOriginal: parsed.output.onSuccessDestroyOriginal,
    }),
  })
  if (!response.success) return response
  if (response.data.notCreated !== undefined && Object.keys(response.data.notCreated).length > 0) {
    return createResultError(
      op,
      `ContactCard copy partially failed: ${JSON.stringify(response.data.notCreated)}`,
      JSON.stringify(response.data),
    )
  }
  return createResult(response.data)
}
