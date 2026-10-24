import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { jmapHttpRequest } from "../jmap/jmapHttpRequest.js"
import { robotsTxtOptionsSchema, type RobotsTxtOptions } from "./robotsTxtOptionsSchema.js"

/**
 * `GET /robots.txt` — the static crawler policy (`User-agent: * / Disallow: /`,
 * `crates/http/src/request.rs:568`). Returns the raw text.
 */
export async function robotsTxt(options: RobotsTxtOptions): PromiseResult<string> {
  const op = "robotsTxt"
  const parsed = a.safeParse(robotsTxtOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return jmapHttpRequest({
    config: parsed.output.config,
    method: "GET",
    path: "/robots.txt",
    responseType: "text",
    auth: false,
  })
}
