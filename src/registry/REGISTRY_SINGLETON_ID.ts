/**
 * Singleton registry objects (`x:Imap`, `x:SystemSettings`, …) have exactly one
 * instance whose id is the literal `"singleton"`. `x:<T>/get` without `ids`
 * returns an empty list for singletons, so always pass `ids: ["singleton"]`.
 * Verified against Stalwart `crates/jmap/src/registry/get.rs` and the local instance.
 */
export const REGISTRY_SINGLETON_ID = "singleton"
