import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapQueryResponse } from "../../jmap/jmapQueryResponse.js"
import { registryQuery } from "../registryQuery.js"
import { type GroupQueryOptions, groupQueryOptionsSchema } from "./groupQueryOptionsSchema.js"

/**
 * `x:Account/query` filtered to `@type: "Group"` — the WebUI Group view.
 * Account/User and Account/Group are WebUI filters, not separate
 * methods: the server keeps one `x:Account` object whose `@type` is `User`
 * or `Group` (`crates/registry/src/schema/structs_impl.rs:73-80`), and
 * `x:Account/query` accepts an indexed `type` filter with the `AccountType`
 * values `User`/`Group` (`crates/jmap/src/registry/query.rs:207-210`,
 * `crates/registry/src/schema/enums_impl.rs:11-18`; the filter key is the
 * `@type` property name, `crates/registry/src/schema/properties_impl.rs:410}).
 */
export async function groupQuery(options: GroupQueryOptions): PromiseResult<JmapQueryResponse> {
  const op = "groupQuery"
  const parsed = a.safeParse(groupQueryOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, filter, ...rest } = parsed.output
  return registryQuery({ config, objectType: "Account" as const, filter: { "@type": "Group", ...filter }, ...rest })
}
