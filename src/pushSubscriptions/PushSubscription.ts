/**
 * A `PushSubscription` object (RFC 8620 §7.2; properties in
 * `crates/jmap-proto/src/object/push_subscription.rs:48-66`).
 */
export type PushSubscription = {
  id: string
  deviceClientId?: string | null
  url?: string
  keys?: {
    p256dh?: string
    auth?: string
  } | null
  verificationCode?: string | null
  expires?: string | null
  types?: readonly string[] | null
  [property: string]: unknown
}
