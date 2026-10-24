import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `ParticipantIdentity/get` arguments. */
export const participantIdentityGetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  ids: a.optional(a.array(a.string())),
  properties: a.optional(a.array(a.string())),
})

export type ParticipantIdentityGetOptions = a.InferInput<typeof participantIdentityGetOptionsSchema>
