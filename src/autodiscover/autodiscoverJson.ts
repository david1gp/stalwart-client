import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { jmapHttpRequest } from "../jmap/jmapHttpRequest.js"
import { autodiscoverJsonOptionsSchema, type AutodiscoverJsonOptions } from "./autodiscoverJsonOptionsSchema.js"

/**
 * Autodiscover V2 result: either the redirect to the XML endpoint or the
 * server's `InvalidProtocol` error payload. The server answers HTTP 200 for the
 * former and HTTP 400 for the latter
 * (`crates/common/src/network/autoconfig/autodiscover_v2.rs:11`); both carry
 * the raw body.
 */
export type AutodiscoverJson =
  | { outcome: "ok"; protocol: string; url: string; raw: string }
  | { outcome: "error"; errorCode: string; errorMessage: string; raw: string }

/**
 * `GET /autodiscover/autodiscover.json` — Autodiscover V2
 * (`crates/http/src/request.rs:548`; `?Email=` query or path email, `?Protocol=`
 * must be `AutodiscoverV1`). Only `AutodiscoverV1` is supported; anything else
 * is a 400 `InvalidProtocol` ResultErr whose errorData carries the payload.
 */
export async function autodiscoverJson(options: AutodiscoverJsonOptions): PromiseResult<AutodiscoverJson> {
  const op = "autodiscoverJson"
  const parsed = a.safeParse(autodiscoverJsonOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const raw = await jmapHttpRequest({
    config: parsed.output.config,
    method: "GET",
    path: "/autodiscover/autodiscover.json",
    query: {
      Email: parsed.output.email,
      ...(parsed.output.protocol === undefined ? {} : { Protocol: parsed.output.protocol }),
    },
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
      "Invalid JSON autodiscover response",
      error instanceof Error ? error.message : String(error),
    )
  }
  if (typeof decoded !== "object" || decoded === null) {
    return createResultError(op, "Unexpected autodiscover response shape", raw.data)
  }
  const record = decoded as Record<string, unknown>
  if (typeof record["Url"] === "string" && typeof record["Protocol"] === "string") {
    return createResult({ outcome: "ok", protocol: record["Protocol"], url: record["Url"], raw: raw.data })
  }
  if (typeof record["ErrorCode"] === "string" && typeof record["ErrorMessage"] === "string") {
    return createResult({
      outcome: "error",
      errorCode: record["ErrorCode"],
      errorMessage: record["ErrorMessage"],
      raw: raw.data,
    })
  }
  return createResultError(op, "Unexpected autodiscover response shape", raw.data)
}
