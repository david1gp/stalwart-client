import { createResult, createResultError, type PromiseResult } from "#result"
import type { StalwartClientConfig } from "../client/stalwartClientConfigSchema.js"
import { jmapAuthHeader } from "../jmap/jmapAuthHeader.js"
import { jmapHttpRequestUrl } from "../jmap/jmapHttpRequestUrl.js"

const scimContentType = "application/scim+json"
const scimDefaultTimeoutMs = 30_000

/**
 * Low-level SCIM 2.0 (RFC 7644) HTTP transport for `/scim/v2/*`.
 *
 * Sends `Accept: application/scim+json` with the standard client auth header
 * and JSON-encodes `body` with the SCIM content type. `2xx` responses resolve
 * to the parsed JSON body (`204 No Content` resolves to `undefined`); SCIM
 * error responses (the `.../Error` schema, e.g. the enterprise-gate `403` on
 * community servers) become a `ResultErr` whose message carries the HTTP
 * status plus the server's `scimType`/`detail`, with the raw server payload
 * as JSON `errorData`.
 *
 * Wire details verified against Stalwart @ aa47d8ef
 * (`crates/scim/src/request.rs`, `crates/scim/src/error.rs`,
 * `crates/scim-proto/src/message/error.rs`): the enterprise gate runs before
 * dispatch, so community servers answer every SCIM route — including `/Me` —
 * with `403` SCIM JSON; `DELETE` answers `204`; errors serialize `status` as
 * a string (`"status":"403"`).
 */
export async function scimRequest<T = unknown>(options: {
  /** Calling operation name, used as the `op` on every `ResultErr`. */
  op: string
  config: StalwartClientConfig
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  path: string
  query?: Record<string, string | number | boolean | undefined>
  body?: unknown
}): PromiseResult<T> {
  const { op, config, method, path, query, body } = options
  const timeoutMs = config.timeoutMs ?? scimDefaultTimeoutMs
  const maxAttempts = (config.retries ?? 0) + 1

  let url: string
  let headers: Record<string, string>
  let bodyInit: string | undefined
  try {
    url = jmapHttpRequestUrl(config.baseUrl, path, query)
    headers = { Accept: scimContentType, ...jmapAuthHeader(config) }
    if (body !== undefined) {
      headers["Content-Type"] = scimContentType
      bodyInit = JSON.stringify(body)
    }
  } catch (error) {
    return createResultError(op, "Request preparation failed", error instanceof Error ? error.message : String(error))
  }

  let lastError: ReturnType<typeof createResultError> | undefined

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
    try {
      let response: Response
      try {
        response = await fetch(url, { method, headers, body: bodyInit, signal: controller.signal })
      } catch (error) {
        lastError = createResultError(op, "Fetch failed", error instanceof Error ? error.message : String(error))
        if (attempt < maxAttempts - 1) continue
        return lastError
      }

      let text: string
      try {
        text = await response.text()
      } catch (error) {
        lastError = createResultError(
          op,
          "Reading response failed",
          error instanceof Error ? error.message : String(error),
        )
        if (response.status >= 500 && attempt < maxAttempts - 1) continue
        return lastError
      }

      if (response.ok) {
        if (response.status === 204 || text === "") return createResult(undefined as T)
        try {
          return createResult(JSON.parse(text) as T)
        } catch (error) {
          return createResultError(
            op,
            "Invalid SCIM JSON response",
            error instanceof Error ? error.message : String(error),
          )
        }
      }

      const failure = scimErrorResult(op, response.status, text)
      if (response.status >= 500 && attempt < maxAttempts - 1) {
        lastError = failure
        continue
      }
      return failure
    } finally {
      clearTimeout(timeoutId)
    }
  }

  return lastError ?? createResultError(op, "Request failed after retries")
}

function scimErrorResult(op: string, status: number, text: string): ReturnType<typeof createResultError> {
  let payload: { detail?: unknown; scimType?: unknown; status?: unknown } | undefined
  try {
    const parsed: unknown = JSON.parse(text)
    if (typeof parsed === "object" && parsed !== null) payload = parsed as typeof payload
  } catch {
    payload = undefined
  }
  const detail = typeof payload?.detail === "string" ? payload.detail : undefined
  const scimType = typeof payload?.scimType === "string" ? payload.scimType : undefined
  const errorMessage =
    detail === undefined
      ? `SCIM request failed with HTTP ${status}`
      : `SCIM ${status}${scimType === undefined ? "" : ` (${scimType})`}: ${detail}`
  let errorData: string
  try {
    errorData = payload === undefined ? JSON.stringify({ status, body: text }) : JSON.stringify(payload)
  } catch {
    errorData = JSON.stringify({ status })
  }
  return createResultError(op, errorMessage, errorData)
}
