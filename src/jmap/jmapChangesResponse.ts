/** Standard JMAP `Changes` response envelope. */
export type JmapChangesResponse = {
  accountId: string | number
  oldState: string
  newState: string
  hasMoreChanges: boolean
  created: readonly (string | number)[]
  updated: readonly (string | number)[]
  destroyed: readonly (string | number)[]
  updatedProperties?: readonly string[] | null
}
