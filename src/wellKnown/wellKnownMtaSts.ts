import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { jmapHttpRequest } from "../jmap/jmapHttpRequest.js"
import { wellKnownMtaStsOptionsSchema, type WellKnownMtaStsOptions } from "./wellKnownMtaStsOptionsSchema.js"

/** MTA-STS policy: parsed `key: value` lines plus the raw policy text. */
export interface WellKnownMtaSts {
  policy: Record<string, string>
  raw: string
}

/**
 * `GET /.well-known/mta-sts.txt` — the MTA-STS policy (`crates/http/src/request.rs:338`;
 * only served when `mtaStsPolicy` is configured, otherwise the path 404s).
 * The policy is `key: value` lines (RFC 8461 §3.2); both are returned.
 */
export async function wellKnownMtaSts(options: WellKnownMtaStsOptions): PromiseResult<WellKnownMtaSts> {
  const op = "wellKnownMtaSts"
  const parsed = a.safeParse(wellKnownMtaStsOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const raw = await jmapHttpRequest({
    config: parsed.output.config,
    method: "GET",
    path: "/.well-known/mta-sts.txt",
    responseType: "text",
    auth: false,
  })
  if (!raw.success) return raw
  const policy: Record<string, string> = {}
  for (const line of raw.data.split(/\r?\n/)) {
    const colon = line.indexOf(":")
    if (colon < 0) continue
    const key = line.slice(0, colon).trim()
    if (key === "") continue
    policy[key] = line.slice(colon + 1).trim()
  }
  return createResult({ policy, raw: raw.data })
}
