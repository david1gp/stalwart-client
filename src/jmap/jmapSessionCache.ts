import type { JmapSession } from "./jmapSession.js"

/** Mutable holder for a fetched JMAP Session; bypasses refetch in `jmapSessionGet`. */
export type JmapSessionCache = {
  session?: JmapSession
}
