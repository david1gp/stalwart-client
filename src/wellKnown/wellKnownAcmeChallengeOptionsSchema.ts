import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** Options for `wellKnownAcmeChallenge`: fetch the ACME HTTP-01 proof for a token. */
export const wellKnownAcmeChallengeOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  token: a.pipe(a.string(), a.minLength(1)),
})

export type WellKnownAcmeChallengeOptions = a.InferInput<typeof wellKnownAcmeChallengeOptionsSchema>
