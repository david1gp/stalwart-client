import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import { jmapAccountIdForCapability } from "../jmap/jmapAccountIdForCapability.js"
import { jmapCapabilities } from "../jmap/jmapCapabilities.js"
import type { JmapGetResponse } from "../jmap/jmapGetResponse.js"
import type { ParticipantIdentity } from "./ParticipantIdentity.js"
import {
  type ParticipantIdentityGetOptions,
  participantIdentityGetOptionsSchema,
} from "./participantIdentityGetOptionsSchema.js"

/** `ParticipantIdentity/get` — fetch scheduling identities by id. */
export async function participantIdentityGet(
  options: ParticipantIdentityGetOptions,
): PromiseResult<JmapGetResponse<ParticipantIdentity>> {
  const op = "participantIdentityGet"
  const parsed = a.safeParse(participantIdentityGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, accountId, ids, properties } = parsed.output
  const resolved = await jmapAccountIdForCapability({ config, accountId, capability: jmapCapabilities.calendars })
  if (!resolved.success) return resolved
  const { accountId: resolvedAccountId, session } = resolved.data
  return stalwartMethodCall<JmapGetResponse<ParticipantIdentity>>({
    config,
    methodName: "ParticipantIdentity/get",
    arguments: {
      accountId: resolvedAccountId,
      ...(ids !== undefined ? { ids } : {}),
      ...(properties !== undefined ? { properties } : {}),
    },
    ...(session !== undefined ? { session } : {}),
  })
}
