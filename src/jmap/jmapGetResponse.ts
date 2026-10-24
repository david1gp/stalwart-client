/** Standard JMAP `Get` response envelope. */
export type JmapGetResponse<T = unknown> = {
  accountId?: string | number
  state?: string
  list: readonly T[]
  notFound: readonly unknown[]
}
