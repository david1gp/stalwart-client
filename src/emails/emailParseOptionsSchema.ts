import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

export const emailParseOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  accountId: a.optional(a.string()),
  blobIds: a.array(a.string()),
  properties: a.optional(a.array(a.string())),
  bodyProperties: a.optional(a.array(a.string())),
  fetchTextBodyValues: a.optional(a.boolean()),
  fetchHTMLBodyValues: a.optional(a.boolean()),
  fetchAllBodyValues: a.optional(a.boolean()),
  maxBodyValueBytes: a.optional(a.pipe(a.number(), a.integer(), a.minValue(0))),
})

export type EmailParseOptions = a.InferInput<typeof emailParseOptionsSchema>
