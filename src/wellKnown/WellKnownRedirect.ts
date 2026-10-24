/** Redirect target: `{status, location}` — redirects are observed, never followed. */
export interface WellKnownRedirect {
  status: number
  location: string
}
