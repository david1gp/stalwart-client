import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { jmapHttpRequest } from "../jmap/jmapHttpRequest.js"
import type { HealthStatus } from "./healthStatus.js"
import { type HealthLiveOptions, healthLiveOptionsSchema } from "./healthLiveOptionsSchema.js"

const healthBodySchema = a.object({
  status: a.number(),
})

/**
 * `GET /healthz/live` — anonymous liveness probe
 * (`crates/http/src/request.rs:578-596`, gated by anonymous-request rate
 * limits only). Always 200 `{"detail":"OK","status":200,…}` on a running
 * server.
 */
export async function healthLive(options: HealthLiveOptions): PromiseResult<HealthStatus> {
  const op = "healthLive"
  const parsed = a.safeParse(healthLiveOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const raw = await jmapHttpRequest<unknown>({
    config: parsed.output.config,
    method: "GET",
    path: "/healthz/live",
    auth: false,
  })
  if (!raw.success) return raw
  const body = a.safeParse(healthBodySchema, raw.data)
  if (!body.success) {
    return createResultError(op, "Unexpected health response shape", JSON.stringify(raw.data))
  }
  return createResult({ ok: body.output.status >= 200 && body.output.status < 300, status: body.output.status })
}
