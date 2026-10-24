import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** Options for `wellKnownCarddav`: `GET /.well-known/carddav` without following the redirect. */
export const wellKnownCarddavOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
})

export type WellKnownCarddavOptions = a.InferInput<typeof wellKnownCarddavOptionsSchema>
