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
  principalsAvailability: "urn:ietf:params:jmap:principals:availability",
  principalsOwner: "urn:ietf:params:jmap:principals:owner",
  contacts: "urn:ietf:params:jmap:contacts",
  contactsParse: "urn:ietf:params:jmap:contacts:parse",
  calendars: "urn:ietf:params:jmap:calendars",
  calendarsParse: "urn:ietf:params:jmap:calendars:parse",
  fileNode: "urn:ietf:params:jmap:filenode",
  webSocket: "urn:ietf:params:jmap:websocket",
  emailPush: "urn:ietf:params:jmap:emailpush",
  mailShare: "urn:ietf:params:jmap:mail:share",
  webPushVapid: "urn:ietf:params:jmap:webpush-vapid",
} as const

export type JmapCapability = (typeof jmapCapabilities)[keyof typeof jmapCapabilities]
