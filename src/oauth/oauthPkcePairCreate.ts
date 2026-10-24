import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import type { OAuthPkcePair } from "./OAuthPkcePair.js"
import {
  oauthPkcePairCreateOptionsSchema,
  type OauthPkcePairCreateOptions,
} from "./oauthPkcePairCreateOptionsSchema.js"

/**
 * Generate a PKCE verifier/challenge pair (RFC 7636, `S256`).
 *
 * Pure local helper via WebCrypto: the verifier uses the server-accepted
 * alphabet and the challenge is `BASE64URL(SHA-256(verifier))` without
 * padding (`verify_pkce` in `crates/http/src/auth/oauth/token.rs`).
 */
export async function oauthPkcePairCreate(options?: OauthPkcePairCreateOptions): PromiseResult<OAuthPkcePair> {
  const op = "oauthPkcePairCreate"
  const parsed = a.safeParse(oauthPkcePairCreateOptionsSchema, options ?? {})
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const length = parsed.output.length ?? 64
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~"
  try {
    const random = crypto.getRandomValues(new Uint8Array(length))
    let verifier = ""
    for (const byte of random) verifier += alphabet[byte % alphabet.length]
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier))
    const challenge = Buffer.from(digest).toString("base64url")
    return createResult({ verifier, challenge, method: "S256" as const })
  } catch (error) {
    return createResultError(
      op,
      "Generating the PKCE pair failed",
      error instanceof Error ? error.message : String(error),
    )
  }
}
