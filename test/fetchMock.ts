import { mock } from "bun:test"

export type FetchMockRequest = {
  url: string
  method: string
  headers: Record<string, string>
  body: unknown
}

export type FetchMockHandler = (
  request: FetchMockRequest & { signal: AbortSignal | null | undefined },
) => Response | Promise<Response>

/** Build a JSON `Response` for mocked fetch handlers. */
export function fetchMockJson(data: unknown, status = 200, statusText = "OK"): Response {
  return new Response(JSON.stringify(data), {
    status,
    statusText,
    headers: { "Content-Type": "application/json" },
  })
}

/**
 * Install a mocked `globalThis.fetch` that records every call.
 * Returns the captured requests plus `restore()` (call it in `afterEach`).
 */
export function fetchMockCreate(handler?: FetchMockHandler): {
  requests: FetchMockRequest[]
  restore: () => void
} {
  const originalFetch = globalThis.fetch
  const requests: FetchMockRequest[] = []
  const mocked = mock(async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url
    const headers: Record<string, string> = {}
    const rawHeaders = init?.headers
    if (rawHeaders instanceof Headers) {
      rawHeaders.forEach((value, key) => {
        headers[key] = value
      })
    } else if (rawHeaders !== undefined) {
      Object.assign(headers, rawHeaders)
    }
    if (typeof input !== "string" && !(input instanceof URL)) {
      input.headers.forEach((value, key) => {
        headers[key] = value
      })
    }
    const request: FetchMockRequest = {
      url,
      method: init?.method ?? "GET",
      headers,
      body: init?.body,
    }
    requests.push(request)
    if (handler !== undefined) return handler({ ...request, signal: init?.signal })
    return fetchMockJson({})
  })
  globalThis.fetch = mocked as unknown as typeof fetch
  return {
    requests,
    restore() {
      globalThis.fetch = originalFetch
    },
  }
}
