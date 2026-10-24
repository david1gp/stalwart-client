import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** Options for `wellKnownCaldav`: `GET /.well-known/caldav` without following the redirect. */
export const wellKnownCaldavOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
})

export type WellKnownCaldavOptions = a.InferInput<typeof wellKnownCaldavOptionsSchema>
