import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

const principalPatchSchema = a.record(a.string(), a.unknown())

/**
 * `Principal/set` arguments. Note: the method name parses
 * (`crates/jmap-proto/src/request/method.rs:290`) but Stalwart ships no
 * `SetRequestMethod::Principal` arm (`parser.rs` falls through to
 * "Invalid method function/object combination"), so the server rejects the
 * call — the op still exists so callers get that server error as a ResultErr.
 */
export const principalSetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  ifInState: a.optional(a.string()),
  create: a.optional(a.record(a.string(), principalPatchSchema)),
  update: a.optional(a.record(a.string(), principalPatchSchema)),
  destroy: a.optional(a.array(a.string())),
})

export type PrincipalSetOptions = a.InferInput<typeof principalSetOptionsSchema>
