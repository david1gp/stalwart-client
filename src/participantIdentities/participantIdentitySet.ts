import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import { jmapAccountIdForCapability } from "../jmap/jmapAccountIdForCapability.js"
import { jmapCapabilities } from "../jmap/jmapCapabilities.js"
import { jmapSetErrorCheck } from "../jmap/jmapSetErrorCheck.js"
import type { JmapSetResponse } from "../jmap/jmapSetResponse.js"
import type { ParticipantIdentity } from "./ParticipantIdentity.js"
import {
  type ParticipantIdentitySetOptions,
  participantIdentitySetOptionsSchema,
} from "./participantIdentitySetOptionsSchema.js"

/** `ParticipantIdentity/set` — create, update and/or destroy scheduling identities. */
export async function participantIdentitySet(
  options: ParticipantIdentitySetOptions,
): PromiseResult<JmapSetResponse<ParticipantIdentity>> {
  const op = "participantIdentitySet"
  const parsed = a.safeParse(participantIdentitySetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, accountId, ifInState, create, update, destroy, onSuccessSetIsDefault } = parsed.output
  const resolved = await jmapAccountIdForCapability({ config, accountId, capability: jmapCapabilities.calendars })
  if (!resolved.success) return resolved
  const { accountId: resolvedAccountId, session } = resolved.data
  const response = await stalwartMethodCall<JmapSetResponse<ParticipantIdentity>>({
    config,
    methodName: "ParticipantIdentity/set",
    arguments: {
      accountId: resolvedAccountId,
      ...(ifInState !== undefined ? { ifInState } : {}),
      ...(create !== undefined ? { create } : {}),
      ...(update !== undefined ? { update } : {}),
      ...(destroy !== undefined ? { destroy } : {}),
      ...(onSuccessSetIsDefault !== undefined ? { onSuccessSetIsDefault } : {}),
    },
    ...(session !== undefined ? { session } : {}),
  })
  if (!response.success) return response
  return jmapSetErrorCheck(op, response.data)
}
