import { stalwartClientFromEnv } from "../src/client/stalwartClientFromEnv.js"
import type { StalwartClientConfig } from "../src/client/stalwartClientConfigSchema.js"

/**
 * Shared E2E setup: fail-closed target selection.
 *
 * `STALWART_E2E_TARGET` must be set explicitly to `live` or `local`.
 * There is no default environment.
 *
 * Live target reads the process env as-is (Bun auto-loads `.env`).
 * Local target reads ONLY `ops/local-stalwart/.env.local` for every
 * `STALWART_*` credential/account value, refusing ambient (live) fallbacks,
 * so a local run can never hit live mail with leaked credentials.
 */

export const E2E_TARGETS = ["live", "local"] as const
export type E2eTarget = (typeof E2E_TARGETS)[number]

const ALLOWED_TARGETS = E2E_TARGETS.join(", ")

/**
 * Resolve the e2e target without touching the network.
 * Throws before any JMAP/IMAP/HTTP mail request when unset or unknown.
 */
export function resolveE2eTarget(env: Record<string, string | undefined> = process.env): E2eTarget {
  const raw = env.STALWART_E2E_TARGET
  if (raw === undefined || raw.trim() === "") {
    throw new Error(
      `STALWART_E2E_TARGET is not set (expected one of: ${ALLOWED_TARGETS}). There is no default environment.`,
    )
  }
  if (raw !== "live" && raw !== "local") {
    throw new Error(
      `Unknown STALWART_E2E_TARGET=${JSON.stringify(raw)} (expected one of: ${ALLOWED_TARGETS}). There is no default environment.`,
    )
  }
  return raw
}

function parseEnvFile(text: string): Record<string, string> {
  const overlay: Record<string, string> = {}
  for (const line of text.split("\n")) {
    const trimmed = line.trim()
    if (trimmed === "" || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq < 0) continue
    overlay[trimmed.slice(0, eq)] = trimmed.slice(eq + 1)
  }
  return overlay
}

function isLoopbackUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase()
    return hostname === "127.0.0.1" || hostname === "localhost" || hostname === "::1" || hostname === "[::1]"
  } catch {
    return false
  }
}

/**
 * Load the validated env for the resolved target, before any network request.
 *
 * - `local`: every `STALWART_*` credential/account value comes from
 *   `ops/local-stalwart/.env.local` only; ambient `STALWART_*` values are
 *   dropped (except the target itself and non-credential tuning) so a live
 *   `.env` can never leak into a local run. Refuses a non-loopback base URL.
 * - `live`: never reads the harness file; refuses a loopback base URL so a
 *   local harness address can never be hit as "live".
 */
export async function loadE2eEnv(
  sourceEnv: Record<string, string | undefined> = process.env,
): Promise<{ target: E2eTarget; env: Record<string, string | undefined> }> {
  const target = resolveE2eTarget(sourceEnv)
  if (target === "local") {
    const localFile = Bun.file(new URL("../ops/local-stalwart/.env.local", import.meta.url))
    if (!(await localFile.exists())) {
      throw new Error(
        "STALWART_E2E_TARGET=local requires ops/local-stalwart/.env.local; run bash ops/local-stalwart/start.sh first",
      )
    }
    const overlay = parseEnvFile(await localFile.text())
    if (overlay["STALWART_BASE_URL"] === undefined || overlay["STALWART_BASE_URL"] === "") {
      throw new Error(
        "STALWART_E2E_TARGET=local requires STALWART_BASE_URL in ops/local-stalwart/.env.local; refusing ambient STALWART_* fallback.",
      )
    }
    const hasBasic =
      overlay["STALWART_USERNAME"] !== undefined &&
      overlay["STALWART_USERNAME"] !== "" &&
      overlay["STALWART_PASSWORD"] !== undefined
    const hasToken = overlay["STALWART_TOKEN"] !== undefined && overlay["STALWART_TOKEN"] !== ""
    if (!hasBasic && !hasToken) {
      throw new Error(
        "STALWART_E2E_TARGET=local requires STALWART_USERNAME+STALWART_PASSWORD (or STALWART_TOKEN) in ops/local-stalwart/.env.local; refusing ambient STALWART_* fallback.",
      )
    }
    if (!isLoopbackUrl(overlay["STALWART_BASE_URL"] as string)) {
      throw new Error(
        `STALWART_E2E_TARGET=local refuses non-loopback STALWART_BASE_URL=${JSON.stringify(overlay["STALWART_BASE_URL"])}; refusing mismatched/ambient combo.`,
      )
    }
    const env: Record<string, string | undefined> = {}
    for (const [key, value] of Object.entries(sourceEnv)) {
      if (key === "STALWART_E2E_TARGET") env[key] = value
      else if (key.startsWith("STALWART_")) continue
      else env[key] = value
    }
    for (const key of ["STALWART_TIMEOUT_MS", "STALWART_RETRIES"] as const) {
      if (overlay[key] === undefined && sourceEnv[key] !== undefined) env[key] = sourceEnv[key]
    }
    Object.assign(env, overlay)
    return { target, env }
  }
  const baseUrl = sourceEnv["STALWART_BASE_URL"]
  if (typeof baseUrl === "string" && baseUrl !== "" && isLoopbackUrl(baseUrl)) {
    throw new Error(
      `STALWART_E2E_TARGET=live refuses loopback STALWART_BASE_URL=${JSON.stringify(baseUrl)}; use STALWART_E2E_TARGET=local for the harness.`,
    )
  }
  return { target, env: { ...sourceEnv } }
}

export async function stalwartE2eSetup(
  sourceEnv: Record<string, string | undefined> = process.env,
): Promise<StalwartClientConfig> {
  const { target, env } = await loadE2eEnv(sourceEnv)

  const configured = stalwartClientFromEnv(env)
  if (!configured.success) {
    throw new Error(`Unable to initialize the e2e Stalwart config: ${configured.errorMessage}`)
  }
  console.info(`E2E target=${target} baseUrl=${configured.data.baseUrl}`)
  return configured.data
}
