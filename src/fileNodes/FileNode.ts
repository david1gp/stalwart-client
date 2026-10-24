/**
 * A `FileNode` object (JMAP FileNode; properties in
 * `crates/jmap-proto/src/object/file_node.rs:48-70`).
 */
export type FileNode = {
  id: string
  parentId?: string | null
  blobId?: string | null
  size?: number
  name?: string
  type?: string | null
  role?: string | null
  myRights?: Record<string, boolean>
  shareWith?: Record<string, Record<string, boolean>>
  isSubscribed?: boolean
}
