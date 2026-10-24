import { createResult, createResultError, type PromiseResult, resultTryParsingFetchErr } from "#result"
import type { JmapHttpRedirect } from "./JmapHttpRedirect.js"
import { jmapAuthHeader } from "./jmapAuthHeader.js"
import type { JmapHttpRequestOptions } from "./jmapHttpRequestOptions.js"
import { jmapHttpRequestUrl } from "./jmapHttpRequestUrl.js"

const DEFAULT_TIMEOUT_MS = 30_000
const DEFAULT_RETRIES = 0

export async function jmapHttpRequest(
  options: JmapHttpRequestOptions & { responseType: "redirect" },
): PromiseResult<JmapHttpRedirect>
export async function jmapHttpRequest(
  options: JmapHttpRequestOptions & { responseType: "stream" },
): PromiseResult<ReadableStream<Uint8Array>>
export async function jmapHttpRequest(
  options: JmapHttpRequestOptions & { responseType: "void" },
): PromiseResult<undefined>
export async function jmapHttpRequest(options: JmapHttpRequestOptions & { responseType: "text" }): PromiseResult<string>
export async function jmapHttpRequest(
  options: JmapHttpRequestOptions & { responseType: "bytes" },
): PromiseResult<Uint8Array>
export async function jmapHttpRequest<T = unknown>(
  options: JmapHttpRequestOptions & { responseType?: "json" },
): PromiseResult<T>
export async function jmapHttpRequest(options: JmapHttpRequestOptions): PromiseResult<unknown> {
  const op = "jmapHttpRequest"
  const { config, method, path, query, body, auth = true } = options
  const responseType = options.responseType ?? "json"
  const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const retries = config.retries ?? DEFAULT_RETRIES
  const maxAttempts = retries + 1

  let url: string
  let headers: Record<string, string>
  let bodyInit: string | Uint8Array | undefined
  try {
    // `path` may be a full URL (e.g. apiUrl resolved onto the config origin)
    // or an origin-relative path; only append the query to relative paths.
    url = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(path) ? path : jmapHttpRequestUrl(config.baseUrl, path, query)
    headers = {
      Accept: responseType === "stream" ? "text/event-stream" : "application/json",
      ...options.headers,
    }
    if (auth) Object.assign(headers, jmapAuthHeader(config))

    if (body !== undefined) {
      if (body.kind === "json") {
        headers["Content-Type"] = "application/json"
        bodyInit = JSON.stringify(body.value)
      } else if (body.kind === "form") {
        headers["Content-Type"] = "application/x-www-form-urlencoded"
        bodyInit = new URLSearchParams(body.value).toString()
      } else {
        headers["Content-Type"] = body.contentType
        bodyInit = body.value
      }
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
        response = await fetch(url, {
          method,
          headers,
          body: bodyInit,
          signal: controller.signal,
          ...(responseType === "redirect" ? { redirect: "manual" as const } : {}),
        })
      } catch (error) {
        lastError = createResultError(op, "Fetch failed", error instanceof Error ? error.message : String(error))
        if (attempt < maxAttempts - 1) continue
        return lastError
      }

      if (responseType === "redirect" && response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location")
        if (location === null) {
          return createResultError(op, `Redirect response had no Location header (status ${response.status})`)
        }
        return createResult({ status: response.status, location })
      }
      if (responseType === "redirect" && response.ok) {
        return createResultError(op, `Expected a redirect, got status ${response.status}`)
      }

      if (!response.ok) {
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
        const err = resultTryParsingFetchErr(op, text, response.status, response.statusText)
        if (response.status >= 500 && attempt < maxAttempts - 1) {
          lastError = err
          continue
        }
        return err
      }

      if (responseType === "stream") {
        if (response.body === null) {
          return createResultError(op, "Streaming response had an empty body")
        }
        return createResult(response.body)
      }

      if (responseType === "void" || response.status === 204) {
        return createResult(undefined)
      }

      if (responseType === "bytes") {
        try {
          const buf = await response.arrayBuffer()
          return createResult(new Uint8Array(buf))
        } catch (error) {
          return createResultError(
            op,
            "Reading binary response failed",
            error instanceof Error ? error.message : String(error),
          )
        }
      }

      let text: string
      try {
        text = await response.text()
      } catch (error) {
        return createResultError(op, "Reading response failed", error instanceof Error ? error.message : String(error))
      }

      if (responseType === "text") {
        return createResult(text)
      }

      // json
      if (text === "") return createResult(undefined)
      try {
        return createResult(JSON.parse(text) as unknown)
      } catch (error) {
        return createResultError(op, "Invalid JSON response", error instanceof Error ? error.message : text)
      }
    } finally {
      clearTimeout(timeoutId)
    }
  }

  return lastError ?? createResultError(op, "Request failed after retries")
}
