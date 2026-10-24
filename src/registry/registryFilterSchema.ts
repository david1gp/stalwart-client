import * as a from "valibot"

/**
 * Registry `/query` filter: a flat AND of conditions. Each key is a property
 * name (equality) or `<property>Is{GreaterThan,GreaterThanOrEqual,LessThan,LessThanOrEqual}`;
 * `text` is a free-text match on objects that support it. Values are JSON scalars.
 * Source: `crates/jmap-proto/src/object/registry.rs`, `crates/jmap/src/registry/query.rs`.
 */
export const registryFilterSchema = a.record(a.string(), a.union([a.string(), a.number(), a.boolean(), a.null()]))

export type RegistryFilter = a.InferOutput<typeof registryFilterSchema>
