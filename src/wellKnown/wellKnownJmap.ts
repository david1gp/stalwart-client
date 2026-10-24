import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { jmapHttpRequest } from "../jmap/jmapHttpRequest.js"
import type { WellKnownRedirect } from "./WellKnownRedirect.js"
import { type WellKnownJmapOptions, wellKnownJmapOptionsSchema } from "./wellKnownJmapOptionsSchema.js"

/**
 * `GET /.well-known/jmap` — discovery redirect (307 to `/jmap/session`, `crates/http/src/request.rs:289`).
 * Returns `{status, location}` without following the redirect.
 */
export async function wellKnownJmap(options: WellKnownJmapOptions): PromiseResult<WellKnownRedirect> {
  const op = "wellKnownJmap"
  const parsed = a.safeParse(wellKnownJmapOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return jmapHttpRequest({
    config: parsed.output.config,
    method: "GET",
    path: "/.well-known/jmap",
    responseType: "redirect",
  })
}
