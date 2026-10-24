import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { stalwartMethodCall } from "../client/stalwartMethodCall.js"
import { jmapAccountIdForCapability } from "../jmap/jmapAccountIdForCapability.js"
import { jmapCapabilities } from "../jmap/jmapCapabilities.js"
import type { BusyPeriod } from "./BusyPeriod.js"
import {
  type PrincipalGetAvailabilityOptions,
  principalGetAvailabilityOptionsSchema,
} from "./principalGetAvailabilityOptionsSchema.js"

/**
 * `Principal/getAvailability` — busy periods for a principal in a time range.
 * `using` includes the `:availability` extension URN (derived by `jmapMethodCapabilities`);
 * Stalwart itself enforces only the object capability (`crates/jmap/src/api/request.rs:109-110`).
 */
export async function principalGetAvailability(
  options: PrincipalGetAvailabilityOptions,
): PromiseResult<{ list: readonly BusyPeriod[] }> {
  const op = "principalGetAvailability"
  const parsed = a.safeParse(principalGetAvailabilityOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, accountId, id, utcStart, utcEnd, showDetails, eventProperties } = parsed.output
  const resolved = await jmapAccountIdForCapability({ config, accountId, capability: jmapCapabilities.principals })
  if (!resolved.success) return resolved
  const { accountId: resolvedAccountId, session } = resolved.data
  return stalwartMethodCall<{ list: readonly BusyPeriod[] }>({
    config,
    methodName: "Principal/getAvailability",
    arguments: {
      accountId: resolvedAccountId,
      id,
      utcStart,
      utcEnd,
      ...(showDetails !== undefined ? { showDetails } : {}),
      ...(eventProperties !== undefined ? { eventProperties } : {}),
    },
    ...(session !== undefined ? { session } : {}),
  })
}
