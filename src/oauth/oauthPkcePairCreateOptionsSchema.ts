import * as a from "valibot"

/** Local PKCE pair generation (no HTTP). `length` is the verifier length. */
export const oauthPkcePairCreateOptionsSchema = a.object({
  length: a.optional(a.pipe(a.number(), a.integer(), a.minValue(43), a.maxValue(128))),
})

export type OauthPkcePairCreateOptions = a.InferInput<typeof oauthPkcePairCreateOptionsSchema>
