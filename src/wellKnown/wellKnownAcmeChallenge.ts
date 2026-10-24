import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { jmapHttpRequest } from "../jmap/jmapHttpRequest.js"
import {
  wellKnownAcmeChallengeOptionsSchema,
  type WellKnownAcmeChallengeOptions,
} from "./wellKnownAcmeChallengeOptionsSchema.js"

/** ACME HTTP-01 challenge proof: the token plus the server's key-authorization text. */
export interface WellKnownAcmeChallenge {
  token: string
  proof: string
}

/**
 * `GET /.well-known/acme-challenge/{token}` — the ACME HTTP-01 challenge proof
 * (`crates/http/src/request.rs:325`; the arm only exists when ACME HTTP
 * providers are configured, otherwise the path 404s). Anonymous.
 */
export async function wellKnownAcmeChallenge(
  options: WellKnownAcmeChallengeOptions,
): PromiseResult<WellKnownAcmeChallenge> {
  const op = "wellKnownAcmeChallenge"
  const parsed = a.safeParse(wellKnownAcmeChallengeOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const proof = await jmapHttpRequest({
    config: parsed.output.config,
    method: "GET",
    path: `/.well-known/acme-challenge/${encodeURIComponent(parsed.output.token)}`,
    responseType: "text",
    auth: false,
  })
  if (!proof.success) return proof
  return createResult({ token: parsed.output.token, proof: proof.data })
}
