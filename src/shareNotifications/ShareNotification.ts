/**
 * A `ShareNotification` object (capability `urn:ietf:params:jmap:principals`;
 * properties in `crates/jmap-proto/src/object/share_notification.rs:19-44`).
 * Notifications are read-only: `ShareNotification/set` only supports `destroy`
 * (acknowledge); create/update always fail with `forbidden`
 * (`crates/jmap/src/share_notification/set.rs`).
 */
export type ShareNotification = {
  id: string
  created?: string
  changedBy?: {
    name?: string
    email?: string
    principalId?: string
  }
  objectType?: string
  objectAccountId?: string
  objectId?: string
  oldRights?: Record<string, boolean>
  newRights?: Record<string, boolean>
  name?: string | null
}
