import type { JmapSetError } from "./jmapSetError.js"

/** Standard JMAP `Copy` response envelope. */
export type JmapCopyResponse<T = unknown> = {
  fromAccountId: string | number
  accountId: string | number
  created?: Record<string, T>
  notCreated?: Record<string, JmapSetError>
}
