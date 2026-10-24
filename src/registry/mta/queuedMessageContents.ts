import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { jmapDownload } from "../../jmap/jmapDownload.js"
import { queuedMessageGet } from "./queuedMessageGet.js"
import {
  queuedMessageContentsOptionsSchema,
  type QueuedMessageContentsOptions,
} from "./queuedMessageContentsOptionsSchema.js"

/**
 * Fetch the raw content of a queued `x:QueuedMessage` — the
 * `x:QueuedMessage/MessageContents` view. Views are schema-only groupings with
 * no separate wire methods (see `resources/schema/schema.json.gz`: the view
 * object is just `{type: "view", objectName: "x:QueuedMessage"}`), so this is
 * an `x:QueuedMessage/get` for the `blobId` followed by a session
 * `downloadUrl` fetch, decoded as UTF-8 text.
 */
export async function queuedMessageContents(options: QueuedMessageContentsOptions): PromiseResult<string> {
  const op = "queuedMessageContents"
  const parsed = a.safeParse(queuedMessageContentsOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const got = await queuedMessageGet({ config: parsed.output.config, ids: [parsed.output.id] })
  if (!got.success) return got
  const message = got.data.list[0]
  if (message === undefined) return createResultError(op, `QueuedMessage ${parsed.output.id} not found`)
  const accountId = parsed.output.accountId ?? (typeof got.data.accountId === "string" ? got.data.accountId : undefined)
  if (accountId === undefined) return createResultError(op, `QueuedMessage ${parsed.output.id} returned no accountId`)
  const downloaded = await jmapDownload({
    config: parsed.output.config,
    accountId,
    blobId: message.blobId,
    name: `${parsed.output.id}.eml`,
  })
  if (!downloaded.success) return downloaded
  return createResult(new TextDecoder().decode(downloaded.data))
}
