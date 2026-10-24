/**
 * SCIM `ServiceProviderConfig` (RFC 7643 §5;
 * `crates/scim-proto/src/schema/spc.rs`).
 *
 * Stalwart's defaults: `patch`/`filter`/`sort`/`etag` supported,
 * `changePassword` unsupported, bulk capped at 1000 operations / 1 MiB,
 * default page size 100 (max 200) with both `index` and `cursor` pagination,
 * and a single `oauthbearertoken` authentication scheme (Stalwart API key as
 * an HTTP Bearer token). `GET /scim/v2/ServiceProviderConfig` rejects
 * filtered requests.
 */
import type { ScimMeta } from "./ScimMeta.js"
export type ScimSupported = {
  supported: boolean
}

export type ScimServiceProviderConfig = {
  schemas: string[]
  documentationUri?: string
  patch: ScimSupported
  bulk: ScimSupported & { maxOperations?: number; maxPayloadSize?: number }
  filter: ScimSupported & { maxResults?: number }
  changePassword: ScimSupported
  sort: ScimSupported
  etag: ScimSupported
  pagination?: ScimSupported & {
    cursor?: boolean
    index?: boolean
    defaultPaginationMethod?: "cursor" | "index"
    defaultPageSize?: number
    maxPageSize?: number
    cursorTimeout?: number
  }
  authenticationSchemes?: {
    type?: string
    name?: string
    description?: string
    specUri?: string
    documentationUri?: string
    primary?: boolean
  }[]
  interopProfileConformant?: boolean
  meta?: ScimMeta
}
