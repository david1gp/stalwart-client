import type { JmapSetError } from "./jmapSetError.js"

/** Standard JMAP `Set` response envelope. */
export type JmapSetResponse<T = unknown> = {
  accountId?: string | number
  oldState?: string
  newState?: string
  created?: Record<string, T>
  updated?: Record<string, T | null>
  destroyed?: readonly (string | number)[]
  notCreated?: Record<string, JmapSetError>
  notUpdated?: Record<string, JmapSetError>
  notDestroyed?: Record<string, JmapSetError>
}
