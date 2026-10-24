/**
 * Parsed Outlook autodiscover response: the user block plus per-protocol
 * server settings (`build_autodiscover_response`,
 * `crates/common/src/network/autoconfig/autodiscover.rs:40`).
 */
export interface AutodiscoverAccountProtocol {
  type: string
  server: string
  port: number
  loginName: string
  ssl: string
}

export interface AutodiscoverResponse {
  displayName: string
  emailAddress: string
  deploymentId: string
  accountType: string
  action: string
  protocols: AutodiscoverAccountProtocol[]
}
