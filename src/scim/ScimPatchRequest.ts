/**
 * SCIM `PATCH` operation (RFC 7644 §3.5.2;
 * `crates/scim-proto/src/message/patch.rs`).
 *
 * The wire body is `{schemas: ["...PatchOp"], Operations: [...]}` with a
 * capital `O`; `op` is one of `add`/`remove`/`replace` (case-insensitive on
 * the server). `path` is a SCIM path expression such as `displayName` or
 * `emails[type eq "work"].value`; `remove` carries no `value`.
 */
export type ScimPatchOperation = {
  op: "add" | "remove" | "replace"
  path?: string
  value?: unknown
}

export type ScimPatchRequest = {
  schemas?: string[]
  Operations: ScimPatchOperation[]
}
