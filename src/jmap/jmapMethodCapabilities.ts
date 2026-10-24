import { createResult, createResultError, type Result } from "#result"
import { jmapCapabilities } from "./jmapCapabilities.js"
import type { JmapCapabilityResolver } from "./jmapCapabilityResolver.js"

/** Derive the JMAP `using` array for a standard method name. Always includes core. */
export function jmapMethodCapabilities(methodName: string, ...resolvers: JmapCapabilityResolver[]): Result<string[]> {
  const op = "jmapMethodCapabilities"
  const [object] = methodName.split("/", 1)
  if (object === undefined || object === "") {
    return createResultError(op, `methodName must look like "Object/verb": ${JSON.stringify(methodName)}`)
  }
  const using = new Set<string>([jmapCapabilities.core])
  const known = new Set([
    "Email",
    "Mailbox",
    "Thread",
    "SearchSnippet",
    "PushSubscription",
    "Identity",
    "EmailSubmission",
    "VacationResponse",
    "SieveScript",
    "Principal",
    "ShareNotification",
    "Quota",
    "Calendar",
    "CalendarEvent",
    "CalendarEventNotification",
    "ParticipantIdentity",
    "AddressBook",
    "ContactCard",
    "FileNode",
    "Blob",
    "Core",
  ])
  if (!known.has(object)) {
    for (const resolve of resolvers) {
      const extra = resolve(methodName)
      if (extra !== undefined) {
        for (const capability of extra) using.add(capability)
        return createResult([...using])
      }
    }
    return createResultError(
      op,
      `Unknown standard method object ${JSON.stringify(object)} (pass a capability resolver)`,
    )
  }
  switch (object) {
    case "Email":
    case "Mailbox":
    case "Thread":
    case "SearchSnippet":
      using.add(jmapCapabilities.mail)
      break
    case "Identity":
    case "EmailSubmission":
      using.add(jmapCapabilities.submission)
      break
    case "VacationResponse":
      using.add(jmapCapabilities.vacationResponse)
      break
    case "SieveScript":
      using.add(jmapCapabilities.sieve)
      break
    case "Principal":
    case "ShareNotification":
      using.add(jmapCapabilities.principals)
      break
    case "Quota":
      using.add(jmapCapabilities.quota)
      break
    case "Calendar":
    case "CalendarEvent":
    case "CalendarEventNotification":
    case "ParticipantIdentity":
      using.add(jmapCapabilities.calendars)
      break
    case "AddressBook":
    case "ContactCard":
      using.add(jmapCapabilities.contacts)
      break
    case "FileNode":
      using.add(jmapCapabilities.fileNode)
      break
    case "Blob":
      using.add(jmapCapabilities.blob)
      break
    default:
      break
  }
  for (const resolve of resolvers) {
    const extra = resolve(methodName)
    if (extra !== undefined) {
      for (const capability of extra) using.add(capability)
    }
  }
  return createResult([...using])
}
