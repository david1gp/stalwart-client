import type { JmapClientConfig } from "./jmapClientConfigSchema.js"

/**
 * Build the HTTP `Authorization` header for a JMAP client config.
 *
 * Precedence: Basic (username + password, e.g. a Stalwart login or app
 * password) wins when both are present, otherwise Bearer (OAuth access token
 * or API key). No credentials configured returns no header (anonymous).
 */
export function jmapAuthHeader(
  config: Pick<JmapClientConfig, "password" | "token" | "username">,
): Record<string, string> {
  if (config.username !== undefined && config.password !== undefined) {
    return { Authorization: `Basic ${Buffer.from(`${config.username}:${config.password}`).toString("base64")}` }
  }
  if (config.token !== undefined) {
    return { Authorization: `Bearer ${config.token}` }
  }
  return {}
}
