import type { JmapResultReference } from "./jmapResultReference.js"

/** Standard JMAP `Get` arguments shared by most object types. */
export type JmapGetArguments = {
  accountId?: string | number
  ids?: readonly string[] | JmapResultReference
  properties?: readonly string[]
}
