/**
 * End-session outcome (`GET /auth/logout`). `location` is the observed 303
 * target (the registered post-logout URI with `state` appended); without it
 * the server rendered the "signed out" page instead.
 */
export type OAuthLogoutResult = {
  ended: true
  location?: string
}
