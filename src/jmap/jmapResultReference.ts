/** A JMAP result reference: `{resultOf, name, path}` (RFC 8620 §3.7). */
export type JmapResultReference = {
  resultOf: string
  name: string
  path: string
}
