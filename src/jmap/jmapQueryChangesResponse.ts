/** Standard JMAP `QueryChanges` response envelope. */
export type JmapQueryChangesResponse = {
  accountId: string | number
  oldQueryState: string
  newQueryState: string
  removed: readonly (string | number)[]
  added: readonly { id: string | number; index: number }[]
  total?: number
}
