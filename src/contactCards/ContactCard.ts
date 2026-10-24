/**
 * A `ContactCard` object: a JSContact card (RFC 9553) as stored by Stalwart
 * (`crates/jmap-proto/src/object/contact.rs` delegates properties to
 * `JSContactProperty`). JSContact is open by design, so only the universal
 * keys are pinned and everything else stays open.
 */
export type ContactCard = {
  "@type"?: string
  uid?: string
  addressBookIds?: Record<string, boolean>
  [property: string]: unknown
}
