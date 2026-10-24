import * as a from "valibot"
import { stalwartClientConfigSchema } from "../client/stalwartClientConfigSchema.js"

/** `POST /scim/v2/Users/.search` arguments — the `SearchRequest` as fields. */
export const scimUserSearchOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  filter: a.optional(a.string()),
  sortBy: a.optional(a.string()),
  sortOrder: a.optional(a.picklist(["ascending", "descending"])),
  startIndex: a.optional(a.pipe(a.number(), a.integer(), a.minValue(1))),
  count: a.optional(a.pipe(a.number(), a.integer(), a.minValue(0))),
  cursor: a.optional(a.string()),
  attributes: a.optional(a.array(a.string())),
  excludedAttributes: a.optional(a.array(a.string())),
})

export type ScimUserSearchOptions = a.InferInput<typeof scimUserSearchOptionsSchema>
