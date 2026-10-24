import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `ParticipantIdentity/changes` arguments. */
export const participantIdentityChangesOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  sinceState: a.string(),
  maxChanges: a.optional(a.pipe(a.number(), a.integer(), a.minValue(0))),
})

export type ParticipantIdentityChangesOptions = a.InferInput<typeof participantIdentityChangesOptionsSchema>
