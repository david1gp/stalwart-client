import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `POST /scim/v2/Bulk` arguments — RFC 7644 §3.7. At least one operation. */
export const scimBulkOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  failOnErrors: a.optional(a.pipe(a.number(), a.integer(), a.minValue(0))),
  operations: a.pipe(
    a.array(
      a.object({
        method: a.picklist(["POST", "PUT", "PATCH", "DELETE"]),
        path: a.pipe(a.string(), a.minLength(1)),
        bulkId: a.optional(a.string()),
        version: a.optional(a.string()),
        data: a.optional(a.unknown()),
      }),
    ),
    a.minLength(1),
  ),
})

export type ScimBulkOptions = a.InferInput<typeof scimBulkOptionsSchema>
