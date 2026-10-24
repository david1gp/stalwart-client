/**
 * Outbound-delivery diagnostic stages (`GET /api/live/delivery/{target}` SSE).
 *
 * Each SSE frame carries `data: [<stage>]` and the stream ends with
 * `{type: "completed"}`. Variant set from `DeliveryStage` in
 * `crates/http/src/api/diagnose.rs` (tagged `type`, camelCase fields).
 */

interface DeliveryMx {
  exchanges: string[]
  preference: number
}

type DeliveryReportUri = { type: "mail"; email: string } | { type: "http"; url: string }

export type LiveDeliveryStage =
  | { type: "mxLookupStart"; domain: string }
  | { type: "mxLookupSuccess"; mxs: DeliveryMx[]; elapsed: number }
  | { type: "mxLookupError"; reason: string; elapsed: number }
  | { type: "mtaStsFetchStart" }
  | { type: "mtaStsFetchSuccess"; policy: unknown; elapsed: number }
  | { type: "mtaStsFetchError"; reason: string; elapsed: number }
  | { type: "mtaStsNotFound"; elapsed: number }
  | { type: "tlsRptLookupStart" }
  | { type: "tlsRptLookupSuccess"; rua: DeliveryReportUri[]; elapsed: number }
  | { type: "tlsRptLookupError"; reason: string; elapsed: number }
  | { type: "tlsRptNotFound"; elapsed: number }
  | { type: "deliveryAttemptStart"; hostname: string }
  | { type: "mtaStsVerifySuccess" }
  | { type: "mtaStsVerifyError"; reason: string }
  | { type: "tlsaLookupStart" }
  | { type: "tlsaLookupSuccess"; record: unknown; elapsed: number }
  | { type: "tlsaNotFound"; elapsed: number; reason: string }
  | { type: "tlsaLookupError"; elapsed: number; reason: string }
  | { type: "ipLookupStart" }
  | { type: "ipLookupSuccess"; remoteIps: string[]; elapsed: number }
  | { type: "ipLookupError"; reason: string; elapsed: number }
  | { type: "connectionStart"; remoteIp: string }
  | { type: "connectionSuccess"; elapsed: number }
  | { type: "connectionError"; elapsed: number; reason: string }
  | { type: "readGreetingStart" }
  | { type: "readGreetingSuccess"; elapsed: number }
  | { type: "readGreetingError"; elapsed: number; reason: string }
  | { type: "ehloStart" }
  | { type: "ehloSuccess"; elapsed: number }
  | { type: "ehloError"; elapsed: number; reason: string }
  | { type: "startTlsStart" }
  | { type: "startTlsSuccess"; elapsed: number }
  | { type: "startTlsError"; elapsed: number; reason: string }
  | { type: "daneVerifySuccess" }
  | { type: "daneVerifyError"; reason: string }
  | { type: "mailFromStart" }
  | { type: "mailFromSuccess"; elapsed: number }
  | { type: "mailFromError"; reason: string; elapsed: number }
  | { type: "rcptToStart" }
  | { type: "rcptToSuccess"; elapsed: number }
  | { type: "rcptToError"; reason: string; elapsed: number }
  | { type: "quitStart" }
  | { type: "quitCompleted"; elapsed: number }
  | { type: "completed" }
