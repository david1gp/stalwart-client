/**
 * Authenticated account descriptor (`GET /api/account`).
 *
 * Shape from the `Account` schema in `api/v1/openapi.yml`: effective
 * permissions, server edition and account locale.
 */
export interface ManagementAccountInfo {
  permissions: string[]
  edition: string
  locale: string
}
