/**
 * Parsed `/.well-known/user-agent-configuration.json` (PACC, draft-ietf-dispatch-pacc):
 * protocol endpoint templates plus authentication and provider info.
 * All properties stay optional — the server builds the document from its
 * configured services (`crates/common/src/network/dns/records.rs:384`).
 */
export interface UserAgentConfig {
  protocols?: {
    jmap?: { url?: string }
    imap?: { host?: string }
    pop3?: { host?: string }
    smtp?: { host?: string }
    caldav?: { url?: string }
    carddav?: { url?: string }
    webdav?: { url?: string }
    managesieve?: { host?: string }
  }
  authentication?: {
    oauthPublic?: { issuer?: string }
    password?: boolean
  }
  info?: {
    provider?: { name?: string }
  }
}
