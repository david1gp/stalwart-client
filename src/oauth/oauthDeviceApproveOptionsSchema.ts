import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/**
 * Approve a device flow via `POST /api/auth` (`type: "authDevice"`).
 * `code` is the user-facing `user_code` from `oauthDeviceAuthorize`.
 */
export const oauthDeviceApproveOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountName: a.pipe(a.string(), a.minLength(1)),
  accountSecret: a.pipe(a.string(), a.minLength(1)),
  code: a.pipe(a.string(), a.minLength(1)),
  mfaToken: a.optional(a.string()),
})

export type OauthDeviceApproveOptions = a.InferInput<typeof oauthDeviceApproveOptionsSchema>
