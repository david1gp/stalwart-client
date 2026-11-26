import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"
import type { Mdn } from "./Mdn.js"

/**
 * `MDN/send` arguments (`crates/jmap-proto/src/method/mdn.rs:24-31`, handler at
 * `crates/jmap/src/mdn/send.rs`). `identityId` is required: the server rejects
 * the call with `invalidArguments` when it is missing or invalid. `send` maps
 * creation ids to MDN objects. Runtime values stay loose records (like
 * `EmailSubmission/set` creations) because the server parses disposition enums
 * case-insensitively and validates each item semantically (`invalidProperties`,
 * `notFound`, … per id in `notSent`); the schema only enforces the
 * object-of-objects boundary and never the inner MDN fields.
 * `onSuccessUpdateEmail` patches must set the `$mdnsent` keyword for each
 * sent id or the server rejects the call.
 */
export const mdnSendOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  identityId: a.pipe(a.string(), a.minLength(1)),
  send: a.record(a.string(), a.record(a.string(), a.unknown())),
  onSuccessUpdateEmail: a.optional(a.record(a.string(), a.record(a.string(), a.unknown()))),
})

export type MdnSendOptions = Omit<a.InferInput<typeof mdnSendOptionsSchema>, "send"> & {
  send: Record<string, Mdn>
}
