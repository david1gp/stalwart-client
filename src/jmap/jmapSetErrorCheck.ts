import { createResult, createResultError, type Result } from "#result"
import type { JmapSetError } from "./jmapSetError.js"
import type { JmapSetResponse } from "./jmapSetResponse.js"

/**
 * A `/set` response is a *partial success*: the HTTP call succeeded but some
 * creates/updates/destroys may have failed. This turns a non-empty
 * `notCreated`/`notUpdated`/`notDestroyed` map into a ResultErr carrying the
 * full SetResponse as errorData, so callers must handle partial failures.
 */
export function jmapSetErrorCheck<T>(op: string, response: JmapSetResponse<T>): Result<JmapSetResponse<T>> {
  const failures: Record<string, Record<string, JmapSetError>> = {}
  if (response.notCreated !== undefined && Object.keys(response.notCreated).length > 0) {
    failures.notCreated = response.notCreated
  }
  if (response.notUpdated !== undefined && Object.keys(response.notUpdated).length > 0) {
    failures.notUpdated = response.notUpdated
  }
  if (response.notDestroyed !== undefined && Object.keys(response.notDestroyed).length > 0) {
    failures.notDestroyed = response.notDestroyed
  }
  if (Object.keys(failures).length > 0) {
    const summary = Object.entries(failures)
      .map(([kind, entries]) => {
        const first = Object.entries(entries)[0] as [string, JmapSetError]
        return `${kind}: ${first[0]} (${first[1].type}${first[1].description ? `: ${first[1].description}` : ""})`
      })
      .join("; ")
    return createResultError(op, `Set partially failed: ${summary}`, JSON.stringify(response))
  }
  return createResult(response)
}
