import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { jmapHttpRequest } from "../jmap/jmapHttpRequest.js"
import { liveMetricsTokenOptionsSchema, type LiveMetricsTokenOptions } from "./liveMetricsTokenOptionsSchema.js"

/**
 * Issue a short-lived plain-text token for live metrics (`GET /api/token/metrics`).
 *
 * Enterprise-only: the community build has no such arm and answers a generic
 * 404 (`crates/http/src/api/mod.rs`), which surfaces as a `ResultErr` — never retried.
 */
export async function liveMetricsToken(options: LiveMetricsTokenOptions): PromiseResult<string> {
  const op = "liveMetricsToken"
  const parsed = a.safeParse(liveMetricsTokenOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return jmapHttpRequest({
    config: parsed.output.config,
    method: "GET",
    path: "/api/token/metrics",
    responseType: "text",
  })
}
