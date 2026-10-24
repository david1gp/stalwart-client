import type { JmapSetResponse } from "../jmap/jmapSetResponse.js"
import type { Email } from "./Email.js"
import type { EmailSubmission } from "../emailSubmissions/EmailSubmission.js"

/** `emailSend` result: the created Email and the created EmailSubmission, keyed by server ids. */
export type EmailSendResult = {
  email: JmapSetResponse<Email>
  submission: JmapSetResponse<EmailSubmission>
}
