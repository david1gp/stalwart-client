import type { JmapClientConfig } from "./jmapClientConfigSchema.js"
import { jmapHttpRequest } from "./jmapHttpRequest.js"
import type { JmapSession } from "./jmapSession.js"
import { jmapSessionGet } from "./jmapSessionGet.js"
import { jmapUrlTemplateFill } from "./jmapUrlTemplateFill.js"

/**
 * Download a blob via the session's `downloadUrl` template
 * (`GET /jmap/download/{accountId}/{blobId}/{name}?accept=`).
 */
export async function jmapDownload(options: {
  config: JmapClientConfig
  accountId: string
  blobId: string
  name: string
  accept?: string
  session?: JmapSession
}) {
  const { config, accountId, blobId, name } = options
  let session = options.session
  if (session === undefined) {
    const sessionResult = await jmapSessionGet({ config })
    if (!sessionResult.success) return sessionResult
    session = sessionResult.data
  }
  const path = jmapUrlTemplateFill(session.downloadUrl, {
    accountId,
    blobId,
    name,
    type: options.accept ?? "application/octet-stream",
  })
  const url = new URL(path, config.baseUrl)
  return jmapHttpRequest({
    config,
    method: "GET",
    path: `${url.pathname}${url.search}`,
    responseType: "bytes",
  })
}
