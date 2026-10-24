import { createResultError, type Result } from "#result"
import type { StalwartClientConfig } from "./stalwartClientConfigSchema.js"
import { stalwartClientConfig } from "./stalwartClientConfig.js"

/**
 * Load Stalwart client config from process.env (Bun auto-loads `.env` into process.env).
 *
 * - `STALWART_BASE_URL` (required) — server root, e.g. `https://mail.example.com`
 * - `STALWART_USERNAME` + `STALWART_PASSWORD` (optional) — Basic auth (login or app password)
 * - `STALWART_TOKEN` (optional) — Bearer auth (OAuth access token or `API_…` key);
 *   used only when username/password are not set
 * - `STALWART_ACCOUNT_ID` (optional) — default JMAP accountId for ops
 * - `STALWART_TIMEOUT_MS` / `STALWART_RETRIES` (optional)
 */
export function stalwartClientFromEnv(
  env: Record<string, string | undefined> = process.env,
): Result<StalwartClientConfig> {
  const op = "stalwartClientFromEnv"
  const baseUrl = env.STALWART_BASE_URL
  if (!baseUrl) {
    return createResultError(op, "STALWART_BASE_URL is required")
  }

  const timeoutRaw = env.STALWART_TIMEOUT_MS
  const retriesRaw = env.STALWART_RETRIES
  const timeoutMs = timeoutRaw !== undefined && timeoutRaw !== "" ? Number(timeoutRaw) : undefined
  const retries = retriesRaw !== undefined && retriesRaw !== "" ? Number(retriesRaw) : undefined

  return stalwartClientConfig({
    baseUrl,
    username: env.STALWART_USERNAME || undefined,
    password: env.STALWART_PASSWORD || undefined,
    token: env.STALWART_TOKEN || undefined,
    accountId: env.STALWART_ACCOUNT_ID || undefined,
    timeoutMs: timeoutMs !== undefined && !Number.isNaN(timeoutMs) ? timeoutMs : undefined,
    retries: retries !== undefined && !Number.isNaN(retries) ? retries : undefined,
  })
}
