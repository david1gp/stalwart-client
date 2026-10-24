import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

export const emailCopyOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  /** Source account (default: session primary account for mail). */
  fromAccountId: a.optional(a.string()),
  /** Destination account (default: session primary account for mail). */
  accountId: a.optional(a.string()),
  ifInState: a.optional(a.string()),
  ifFromInState: a.optional(a.string()),
  /**
   * One entry per copied email: `{<creationId>: {id: <sourceEmailId>, mailboxIds: {<id>: true}, keywords?}}`.
   * Note: Stalwart takes `create` here, not the RFC 8621 `creationIds` array.
   */
  create: a.record(a.string(), a.record(a.string(), a.unknown())),
  onSuccessDestroyOriginal: a.optional(a.boolean()),
  destroyFromIfInState: a.optional(a.string()),
})

export type EmailCopyOptions = a.InferInput<typeof emailCopyOptionsSchema>
