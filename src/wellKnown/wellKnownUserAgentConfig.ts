import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { jmapHttpRequest } from "../jmap/jmapHttpRequest.js"
import type { UserAgentConfig } from "./UserAgentConfig.js"
import {
  wellKnownUserAgentConfigOptionsSchema,
  type WellKnownUserAgentConfigOptions,
} from "./wellKnownUserAgentConfigOptionsSchema.js"

/** Parsed PACC document plus the raw JSON text. */
export interface WellKnownUserAgentConfig {
  config: UserAgentConfig
  raw: string
}

const userAgentConfigSchema = a.object({
  protocols: a.optional(a.record(a.string(), a.unknown())),
  authentication: a.optional(a.record(a.string(), a.unknown())),
  info: a.optional(a.record(a.string(), a.unknown())),
})

/**
 * `GET /.well-known/user-agent-configuration.json` — the per-`Host` provider
 * auto-configuration document (PACC draft, `crates/http/src/request.rs:350`).
 * Returns the typed parsed document and the raw text.
 */
export async function wellKnownUserAgentConfig(
  options: WellKnownUserAgentConfigOptions,
): PromiseResult<WellKnownUserAgentConfig> {
  const op = "wellKnownUserAgentConfig"
  const parsed = a.safeParse(wellKnownUserAgentConfigOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const raw = await jmapHttpRequest({
    config: parsed.output.config,
    method: "GET",
    path: "/.well-known/user-agent-configuration.json",
    responseType: "text",
    auth: false,
  })
  if (!raw.success) return raw
  let decoded: unknown
  try {
    decoded = JSON.parse(raw.data) as unknown
  } catch (error) {
    return createResultError(
      op,
      "Invalid JSON user-agent configuration",
      error instanceof Error ? error.message : String(error),
    )
  }
  const typed = a.safeParse(userAgentConfigSchema, decoded)
  if (!typed.success)
    return createResultError(op, `Unexpected user-agent configuration shape: ${a.summarize(typed.issues)}`)
  return createResult({ config: typed.output as UserAgentConfig, raw: raw.data })
}
