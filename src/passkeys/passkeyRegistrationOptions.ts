import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { STALWART_CAPABILITY } from "../client/stalwartCapabilityResolver.js"
import { jmapAccountIdForCapability } from "../jmap/jmapAccountIdForCapability.js"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import type { PasskeyRegistrationOptionsResponse } from "./PasskeyRegistrationOptionsResponse.js"
import {
  passkeyRegistrationOptionsSchema,
  type PasskeyRegistrationOptionsOptions,
} from "./passkeyRegistrationOptionsSchema.js"

/**
 * `x:Passkey/registrationOptions` — fetch WebAuthn creation options for
 * registering a passkey (`crates/jmap-proto/src/method/passkey.rs`, handler
 * at `crates/jmap/src/registry/mapping/passkey.rs`). `using` is exactly core
 * + `urn:stalwart:jmap` via `stalwartMethodCall`. The returned `publicKey`
 * options belong to the caller's WebAuthn ceremony (browser or platform);
 * this client never performs that ceremony.
 */
export async function passkeyRegistrationOptions(
  options: PasskeyRegistrationOptionsOptions,
): PromiseResult<PasskeyRegistrationOptionsResponse> {
  const op = "passkeyRegistrationOptions"
  const parsed = a.safeParse(passkeyRegistrationOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const resolved = await jmapAccountIdForCapability({
    config: parsed.output.config,
    accountId: parsed.output.accountId,
    capability: STALWART_CAPABILITY,
  })
  if (!resolved.success) return resolved
  return stalwartMethodCall<PasskeyRegistrationOptionsResponse>({
    config: parsed.output.config,
    methodName: "x:Passkey/registrationOptions",
    arguments: bodyOmitUndefined({
      accountId: resolved.data.accountId,
      currentSecret: parsed.output.currentSecret,
      otpCode: parsed.output.otpCode,
    }),
    ...(resolved.data.session === undefined ? {} : { session: resolved.data.session }),
  })
}
