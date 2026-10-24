/** Every `x:Action` `@type` the server accepts (`crates/jmap/src/registry/mapping/action.rs`). */
export const actionTypes = [
  "ReloadSettings",
  "ReloadTlsCertificates",
  "ReloadLookupStores",
  "ReloadBlockedIps",
  "UpdateApps",
  "TroubleshootDmarc",
  "ClassifySpam",
  "InvalidateCaches",
  "InvalidateNegativeCaches",
  "PauseMtaQueue",
  "ResumeMtaQueue",
] as const
