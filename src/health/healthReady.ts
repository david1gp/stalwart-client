import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { jmapHttpRequest } from "../jmap/jmapHttpRequest.js"
import type { HealthStatus } from "./healthStatus.js"
import { type HealthReadyOptions, healthReadyOptionsSchema } from "./healthReadyOptionsSchema.js"

const healthBodySchema = a.object({
  status: a.number(),
})

/**
 * `GET /healthz/ready` — anonymous readiness probe
 * (`crates/http/src/request.rs:587-596`). 200 once the store is initialized,
 * 503 while it is not — the 503 maps to `{ok: false, status: 503}` rather
 * than a `ResultErr`.
 */
export async function healthReady(options: HealthReadyOptions): PromiseResult<HealthStatus> {
  const op = "healthReady"
  const parsed = a.safeParse(healthReadyOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const raw = await jmapHttpRequest<unknown>({
    config: parsed.output.config,
    method: "GET",
    path: "/healthz/ready",
    auth: false,
  })
  if (!raw.success) {
    if (raw.errorData !== undefined && raw.errorData !== null) {
      try {
        const body = a.safeParse(healthBodySchema, JSON.parse(raw.errorData))
        if (body.success) return createResult({ ok: false, status: body.output.status })
      } catch {
        // not a problem-JSON body: fall through to the transport error
      }
    }
    return raw
  }
  const body = a.safeParse(healthBodySchema, raw.data)
  if (!body.success) {
    return createResultError(op, "Unexpected health response shape", JSON.stringify(raw.data))
  }
  return createResult({ ok: body.output.status >= 200 && body.output.status < 300, status: body.output.status })
}
