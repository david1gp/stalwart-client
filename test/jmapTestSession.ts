import type { JmapSession } from "../src/jmap/jmapSession.js"

/** Minimal valid JMAP session fixture for mocked-fetch tests. */
export function jmapTestSessionCreate(): JmapSession {
  return {
    capabilities: {
      "urn:ietf:params:jmap:core": {},
      "urn:ietf:params:jmap:mail": {},
      "urn:stalwart:jmap": {},
    },
    accounts: {
      a1: {
        name: "admin@example.com",
        isPersonal: true,
        isReadOnly: false,
        accountCapabilities: {},
      },
    },
    primaryAccounts: {
      "urn:ietf:params:jmap:core": "a1",
      "urn:ietf:params:jmap:mail": "a1",
      "urn:stalwart:jmap": "a1",
    },
    username: "admin@example.com",
    apiUrl: "https://mail.example.com/jmap/",
    downloadUrl: "https://mail.example.com/jmap/download/{accountId}/{blobId}/{name}?accept={type}",
    uploadUrl: "https://mail.example.com/jmap/upload/{accountId}/",
    eventSourceUrl: "https://mail.example.com/jmap/eventsource/?types={types}&closeafter={closeafter}&ping={ping}",
    state: "1",
  }
}
