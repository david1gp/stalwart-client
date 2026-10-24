/**
 * Liveness/readiness probe answer: `ok` mirrors the HTTP 2xx range, `status`
 * is the problem-JSON `status` (`{"detail":"OK","status":200,…}`) or the HTTP
 * status. A 503 `ready` (storage uninitialized,
 * `crates/http/src/request.rs:587-596`) yields `{ok: false, status: 503}`,
 * not a `ResultErr` — "not ready" is data.
 */
export type HealthStatus = {
  ok: boolean
  status: number
}
