/** Standard JMAP `Query` arguments. */
export type JmapQueryArguments = {
  accountId?: string | number
  filter?: unknown
  sort?: readonly Record<string, unknown>[]
  position?: number
  anchor?: string
  anchorOffset?: number
  limit?: number
  calculateTotal?: boolean
}
