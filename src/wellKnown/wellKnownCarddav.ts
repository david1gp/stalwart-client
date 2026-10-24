import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { jmapHttpRequest } from "../jmap/jmapHttpRequest.js"
import type { WellKnownRedirect } from "./WellKnownRedirect.js"
import { type WellKnownCarddavOptions, wellKnownCarddavOptionsSchema } from "./wellKnownCarddavOptionsSchema.js"

/**
 * `GET /.well-known/carddav` — discovery redirect (307 to the DAV base; WebDAV itself is out of scope, `crates/http/src/request.rs:297`).
 * Returns `{status, location}` without following the redirect.
 */
export async function wellKnownCarddav(options: WellKnownCarddavOptions): PromiseResult<WellKnownRedirect> {
  const op = "wellKnownCarddav"
  const parsed = a.safeParse(wellKnownCarddavOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return jmapHttpRequest({
    config: parsed.output.config,
    method: "GET",
    path: "/.well-known/carddav",
    responseType: "redirect",
  })
}
