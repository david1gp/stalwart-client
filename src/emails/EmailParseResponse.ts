import type { Email } from "./Email.js"

/**
 * `Email/parse` response — Stalwart returns `{parsed, notParsable}`, not the
 * standard get envelope (`crates/jmap/src/email/parse.rs:96`).
 */
export type EmailParseResponse = {
  accountId?: string | number
  parsed?: Record<string, Email>
  notParsable?: readonly string[]
}
