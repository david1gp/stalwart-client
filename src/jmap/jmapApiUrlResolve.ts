import type { JmapSession } from "./jmapSession.js"

/**
 * Resolve the JMAP API request URL: session `apiUrl` pathname joined onto
 * the configured `baseUrl` origin. Stalwart builds session URLs from its own
 * configured hostname (e.g. `https://mail.example.test/jmap/`), which is not
 * necessarily reachable — the configured baseUrl origin always wins.
 */
export function jmapApiUrlResolve(session: Pick<JmapSession, "apiUrl">, configBaseUrl: string): string {
  const op = "jmapApiUrlResolve"
  try {
    const base = new URL(configBaseUrl)
    const api = new URL(session.apiUrl, base)
    return `${base.origin}${api.pathname}`
  } catch (error) {
    throw new Error(`[${op}] ${(error as Error).message}`)
  }
}
