/** Well-known JMAP endpoint paths (RFC 8620 §2 + server conventions). */
export const jmapPaths = {
  wellKnown: "/.well-known/jmap",
  session: "/jmap/session",
  api: "/jmap/",
} as const
