import type { JmapSessionCache } from "./jmapSessionCache.js"

export function jmapSessionCacheClear(cache: JmapSessionCache): void {
  cache.session = undefined
}
