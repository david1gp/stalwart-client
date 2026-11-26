import type { JmapSetError } from "../jmap/jmapSetError.js"
import type { Mdn } from "./Mdn.js"

/**
 * `MDN/send` response (`crates/jmap-proto/src/method/mdn.rs:33-45`): creation
 * id → the sent MDN, plus per-id `notSent` failures (`mdnAlreadySent`,
 * `forbiddenFrom`, `invalidProperties`, `notFound`, …). Empty maps are omitted
 * on the wire, hence optional here.
 */
export type MdnSendResponse = {
  accountId: string | number
  sent?: Record<string, Mdn>
  notSent?: Record<string, JmapSetError>
}
