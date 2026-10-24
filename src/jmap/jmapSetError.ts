/** Standard JMAP `Set` per-id failure entry. */
export type JmapSetError = {
  type: string
  description?: string
  properties?: readonly unknown[]
  [key: string]: unknown
}
