/** Catalog of standard JMAP capability URNs (RFC 8620 + registered extensions). */
export const jmapCapabilities = {
  core: "urn:ietf:params:jmap:core",
  mail: "urn:ietf:params:jmap:mail",
  submission: "urn:ietf:params:jmap:submission",
  vacationResponse: "urn:ietf:params:jmap:vacationresponse",
  sieve: "urn:ietf:params:jmap:sieve",
  blob: "urn:ietf:params:jmap:blob",
  quota: "urn:ietf:params:jmap:quota",
  principals: "urn:ietf:params:jmap:principals",
  contacts: "urn:ietf:params:jmap:contacts",
  calendars: "urn:ietf:params:jmap:calendars",
  fileNode: "urn:ietf:params:jmap:filenode",
  webSocket: "urn:ietf:params:jmap:websocket",
  emailPush: "urn:ietf:params:jmap:emailpush",
} as const

export type JmapCapability = (typeof jmapCapabilities)[keyof typeof jmapCapabilities]
