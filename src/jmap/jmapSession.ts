/** Minimal JMAP Session shape (RFC 8620 §2): only fields the client core needs. */
export type JmapSession = {
  capabilities: Record<string, unknown>
  accounts: Record<
    string,
    {
      name: string
      isPersonal: boolean
      isReadOnly: boolean
      accountCapabilities: Record<string, unknown>
    }
  >
  primaryAccounts: Record<string, string>
  username: string
  apiUrl: string
  downloadUrl: string
  uploadUrl: string
  eventSourceUrl: string
  state: string
}
