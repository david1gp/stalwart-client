import { stalwartClientFromEnv } from "../dist/client/stalwartClientFromEnv.js"
import type { StalwartClientConfig } from "../dist/client/stalwartClientConfigSchema.js"

/**
 * Shared E2E setup: load config from `.env` (live) or
 * `ops/local-stalwart/.env.local` (when `STALWART_E2E_TARGET=local`).
 *
 * Live target reads the process env as-is (Bun auto-loads `.env`).
 * Local target overlays the harness file so the same suite runs unmodified
 * against the throwaway container at 127.0.0.1:18080.
 */
export async function stalwartE2eSetup(): Promise<StalwartClientConfig> {
  const target = process.env.STALWART_E2E_TARGET ?? "live"
  let env: Record<string, string | undefined> = process.env
  if (target === "local") {
    const localFile = Bun.file(new URL("../ops/local-stalwart/.env.local", import.meta.url))
    if (!(await localFile.exists())) {
      throw new Error(
        "STALWART_E2E_TARGET=local requires ops/local-stalwart/.env.local; run bash ops/local-stalwart/start.sh first",
      )
    }
    const overlay: Record<string, string> = {}
    for (const line of (await localFile.text()).split("\n")) {
      const trimmed = line.trim()
      if (trimmed === "" || trimmed.startsWith("#")) continue
      const eq = trimmed.indexOf("=")
      if (eq < 0) continue
      overlay[trimmed.slice(0, eq)] = trimmed.slice(eq + 1)
    }
    // Local harness file wins over the process env (incl. live `.env`).
    env = { ...process.env, ...overlay }
  }

  const configured = stalwartClientFromEnv(env)
  if (!configured.success) {
    throw new Error(`Unable to initialize the e2e Stalwart config: ${configured.errorMessage}`)
  }
  console.info(`E2E target=${target} baseUrl=${configured.data.baseUrl}`)
  return configured.data
}
