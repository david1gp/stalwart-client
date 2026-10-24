/**
 * Configuration schema document (`GET /api/schema/{hash}`).
 *
 * `hash` is the SHA-256 from `managementSchemaRedirect`; `schema` is the
 * gunzipped, parsed JSON (fetch decompresses `Content-Encoding: gzip`
 * transparently). The document describes the full Stalwart configuration
 * tree (150 objects).
 */
export interface ManagementSchemaDocument {
  hash: string
  schema: Record<string, unknown>
}
