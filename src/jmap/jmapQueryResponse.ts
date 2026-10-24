/** Standard JMAP `Query` response envelope. */
export type JmapQueryResponse = {
  accountId: string | number
  queryState: string
  canCalculateChanges: boolean
  position: number
  ids: readonly (string | number)[]
  total?: number
  limit?: number
}
