import type { Result } from "#result"
import type { StalwartClientConfig } from "../client/stalwartClientConfigSchema.js"
import { stalwartClientFromEnv } from "../client/stalwartClientFromEnv.js"
import type { CliConfigFlags } from "./cliConfigFlags.js"

/** Load config from env with optional flag overrides. */
export function cliConfigLoad(flags: CliConfigFlags = {}): Result<StalwartClientConfig> {
  const env: Record<string, string | undefined> = { ...process.env }
  if (flags.baseUrl !== undefined) env.STALWART_BASE_URL = flags.baseUrl
  if (flags.username !== undefined) env.STALWART_USERNAME = flags.username
  if (flags.password !== undefined) env.STALWART_PASSWORD = flags.password
  if (flags.token !== undefined) env.STALWART_TOKEN = flags.token
  if (flags.accountId !== undefined) env.STALWART_ACCOUNT_ID = flags.accountId
  return stalwartClientFromEnv(env)
}
