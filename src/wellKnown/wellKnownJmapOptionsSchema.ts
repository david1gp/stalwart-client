import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** Options for `wellKnownJmap`: `GET /.well-known/jmap` without following the redirect. */
export const wellKnownJmapOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
})

export type WellKnownJmapOptions = a.InferInput<typeof wellKnownJmapOptionsSchema>
