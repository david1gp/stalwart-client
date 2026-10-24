import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { jmapHttpRequest } from "../jmap/jmapHttpRequest.js"
import { liveDeliveryTokenOptionsSchema, type LiveDeliveryTokenOptions } from "./liveDeliveryTokenOptionsSchema.js"

/**
 * Issue a short-lived plain-text token for live delivery diagnostics
 * (`GET /api/token/delivery`, authenticated, 60 s validity).
 *
 * The token authorizes `GET /api/live/delivery/{target}` via `?token=` for
 * EventSource clients that cannot send an `Authorization` header
 * (`operationId: issueDeliveryToken` in `api/v1/openapi.yml`).
 */
export async function liveDeliveryToken(options: LiveDeliveryTokenOptions): PromiseResult<string> {
  const op = "liveDeliveryToken"
  const parsed = a.safeParse(liveDeliveryTokenOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return jmapHttpRequest({
    config: parsed.output.config,
    method: "GET",
    path: "/api/token/delivery",
    responseType: "text",
  })
}
