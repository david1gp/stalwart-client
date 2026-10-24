import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

/** Report object types that support destroy (all five report types). */
export const reportDestroyOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  objectType: a.union([
    a.literal("ArfExternalReport"),
    a.literal("DmarcExternalReport"),
    a.literal("TlsExternalReport"),
    a.literal("DmarcInternalReport"),
    a.literal("TlsInternalReport"),
  ]),
  ids: a.pipe(a.array(a.string()), a.minLength(1)),
  accountId: a.optional(a.string()),
})

export type ReportDestroyOptions = a.InferInput<typeof reportDestroyOptionsSchema>
