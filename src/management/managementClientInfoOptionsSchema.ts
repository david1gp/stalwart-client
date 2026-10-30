import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/**
 * `GET /api/auth/client` (anonymous; Stalwart v1). `query` is either the
 * authorization query string (`client_id=…&redirect_uri=…&…`, as built for
 * an `authCode` login) or `user_code=…` for a device flow — the server
 * branches on the presence of `user_code`
 * (`handle_client_info_request` in `crates/http/src/auth/oauth/auth.rs`).
 */
export const managementClientInfoOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  query: a.pipe(a.string(), a.minLength(1)),
})

export type ManagementClientInfoOptions = a.InferInput<typeof managementClientInfoOptionsSchema>
