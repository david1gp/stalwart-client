/** A single RFC 5322 mailbox (`name` + `email`; RFC 8621 §4.1.2). */
export type EmailAddress = {
  name?: string
  email: string
}
