import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { jmapHttpRequest } from "../jmap/jmapHttpRequest.js"
import { liveTracingTokenOptionsSchema, type LiveTracingTokenOptions } from "./liveTracingTokenOptionsSchema.js"

/**
 * Issue a short-lived plain-text token for live tracing (`GET /api/token/tracing`).
 *
 * Enterprise-only: the community build has no such arm and answers a generic
 * 404 (`crates/http/src/api/mod.rs`), which surfaces as a `ResultErr` — never retried.
 */
export async function liveTracingToken(options: LiveTracingTokenOptions): PromiseResult<string> {
  const op = "liveTracingToken"
  const parsed = a.safeParse(liveTracingTokenOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return jmapHttpRequest({
    config: parsed.output.config,
    method: "GET",
    path: "/api/token/tracing",
    responseType: "text",
  })
}
