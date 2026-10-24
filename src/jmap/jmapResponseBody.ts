import type { JmapMethodResponse } from "./jmapMethodResponse.js"

/** JMAP API response body: `{methodResponses, sessionState, createdIds?}` (RFC 8620 §3.4). */
export type JmapResponseBody = {
  methodResponses: readonly JmapMethodResponse[]
  sessionState: string | number
  createdIds?: Record<string, string | number>
}
