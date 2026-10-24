import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { jmapHttpRequest } from "../jmap/jmapHttpRequest.js"
import type { WellKnownRedirect } from "./WellKnownRedirect.js"
import { type WellKnownCaldavOptions, wellKnownCaldavOptionsSchema } from "./wellKnownCaldavOptionsSchema.js"

/**
 * `GET /.well-known/caldav` — discovery redirect (307 to the DAV base; WebDAV itself is out of scope, `crates/http/src/request.rs:294`).
 * Returns `{status, location}` without following the redirect.
 */
export async function wellKnownCaldav(options: WellKnownCaldavOptions): PromiseResult<WellKnownRedirect> {
  const op = "wellKnownCaldav"
  const parsed = a.safeParse(wellKnownCaldavOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return jmapHttpRequest({
    config: parsed.output.config,
    method: "GET",
    path: "/.well-known/caldav",
    responseType: "redirect",
  })
}
