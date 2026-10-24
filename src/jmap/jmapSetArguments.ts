import type { JmapResultReference } from "./jmapResultReference.js"

/** Standard JMAP `Set` arguments shared by most object types. */
export type JmapSetArguments = {
  accountId?: string | number
  ifInState?: string
  create?: Record<string, Record<string, unknown>>
  update?: Record<string, Record<string, unknown>>
  destroy?: readonly string[] | JmapResultReference
}
