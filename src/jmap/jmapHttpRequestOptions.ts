import type { JmapClientConfig } from "./jmapClientConfigSchema.js"

export type JmapHttpRequestBody =
  | { readonly kind: "json"; readonly value: unknown }
  | { readonly kind: "raw"; readonly value: Uint8Array | string; readonly contentType: string }
  | { readonly kind: "form"; readonly value: Record<string, string> }

export type JmapHttpResponseType = "json" | "text" | "bytes" | "void" | "stream"

export type JmapHttpRequestOptions = {
  config: JmapClientConfig
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  path: string
  query?: Record<string, string | number | boolean | readonly string[] | undefined | null>
  body?: JmapHttpRequestBody
  /** Send the Authorization header (default true). Set false for anonymous endpoints. */
  auth?: boolean
  /** "json" (default) | "text" | "bytes" | "void" | "stream" (SSE / live feeds) */
  responseType?: JmapHttpResponseType
  headers?: Record<string, string>
}
