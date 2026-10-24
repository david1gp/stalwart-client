/** Method-level `["error", {type, description?, ...}, callId]` payload. */
export type JmapMethodError = {
  type: string
  description?: string
  [key: string]: unknown
}
