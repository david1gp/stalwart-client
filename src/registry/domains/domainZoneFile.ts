import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { domainGet } from "./domainGet.js"
import { domainZoneFileOptionsSchema, type DomainZoneFileOptions } from "./domainZoneFileOptionsSchema.js"

/**
 * Read the `dnsZoneFile` property of an `x:Domain` — the `x:Domain/DomainZone`
 * view. Views are schema-only groupings with no separate wire methods (see
 * `resources/schema/schema.json.gz`: the view object is just
 * `{type: "view", objectName: "x:Domain"}`), so this is an `x:Domain/get`
 * with `properties: ["dnsZoneFile"]`.
 */
export async function domainZoneFile(options: DomainZoneFileOptions): PromiseResult<string> {
  const op = "domainZoneFile"
  const parsed = a.safeParse(domainZoneFileOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const got = await domainGet({ config: parsed.output.config, ids: [parsed.output.id], properties: ["dnsZoneFile"] })
  if (!got.success) return got
  const zone = got.data.list[0]?.dnsZoneFile
  if (typeof zone !== "string")
    return createResultError(op, `Domain ${parsed.output.id} not found`, JSON.stringify(got.data))
  return createResult(zone)
}
