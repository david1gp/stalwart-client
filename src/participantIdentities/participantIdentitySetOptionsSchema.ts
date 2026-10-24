import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

const participantIdentityPatchSchema = a.record(a.string(), a.unknown())

/**
 * `ParticipantIdentity/set` arguments.
 * `ParticipantIdentitySetArguments`
 * (`crates/jmap-proto/src/object/participant_identity.rs:89-110`) adds
 * `onSuccessSetIsDefault`.
 */
export const participantIdentitySetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  ifInState: a.optional(a.string()),
  create: a.optional(a.record(a.string(), participantIdentityPatchSchema)),
  update: a.optional(a.record(a.string(), participantIdentityPatchSchema)),
  destroy: a.optional(a.array(a.string())),
  onSuccessSetIsDefault: a.optional(a.string()),
})

export type ParticipantIdentitySetOptions = a.InferInput<typeof participantIdentitySetOptionsSchema>
