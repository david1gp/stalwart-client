import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { jmapHttpRequest } from "../jmap/jmapHttpRequest.js"
import { contactFormSubmitOptionsSchema, type ContactFormSubmitOptions } from "./contactFormSubmitOptionsSchema.js"

/** Contact-form delivery outcome: `success` plus the server's failure detail, if any. */
export interface ContactFormSubmit {
  success: boolean
  details: string | null
}

const contactFormSubmitResponseSchema = a.object({
  data: a.object({
    success: a.boolean(),
    details: a.nullable(a.string()),
  }),
})

/**
 * `POST /form/*` — contact-form submission (`crates/http/src/request.rs:662`,
 * handled by `FormHandler::handle_contact_form`, `crates/http/src/form/mod.rs:42`).
 * Accepts urlencoded fields (multipart also works server-side) and returns
 * `{success, details}`; HTTP 400 carries the same shape for delivery failures.
 * The endpoint only exists while `x:HttpForm` is enabled, otherwise it 404s.
 * Anonymous, rate-limited.
 */
export async function contactFormSubmit(options: ContactFormSubmitOptions): PromiseResult<ContactFormSubmit> {
  const op = "contactFormSubmit"
  const parsed = a.safeParse(contactFormSubmitOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const raw = await jmapHttpRequest({
    config: parsed.output.config,
    method: "POST",
    path: `/form/${parsed.output.form}`,
    body: { kind: "form", value: parsed.output.fields },
    responseType: "json",
    auth: false,
  })
  if (!raw.success) return raw
  const typed = a.safeParse(contactFormSubmitResponseSchema, raw.data)
  if (!typed.success) {
    return createResultError(op, `Unexpected contact form response shape: ${a.summarize(typed.issues)}`)
  }
  return createResult({ success: typed.output.data.success, details: typed.output.data.details })
}
