import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import type { JmapClientConfig } from "./jmapClientConfigSchema.js"
import { jmapHttpRequest } from "./jmapHttpRequest.js"
import type { JmapSession } from "./jmapSession.js"
import { jmapSessionGet } from "./jmapSessionGet.js"
import { jmapUrlTemplateFill } from "./jmapUrlTemplateFill.js"

const jmapUploadResponseSchema = a.object({
  accountId: a.union([a.string(), a.number()]),
  blobId: a.string(),
  type: a.string(),
  size: a.number(),
})

export type JmapUploadResult = a.InferOutput<typeof jmapUploadResponseSchema>

/**
 * Upload raw bytes via the session's `uploadUrl` template (`POST /jmap/upload/{accountId}/`).
 * Returns `{accountId, blobId, type, size}`.
 */
export async function jmapUpload(options: {
  config: JmapClientConfig
  accountId: string
  data: Uint8Array | string
  contentType?: string
  session?: JmapSession
}): PromiseResult<JmapUploadResult> {
  const op = "jmapUpload"
  const { config, accountId, data } = options
  let session = options.session
  if (session === undefined) {
    const sessionResult = await jmapSessionGet({ config })
    if (!sessionResult.success) return sessionResult
    session = sessionResult.data
  }
  const path = jmapUrlTemplateFill(session.uploadUrl, { accountId })
  const url = new URL(path, config.baseUrl)
  const raw = await jmapHttpRequest<unknown>({
    config,
    method: "POST",
    path: `${url.pathname}${url.search}`,
    body: { kind: "raw", value: data, contentType: options.contentType ?? "application/octet-stream" },
  })
  if (!raw.success) return raw
  const parsed = a.safeParse(jmapUploadResponseSchema, raw.data)
  if (!parsed.success) {
    return createResultError(op, `Invalid upload response: ${a.summarize(parsed.issues)}`, JSON.stringify(raw.data))
  }
  return createResult(parsed.output)
}
