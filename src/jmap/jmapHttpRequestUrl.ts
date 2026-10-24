import type { JmapHttpRequestOptions } from "./jmapHttpRequestOptions.js"
import { jmapHttpRequestQueryString } from "./jmapHttpRequestQueryString.js"

export function jmapHttpRequestUrl(baseUrl: string, path: string, query?: JmapHttpRequestOptions["query"]): string {
  return `${baseUrl}${path}${jmapHttpRequestQueryString(query)}`
}
