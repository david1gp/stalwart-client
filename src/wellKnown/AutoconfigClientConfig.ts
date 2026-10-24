/** One `<incomingServer>` / `<outgoingServer>` entry of a Thunderbird autoconfig document. */
export interface AutoconfigServer {
  type: string
  hostname: string
  port: number
  socketType: string
  username: string
  authentication: string
}

/** One `<addressBook>` / `<calendar>` / `<fileShare>` entry of an autoconfig document. */
export interface AutoconfigService {
  type: string
  username: string
  authentication: string
  serverUrl: string
}

/**
 * Parsed Thunderbird `clientConfig` document, served by three endpoints from the
 * same handler (`Server::handle_autoconfig_request`,
 * `crates/common/src/network/autoconfig/legacy_autoconfig.rs:13`).
 */
export interface AutoconfigClientConfig {
  domain: string
  displayName: string
  displayShortName: string
  incomingServers: AutoconfigServer[]
  outgoingServers: AutoconfigServer[]
  addressBook?: AutoconfigService
  calendar?: AutoconfigService
  fileShare?: AutoconfigService
  clientConfigUpdateUrl?: string
}
