# API inventory — `@adaptive-ds/stalwart-client` coverage checklist

Source pin: Stalwart at `~/opensource/stalwart`, HEAD `aa47d8ef`. v0.16 removed
the old REST management API; everything management now runs over JMAP
(`POST /jmap/`) under the `urn:stalwart:jmap` capability.

Conventions (see [architecture.md](./architecture.md)): planned function names
are subject-first camelCase (`Email/get` → `emailGet`). Folders are
`src/`-relative bounded contexts. "safe" means a read-only call an
implementation agent may run against the local instance
(`http://127.0.0.1:18080`); "admin-only" means it needs an admin account
(registry methods reject non-admins with `forbidden`); "live-unsafe" marks
calls that must never run against a live instance (none are listed here —
live-unsafe operations such as bulk deletes and queue pauses are called out
per row instead). Auth: HTTP Basic (`user:password` or app password) or
`Bearer` (OAuth access token or `x:ApiKey` secret); `config.token` is used only
when username+password are not both set.

Counts: §1 = 71 HTTP endpoint rows; §2 = 88 standard JMAP methods + 6
transport rows; §3 = 117 registry types + 27 views (generated). Total 309
rows, of which 308 are assigned to work packages (§4) and 1 (`GET /logo`,
enterprise static branding asset) is out of scope (§5).

## 1. HTTP routes

All arms below are match arms of `ParseHttp::parse_http_request` in
`crates/http/src/request.rs` (line numbers per arm). Endpoint access rules may
additionally 403 non-loopback callers (`has_endpoint_access`, `request.rs:89`).
`crates/http/src/api/mod.rs` handles only the `/api/*` sub-tree (plus
`diagnose.rs` delivery-diagnose internals and enterprise `telemetry.rs`).
`api/v1/openapi.yml` documents exactly the 12 `/api/*` paths (operations
`login`, `discoverOidc`, `getAccount`, `getSchemaRedirect`, `getSchema`,
`issueDeliveryToken`, `issueTracingToken`, `issueMetricsToken`,
`liveDelivery`, `liveTracing`, `liveMetrics` + `POST /api/calendar/rsvp`).

### `jmap` (`request.rs:100`) — JMAP transport

| Method + path                                    | params                                                                                    | planned fn                       | folder             | notes                                                        |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------- | -------------------------------- | ------------------ | ------------------------------------------------------------ |
| `POST /jmap/`                                    | JMAP `{using, methodCalls}` (`Content-Type: application/json` enforced, `request.rs:107`) | `jmapRequest` / `jmapMethodCall` | `src/jmap/`        | safe; admin-only for `x:*`                                   |
| `GET /jmap/download/{accountId}/{blobId}/{name}` | `?accept=` content type override (`request.rs:163`)                                       | `blobDownload`                   | `src/blobs/`       | safe                                                         |
| `POST /jmap/upload/{accountId}`                  | raw bytes body, `Content-Type` passthrough (`request.rs:179`)                             | `blobUpload`                     | `src/blobs/`       | creates blobs; e2e only on local                             |
| `GET /jmap/eventsource`                          | SSE `EventSource` (`request.rs:212`)                                                      | `eventSourceListen`              | `src/eventSource/` | safe                                                         |
| `GET /jmap/ws`                                   | WebSocket upgrade, `urn:ietf:params:jmap:websocket` (`request.rs:219`)                    | `jmapWebSocket`                  | `src/jmap/`        | safe; see §2 transport                                       |
| `GET /jmap/session`                              | auth optional: anonymous → reduced session (`request.rs:228`)                             | `jmapSessionGet`                 | `src/jmap/`        | safe; verified locally (anon 200, authed capabilities in §2) |
| `OPTIONS /jmap/*`                                | CORS preflight → 204 (`request.rs:248`)                                                   | — (transport-level)              | —                  | safe                                                         |

### `dav` (`request.rs:254`) — OUT OF SCOPE

| Method + path                                                                                                                                                        | notes                                                                                                                            |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `/dav/*` with `OPTIONS, GET, HEAD, POST, PUT, DELETE, COPY, MOVE, MKCALENDAR, MKCOL, PROPFIND, PROPPATCH, LOCK, UNLOCK, REPORT, ACL` (`DavMethod`, `request.rs:257`) | **Out of scope**: WebDAV; the same calendars, address books and files are reachable via JMAP (§2). Only the `/.well-known/caldav | carddav`redirects (§1,`request.rs:294-303`) stay in scope as dumb redirects. |

### `.well-known` (`request.rs:288`)

| Method + path                                                                                   | planned fn                 | folder           | notes                                                                                                                                                                                                                                             |
| ----------------------------------------------------------------------------------------------- | -------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /.well-known/jmap` → 307 `/jmap/session` (`request.rs:289`)                                | `wellKnownJmap`            | `src/wellKnown/` | safe; verified locally (307)                                                                                                                                                                                                                      |
| `GET /.well-known/caldav` → 307 DAV base (`request.rs:294`)                                     | `wellKnownCaldav`          | `src/wellKnown/` | redirect only (DAV itself out of scope)                                                                                                                                                                                                           |
| `GET /.well-known/carddav` → 307 DAV base (`request.rs:297`)                                    | `wellKnownCarddav`         | `src/wellKnown/` | redirect only (DAV itself out of scope)                                                                                                                                                                                                           |
| `GET /.well-known/oauth-authorization-server` (`request.rs:304`)                                | `oauthMetadata`            | `src/oauth/`     | safe; grant types `authorization_code`, `refresh_token`, `urn:ietf:params:oauth:grant-type:device_code`; `response_types: ["code"]`; auth methods `none`, `client_secret_post`, `client_secret_basic`; PKCE `S256` (`auth/oauth/auth.rs:566-578`) |
| `GET /.well-known/oauth-protected-resource` (`request.rs:311`)                                  | `oauthProtectedResource`   | `src/oauth/`     | safe                                                                                                                                                                                                                                              |
| `GET /.well-known/openid-configuration` (`request.rs:318`)                                      | `oidcMetadata`             | `src/oauth/`     | safe (`auth/oauth/openid.rs:60`)                                                                                                                                                                                                                  |
| `GET /.well-known/acme-challenge/{token}` (`request.rs:325`, only if ACME HTTP providers exist) | `wellKnownAcmeChallenge`   | `src/wellKnown/` | safe                                                                                                                                                                                                                                              |
| `GET /.well-known/mta-sts.txt` (`request.rs:338`, only if `mtaStsPolicy` set)                   | `wellKnownMtaSts`          | `src/wellKnown/` | safe                                                                                                                                                                                                                                              |
| `GET /.well-known/user-agent-configuration.json` (`request.rs:350`, per-`Host` client config)   | `wellKnownUserAgentConfig` | `src/wellKnown/` | safe                                                                                                                                                                                                                                              |
| `GET /.well-known/mail-v1.xml` (`request.rs:369`, `?email=`)                                    | `autoconfigMailV1`         | `src/wellKnown/` | safe                                                                                                                                                                                                                                              |
| `GET /.well-known/autoconfig/mail/config-v1.1.xml` (`request.rs:379`)                           | `autoconfigThunderbird`    | `src/wellKnown/` | safe                                                                                                                                                                                                                                              |
| `OPTIONS` → 204 (`request.rs:392`)                                                              | — (transport-level)        | —                | safe                                                                                                                                                                                                                                              |

### `auth` — OAuth2 / OIDC (`request.rs:397`, `crates/http/src/auth/oauth/*`)

| Method + path                                             | params / grant types                                                                                                                                                                                                                                                                                                                                                                     | planned fn                                    | folder       | notes                                                                      |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ------------ | -------------------------------------------------------------------------- |
| `POST /auth/device` (`request.rs:398`)                    | `DeviceAuthRequest{client_id}` → `{device_code, user_code, verification_uri, verification_uri_complete, expires_in, interval}` (`auth/oauth/mod.rs:92-105`); approval posts `DeviceAuthPost{code, email?, password?}`                                                                                                                                                                    | `oauthDeviceAuthorize` / `oauthDeviceApprove` | `src/oauth/` | safe; anonymous rate-limited                                               |
| `POST /auth/token` (`request.rs:404`)                     | `grant_type=authorization_code` (`code`, `client_id`, `redirect_uri`, `code_verifier` PKCE-S256, `token.rs:76`); `grant_type=urn:ietf:params:oauth:grant-type:device_code` (`device_code`, `client_id`, `token.rs:152`); `grant_type=refresh_token` (`refresh_token`, `token.rs:223`); client auth HTTP Basic or `client_id`+`client_secret` body (`client_credentials`, `token.rs:376`) | `oauthToken`                                  | `src/oauth/` | safe; scopes `openid`, `offline_access`, `urn:ietf:params:oauth:scope:mail | contacts | calendars` (`common/src/auth/oauth/mod.rs:22-34`) |
| `POST /auth/introspect` (`request.rs:410`, auth required) | token introspection                                                                                                                                                                                                                                                                                                                                                                      | `oauthIntrospect`                             | `src/oauth/` | admin/self token only                                                      |
| `GET /auth/userinfo` (`request.rs:419`, auth required)    | OIDC userinfo (`auth/oauth/openid.rs:33`)                                                                                                                                                                                                                                                                                                                                                | `oidcUserinfo`                                | `src/oauth/` | safe for self                                                              |
| `POST /auth/register` (`request.rs:428`)                  | RFC 7591 client registration (`client_name`, `redirect_uris`, `scope`, grant metadata; anonymous only if `allow_anonymous_client_registration`, `registration.rs:61-99`)                                                                                                                                                                                                                 | `oauthClientRegister`                         | `src/oauth/` | creates OAuthClient entries; e2e on local only                             |
| `GET /auth/jwks.json` (`request.rs:433`)                  | OIDC JWKS                                                                                                                                                                                                                                                                                                                                                                                | `oauthJwks`                                   | `src/oauth/` | safe                                                                       |
| `OPTIONS` → 204 (`request.rs:440`)                        | —                                                                                                                                                                                                                                                                                                                                                                                        | —                                             | —            | safe                                                                       |

Login/HTML flow behind the token endpoint: `POST /api/auth` takes
`LoginRequest::AuthCode{account_name, account_secret, mfa_token?, client_id,
redirect_uri?, nonce?, scope?, code_challenge?, code_challenge_method?,
state?, resource[]}` or `LoginRequest::AuthDevice{account_name,
account_secret, mfa_token?, code}` (`auth/oauth/auth.rs:95-131`); `GET /login`
and `GET /device` serve the static login/device pages (`request.rs:682` —
pages out of scope, API in scope).

### `scim` — enterprise only (`request.rs:449`, `crates/scim/src/request.rs`)

Gated `#[cfg(feature = "enterprise")]`; anonymous allowed only if SCIM auth is
disabled, else Bearer. All under `/scim/v2`. Planned folder `src/scim/` for
every row. On the community build these fail before dispatch — client code
must surface, not retry (cf. `docs/local-instance.md` enterprise notes).

| Method + path                                                                     | planned fn                  | notes                                            |
| --------------------------------------------------------------------------------- | --------------------------- | ------------------------------------------------ |
| `GET /scim/v2/Users` (query → `SearchRequest` filter/sort/page, `request.rs:103`) | `scimUserQuery`             | list users                                       |
| `POST /scim/v2/Users` (`request.rs:107`, `users/set.rs`)                          | `scimUserCreate`            | e2e on local only                                |
| `POST /scim/v2/Users/.search` (`request.rs:116`)                                  | `scimUserSearch`            | query via POST body                              |
| `GET /scim/v2/Users/{id}` (`users/get.rs`)                                        | `scimUserGet`               | safe                                             |
| `PUT /scim/v2/Users/{id}` (replace, `request.rs:141`)                             | `scimUserReplace`           | e2e on local only                                |
| `PATCH /scim/v2/Users/{id}` (`users/patch.rs`)                                    | `scimUserPatch`             | e2e on local only                                |
| `DELETE /scim/v2/Users/{id}` (`users/set.rs` destroy)                             | `scimUserDelete`            | never on live; local e2e only with throwaway ids |
| `GET /scim/v2/Groups`                                                             | `scimGroupQuery`            | list groups                                      |
| `POST /scim/v2/Groups` (`groups/set.rs`)                                          | `scimGroupCreate`           | e2e on local only                                |
| `POST /scim/v2/Groups/.search`                                                    | `scimGroupSearch`           | query via POST body                              |
| `GET /scim/v2/Groups/{id}` (`groups/get.rs`)                                      | `scimGroupGet`              | safe                                             |
| `PUT /scim/v2/Groups/{id}` (replace)                                              | `scimGroupReplace`          | e2e on local only                                |
| `PATCH /scim/v2/Groups/{id}` (`groups/patch.rs`)                                  | `scimGroupPatch`            | e2e on local only                                |
| `DELETE /scim/v2/Groups/{id}`                                                     | `scimGroupDelete`           | never on live; local e2e only with throwaway ids |
| `POST /scim/v2/Bulk` (`request.rs:171`, `bulk.rs`, server `max_payload_size`)     | `scimBulk`                  | e2e on local only                                |
| `POST /scim/v2/.search` (`request.rs:187`, cross-resource search)                 | `scimSearchAll`             | safe                                             |
| `GET /scim/v2/ServiceProviderConfig` (`request.rs:199`, unfiltered only)          | `scimServiceProviderConfig` | safe                                             |
| `GET /scim/v2/ResourceTypes[/{type}]` (`request.rs:208`)                          | `scimResourceTypes`         | safe                                             |
| `GET /scim/v2/Schemas[/{uri}]` (`request.rs:215`)                                 | `scimSchemas`               | safe                                             |
| `/scim/v2/Me` → 501 not implemented (`request.rs:226`)                            | — (no helper; pin the 501)  | documents absence                                |

### `api` — management + live (`request.rs:471`, `crates/http/src/api/mod.rs`)

Planned folders `src/management/` (account/schema/discover/auth) and
`src/live/` (token/live SSE).

| Method + path                                                                               | planned fn                 | folder            | notes                                                                                    |
| ------------------------------------------------------------------------------------------- | -------------------------- | ----------------- | ---------------------------------------------------------------------------------------- |
| `POST /api/auth` (`api/mod.rs:72`)                                                          | `managementLogin`          | `src/management/` | LoginRequest (see `auth` §); issues auth code, not a session                             |
| `POST /api/calendar/rsvp` (`api/mod.rs:81`, `RsvpRequest` JSON, needs `itip_http_rsvp_url`) | `managementCalendarRsvp`   | `src/management/` | safe                                                                                     |
| `GET /api/discover/{email}` (`api/mod.rs:100`)                                              | `managementDiscover`       | `src/management/` | safe; `discoverOidc` in openapi                                                          |
| `GET /api/account` (`api/mod.rs:110`)                                                       | `managementAccount`        | `src/management/` | safe for self; returns permissions/edition/locale (verified in `docs/local-instance.md`) |
| `GET /api/schema` → 302 `/api/schema/{sha256}` (`api/mod.rs:115`)                           | `managementSchemaRedirect` | `src/management/` | auth; verified locally                                                                   |
| `GET /api/schema/{hash}` → gzipped schema JSON (`api/mod.rs:123`)                           | `managementSchema`         | `src/management/` | auth; 150 objects (see §3 cross-check)                                                   |
| `GET /api/token/delivery` (`api/mod.rs:180`, needs `LiveDeliveryTest`)                      | `liveDeliveryToken`        | `src/live/`       | 60 s token for `?token=` SSE auth                                                        |
| `GET /api/token/tracing` (`api/mod.rs:140`, enterprise)                                     | `liveTracingToken`         | `src/live/`       | enterprise-only; pin "Enterprise feature" on community                                   |
| `GET /api/token/metrics` (`api/mod.rs:160`, enterprise)                                     | `liveMetricsToken`         | `src/live/`       | enterprise-only; pin "Enterprise feature" on community                                   |
| `GET /api/live/delivery/{target}` (`api/mod.rs:216`, SSE, `?timeout=`, `?token=`)           | `liveDelivery`             | `src/live/`       | needs `LiveDeliveryTest`; safe (read-only diagnostics)                                   |
| `GET /api/live/tracing` (`api/mod.rs:249`, enterprise SSE)                                  | `liveTracing`              | `src/live/`       | enterprise-only                                                                          |
| `GET /api/live/metrics` (`api/mod.rs:256`, enterprise SSE)                                  | `liveMetrics`              | `src/live/`       | enterprise-only                                                                          |

### `mail`, `calendar`, `autodiscover`, misc

| Method + path                                                                                               | planned fn                                            | folder            | notes                                                              |
| ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ----------------- | ------------------------------------------------------------------ |
| `GET /mail/config-v1.1.xml` (`request.rs:486`)                                                              | `autoconfigMailConfig`                                | `src/wellKnown/`  | safe                                                               |
| `GET /calendar/rsvp` (`request.rs:500`, RSVP HTML page; enterprise template override `request.rs:509`)      | `calendarRsvpPage`                                    | `src/wellKnown/`  | safe (static page; the JSON RSVP API is `POST /api/calendar/rsvp`) |
| `POST /autodiscover/autodiscover.xml` (`request.rs:533`; `Autodiscover`/`AutoDiscover` spellings match too) | `autodiscoverXml`                                     | `src/wellKnown/`  | safe                                                               |
| `GET /autodiscover/autodiscover.json` (`request.rs:548`, `?email=` or path email)                           | `autodiscoverJson`                                    | `src/wellKnown/`  | safe                                                               |
| `GET /robots.txt` (`request.rs:568`)                                                                        | `robotsTxt`                                           | `src/wellKnown/`  | safe                                                               |
| `GET /healthz/live` (`request.rs:584`)                                                                      | `healthLive`                                          | `src/health/`     | safe; verified locally (no auth)                                   |
| `GET /healthz/ready` (`request.rs:587`, 503 while storage uninitialized)                                    | `healthReady`                                         | `src/health/`     | safe; verified locally                                             |
| `GET /metrics/prometheus` (`request.rs:600`, HTTP Basic metrics user, NOT JMAP auth)                        | `metricsPrometheus`                                   | `src/metrics/`    | admin-only; separate credential                                    |
| `POST /form/*` (`request.rs:662`, contact form if configured)                                               | `contactFormSubmit` (`FormData`, `auth/oauth/mod.rs`) | `src/management/` | anonymous rate-limited; e2e on local only                          |
| `GET /login`, `GET /device` (`request.rs:682`, static HTML pages)                                           | — (no helper; static assets)                          | —                 | out of scope as pages; covered via `POST /api/auth`                |
| `GET /logo?domain=` (`request.rs:630`, enterprise)                                                          | — (no helper; static branding asset)                  | —                 | out of scope (see §5)                                              |
| `otel` (`request.rs:621`)                                                                                   | — (reserved, no-op arm)                               | —                 | no surface to cover                                                |

`/{app}` (`request.rs:688`): WebUI application bundles (`/admin`, `/account`
→ 302 observed locally) served from `applications/` — static assets, out of
scope (§5).

## 2. JMAP standard methods

Every name below is a `MethodName::as_str` arm in
`crates/jmap-proto/src/request/method.rs:106-241`, grouped by object.
Capability URN per object is `MethodObject::capability`
(`method.rs:34-67`); URN strings are the `Capability` enum in
`crates/jmap-proto/src/request/capability.rs:70-112`. `using` always includes
`urn:ietf:params:jmap:core` plus the object capability (see
[architecture.md](./architecture.md) §2). `accountId` resolution:
explicit arg → `config.accountId` → `session.primaryAccounts[capability]`;
Stalwart auto-fills Core/PushSubscription/registry with the caller account.

WebSocket (`urn:ietf:params:jmap:websocket`), push (`webpush-vapid`,
`emailpush`) and parse capabilities (`calendars:parse`, `contacts:parse`) are
advertised on the local session (verified 2026-10-24: `mail blob calendars
calendars:parse contacts contacts:parse core emailpush filenode principals
principals:availability quota sieve submission vacationresponse webpush-vapid
websocket`; `urn:stalwart:jmap` appears only in `primaryAccounts`, not in
`capabilities`).

Stalwart-specific notes (from `crates/jmap-proto/src/object/*.rs` and
`src/method/*.rs`): `Blob/lookup` + `Blob/upload` are JMAP-blob methods beyond
RFC 8620 core; `Core/echo` is the generic echo; `SieveScript/validate`,
`Email/parse`, `ContactCard/parse`, `CalendarEvent/parse` need their `:parse`
/ sieve capabilities; registry filters are property-equal or
`<prop>Is{GreaterThan,GreaterThanOrEqual,LessThan,LessThanOrEqual}`
(`object/registry.rs:19-38`) with AND-only filters (`registry/query.rs`
`extract_filters`); only the `id` sort direction default differs in test mode.

### Mail

| Method                 | planned fn            | folder                | capability URN              | notes                                                                    |
| ---------------------- | --------------------- | --------------------- | --------------------------- | ------------------------------------------------------------------------ |
| `Mailbox/get`          | `mailboxGet`          | `src/mailboxes/`      | `urn:ietf:params:jmap:mail` |                                                                          |
| `Mailbox/changes`      | `mailboxChanges`      | `src/mailboxes/`      | `urn:ietf:params:jmap:mail` |                                                                          |
| `Mailbox/query`        | `mailboxQuery`        | `src/mailboxes/`      | `urn:ietf:params:jmap:mail` |                                                                          |
| `Mailbox/queryChanges` | `mailboxQueryChanges` | `src/mailboxes/`      | `urn:ietf:params:jmap:mail` |                                                                          |
| `Mailbox/set`          | `mailboxSet`          | `src/mailboxes/`      | `urn:ietf:params:jmap:mail` | partial success → `jmapSetErrorCheck`                                    |
| `Thread/get`           | `threadGet`           | `src/threads/`        | `urn:ietf:params:jmap:mail` |                                                                          |
| `Thread/changes`       | `threadChanges`       | `src/threads/`        | `urn:ietf:params:jmap:mail` |                                                                          |
| `Email/get`            | `emailGet`            | `src/emails/`         | `urn:ietf:params:jmap:mail` | ⚠ `emailGet`/`emailSet` collide with registry `x:Email` helpers — see §3 |
| `Email/changes`        | `emailChanges`        | `src/emails/`         | `urn:ietf:params:jmap:mail` |                                                                          |
| `Email/query`          | `emailQuery`          | `src/emails/`         | `urn:ietf:params:jmap:mail` |                                                                          |
| `Email/queryChanges`   | `emailQueryChanges`   | `src/emails/`         | `urn:ietf:params:jmap:mail` |                                                                          |
| `Email/set`            | `emailSet`            | `src/emails/`         | `urn:ietf:params:jmap:mail` |                                                                          |
| `Email/copy`           | `emailCopy`           | `src/emails/`         | `urn:ietf:params:jmap:mail` |                                                                          |
| `Email/import`         | `emailImport`         | `src/emails/`         | `urn:ietf:params:jmap:mail` |                                                                          |
| `Email/parse`          | `emailParse`          | `src/emails/`         | `urn:ietf:params:jmap:mail` | parse from blob                                                          |
| `SearchSnippet/get`    | `searchSnippetGet`    | `src/searchSnippets/` | `urn:ietf:params:jmap:mail` |                                                                          |

### Submission / vacation

| Method                         | planned fn                    | folder                   | capability URN                          | notes                                                    |
| ------------------------------ | ----------------------------- | ------------------------ | --------------------------------------- | -------------------------------------------------------- |
| `Identity/get`                 | `identityGet`                 | `src/identities/`        | `urn:ietf:params:jmap:submission`       | always `Identity/get` before send (ids unstable)         |
| `Identity/changes`             | `identityChanges`             | `src/identities/`        | `urn:ietf:params:jmap:submission`       |                                                          |
| `Identity/set`                 | `identitySet`                 | `src/identities/`        | `urn:ietf:params:jmap:submission`       |                                                          |
| `EmailSubmission/get`          | `emailSubmissionGet`          | `src/emailSubmissions/`  | `urn:ietf:params:jmap:submission`       |                                                          |
| `EmailSubmission/changes`      | `emailSubmissionChanges`      | `src/emailSubmissions/`  | `urn:ietf:params:jmap:submission`       |                                                          |
| `EmailSubmission/query`        | `emailSubmissionQuery`        | `src/emailSubmissions/`  | `urn:ietf:params:jmap:submission`       |                                                          |
| `EmailSubmission/queryChanges` | `emailSubmissionQueryChanges` | `src/emailSubmissions/`  | `urn:ietf:params:jmap:submission`       |                                                          |
| `EmailSubmission/set`          | `emailSubmissionSet`          | `src/emailSubmissions/`  | `urn:ietf:params:jmap:submission`       | send path (verified alice→bob, `docs/local-instance.md`) |
| `VacationResponse/get`         | `vacationResponseGet`         | `src/vacationResponses/` | `urn:ietf:params:jmap:vacationresponse` |                                                          |
| `VacationResponse/set`         | `vacationResponseSet`         | `src/vacationResponses/` | `urn:ietf:params:jmap:vacationresponse` |                                                          |

### Sieve / blob / quota / push / core

| Method                 | planned fn            | folder                   | capability URN               | notes                                 |
| ---------------------- | --------------------- | ------------------------ | ---------------------------- | ------------------------------------- |
| `SieveScript/get`      | `sieveScriptGet`      | `src/sieveScripts/`      | `urn:ietf:params:jmap:sieve` |                                       |
| `SieveScript/set`      | `sieveScriptSet`      | `src/sieveScripts/`      | `urn:ietf:params:jmap:sieve` |                                       |
| `SieveScript/query`    | `sieveScriptQuery`    | `src/sieveScripts/`      | `urn:ietf:params:jmap:sieve` |                                       |
| `SieveScript/validate` | `sieveScriptValidate` | `src/sieveScripts/`      | `urn:ietf:params:jmap:sieve` | validate-only, no state change        |
| `Blob/get`             | `blobGet`             | `src/blobs/`             | `urn:ietf:params:jmap:blob`  | JMAP-blob extension method            |
| `Blob/copy`            | `blobCopy`            | `src/blobs/`             | `urn:ietf:params:jmap:blob`  |                                       |
| `Blob/lookup`          | `blobLookup`          | `src/blobs/`             | `urn:ietf:params:jmap:blob`  | Stalwart/JMAP-blob extension          |
| `Blob/upload`          | `blobUpload`          | `src/blobs/`             | `urn:ietf:params:jmap:blob`  | method-form upload (HTTP form is §1)  |
| `Quota/get`            | `quotaGet`            | `src/quotas/`            | `urn:ietf:params:jmap:quota` |                                       |
| `Quota/changes`        | `quotaChanges`        | `src/quotas/`            | `urn:ietf:params:jmap:quota` |                                       |
| `Quota/query`          | `quotaQuery`          | `src/quotas/`            | `urn:ietf:params:jmap:quota` |                                       |
| `Quota/queryChanges`   | `quotaQueryChanges`   | `src/quotas/`            | `urn:ietf:params:jmap:quota` |                                       |
| `PushSubscription/get` | `pushSubscriptionGet` | `src/pushSubscriptions/` | `urn:ietf:params:jmap:core`  | capability is core per `method.rs:53` |
| `PushSubscription/set` | `pushSubscriptionSet` | `src/pushSubscriptions/` | `urn:ietf:params:jmap:core`  | webpush-vapid / emailpush types       |
| `Core/echo`            | `coreEcho`            | `src/jmap/`              | `urn:ietf:params:jmap:core`  | reference op (already implemented)    |

### Principals

| Method                      | planned fn                 | folder            | capability URN                                 | notes                                     |
| --------------------------- | -------------------------- | ----------------- | ---------------------------------------------- | ----------------------------------------- |
| `Principal/get`             | `principalGet`             | `src/principals/` | `urn:ietf:params:jmap:principals`              |                                           |
| `Principal/set`             | `principalSet`             | `src/principals/` | `urn:ietf:params:jmap:principals`              |                                           |
| `Principal/query`           | `principalQuery`           | `src/principals/` | `urn:ietf:params:jmap:principals`              |                                           |
| `Principal/changes`         | `principalChanges`         | `src/principals/` | `urn:ietf:params:jmap:principals`              |                                           |
| `Principal/queryChanges`    | `principalQueryChanges`    | `src/principals/` | `urn:ietf:params:jmap:principals`              |                                           |
| `Principal/getAvailability` | `principalGetAvailability` | `src/principals/` | `urn:ietf:params:jmap:principals:availability` | only method using the `:availability` URN |

### Calendars

| Method                                   | planned fn                              | folder                            | capability URN                         | notes                                                 |
| ---------------------------------------- | --------------------------------------- | --------------------------------- | -------------------------------------- | ----------------------------------------------------- |
| `Calendar/get`                           | `calendarGet`                           | `src/calendars/`                  | `urn:ietf:params:jmap:calendars`       | ⚠ collides with registry `x:Calendar` helper — see §3 |
| `Calendar/changes`                       | `calendarChanges`                       | `src/calendars/`                  | `urn:ietf:params:jmap:calendars`       |                                                       |
| `Calendar/set`                           | `calendarSet`                           | `src/calendars/`                  | `urn:ietf:params:jmap:calendars`       |                                                       |
| `Calendar/query`                         | `calendarQuery`                         | `src/calendars/`                  | `urn:ietf:params:jmap:calendars`       |                                                       |
| `CalendarEvent/get`                      | `calendarEventGet`                      | `src/calendarEvents/`             | `urn:ietf:params:jmap:calendars`       |                                                       |
| `CalendarEvent/changes`                  | `calendarEventChanges`                  | `src/calendarEvents/`             | `urn:ietf:params:jmap:calendars`       |                                                       |
| `CalendarEvent/query`                    | `calendarEventQuery`                    | `src/calendarEvents/`             | `urn:ietf:params:jmap:calendars`       |                                                       |
| `CalendarEvent/queryChanges`             | `calendarEventQueryChanges`             | `src/calendarEvents/`             | `urn:ietf:params:jmap:calendars`       |                                                       |
| `CalendarEvent/set`                      | `calendarEventSet`                      | `src/calendarEvents/`             | `urn:ietf:params:jmap:calendars`       |                                                       |
| `CalendarEvent/copy`                     | `calendarEventCopy`                     | `src/calendarEvents/`             | `urn:ietf:params:jmap:calendars`       |                                                       |
| `CalendarEvent/parse`                    | `calendarEventParse`                    | `src/calendarEvents/`             | `urn:ietf:params:jmap:calendars:parse` | needs `:parse` capability                             |
| `CalendarEventNotification/get`          | `calendarEventNotificationGet`          | `src/calendarEventNotifications/` | `urn:ietf:params:jmap:calendars`       |                                                       |
| `CalendarEventNotification/changes`      | `calendarEventNotificationChanges`      | `src/calendarEventNotifications/` | `urn:ietf:params:jmap:calendars`       |                                                       |
| `CalendarEventNotification/set`          | `calendarEventNotificationSet`          | `src/calendarEventNotifications/` | `urn:ietf:params:jmap:calendars`       |                                                       |
| `CalendarEventNotification/query`        | `calendarEventNotificationQuery`        | `src/calendarEventNotifications/` | `urn:ietf:params:jmap:calendars`       |                                                       |
| `CalendarEventNotification/queryChanges` | `calendarEventNotificationQueryChanges` | `src/calendarEventNotifications/` | `urn:ietf:params:jmap:calendars`       |                                                       |
| `ParticipantIdentity/get`                | `participantIdentityGet`                | `src/participantIdentities/`      | `urn:ietf:params:jmap:calendars`       |                                                       |
| `ParticipantIdentity/changes`            | `participantIdentityChanges`            | `src/participantIdentities/`      | `urn:ietf:params:jmap:calendars`       |                                                       |
| `ParticipantIdentity/set`                | `participantIdentitySet`                | `src/participantIdentities/`      | `urn:ietf:params:jmap:calendars`       |                                                       |

### Contacts / files / shares

| Method                           | planned fn                      | folder                    | capability URN                        | notes                                                    |
| -------------------------------- | ------------------------------- | ------------------------- | ------------------------------------- | -------------------------------------------------------- |
| `AddressBook/get`                | `addressBookGet`                | `src/addressBooks/`       | `urn:ietf:params:jmap:contacts`       | ⚠ collides with registry `x:AddressBook` helper — see §3 |
| `AddressBook/changes`            | `addressBookChanges`            | `src/addressBooks/`       | `urn:ietf:params:jmap:contacts`       |                                                          |
| `AddressBook/set`                | `addressBookSet`                | `src/addressBooks/`       | `urn:ietf:params:jmap:contacts`       |                                                          |
| `AddressBook/query`              | `addressBookQuery`              | `src/addressBooks/`       | `urn:ietf:params:jmap:contacts`       |                                                          |
| `ContactCard/get`                | `contactCardGet`                | `src/contactCards/`       | `urn:ietf:params:jmap:contacts`       |                                                          |
| `ContactCard/changes`            | `contactCardChanges`            | `src/contactCards/`       | `urn:ietf:params:jmap:contacts`       |                                                          |
| `ContactCard/query`              | `contactCardQuery`              | `src/contactCards/`       | `urn:ietf:params:jmap:contacts`       |                                                          |
| `ContactCard/queryChanges`       | `contactCardQueryChanges`       | `src/contactCards/`       | `urn:ietf:params:jmap:contacts`       |                                                          |
| `ContactCard/set`                | `contactCardSet`                | `src/contactCards/`       | `urn:ietf:params:jmap:contacts`       |                                                          |
| `ContactCard/copy`               | `contactCardCopy`               | `src/contactCards/`       | `urn:ietf:params:jmap:contacts`       |                                                          |
| `ContactCard/parse`              | `contactCardParse`              | `src/contactCards/`       | `urn:ietf:params:jmap:contacts:parse` | needs `:parse` capability                                |
| `FileNode/get`                   | `fileNodeGet`                   | `src/fileNodes/`          | `urn:ietf:params:jmap:filenode`       |                                                          |
| `FileNode/changes`               | `fileNodeChanges`               | `src/fileNodes/`          | `urn:ietf:params:jmap:filenode`       |                                                          |
| `FileNode/query`                 | `fileNodeQuery`                 | `src/fileNodes/`          | `urn:ietf:params:jmap:filenode`       |                                                          |
| `FileNode/queryChanges`          | `fileNodeQueryChanges`          | `src/fileNodes/`          | `urn:ietf:params:jmap:filenode`       |                                                          |
| `FileNode/set`                   | `fileNodeSet`                   | `src/fileNodes/`          | `urn:ietf:params:jmap:filenode`       |                                                          |
| `FileNode/copy`                  | `fileNodeCopy`                  | `src/fileNodes/`          | `urn:ietf:params:jmap:filenode`       |                                                          |
| `ShareNotification/get`          | `shareNotificationGet`          | `src/shareNotifications/` | `urn:ietf:params:jmap:principals`     | capability is principals per `method.rs:58`              |
| `ShareNotification/changes`      | `shareNotificationChanges`      | `src/shareNotifications/` | `urn:ietf:params:jmap:principals`     |                                                          |
| `ShareNotification/set`          | `shareNotificationSet`          | `src/shareNotifications/` | `urn:ietf:params:jmap:principals`     |                                                          |
| `ShareNotification/query`        | `shareNotificationQuery`        | `src/shareNotifications/` | `urn:ietf:params:jmap:principals`     |                                                          |
| `ShareNotification/queryChanges` | `shareNotificationQueryChanges` | `src/shareNotifications/` | `urn:ietf:params:jmap:principals`     |                                                          |

### JMAP transport features

| Feature                                          | planned fn          | folder             | notes                                                                                                                       |
| ------------------------------------------------ | ------------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `GET /jmap/session` (RFC 8620 §2)                | `jmapSessionGet`    | `src/jmap/`        | cached per `JmapSessionCache`; verified locally                                                                             |
| `GET /.well-known/jmap` → 307                    | `wellKnownJmap`     | `src/wellKnown/`   | verified locally (307 to `/jmap/session`)                                                                                   |
| `POST /jmap/upload/{accountId}`                  | `blobUpload`        | `src/blobs/`       | raw POST → `{accountId, blobId, type, size}`; `uploadMaxSize` / `UnlimitedUploads` permission                               |
| `GET /jmap/download/{accountId}/{blobId}/{name}` | `blobDownload`      | `src/blobs/`       | `?accept=` override; session `downloadUrl` template points at `defaultHostname`, not loopback — derive base URL from config |
| `GET /jmap/eventsource` SSE                      | `eventSourceListen` | `src/eventSource/` | `EventSourceHandler` (`crates/jmap/src/api/event_source.rs`); `typesChanged` includes `urn:stalwart:jmap`                   |
| `GET /jmap/ws` WebSocket                         | `jmapWebSocket`     | `src/jmap/`        | `WebSocketUpgrade` (`crates/jmap/src/websocket/upgrade.rs`); `urn:ietf:params:jmap:websocket`                               |

## 3. Registry (management) objects — `urn:stalwart:jmap`

Regenerate with `bun scripts/registryInventoryGenerate.ts` and paste below.
Bootstrap mode: when the store is uninitialized, `x:Bootstrap/get|set` are the
ONLY accessible methods (`registry/query.rs:56-60`, `set.rs:103`, `get.rs:55`).
Recovery mode additionally clears a few credential methods for the recovery
admin (`http/src/auth/permissions.rs:60-122`; see `docs/local-instance.md`).

⚠ Barrel-name collisions: the generator's mechanical names `emailGet`,
`emailSet`, `calendarGet`, `calendarSet`, `addressBookGet`, `addressBookSet`
for the singletons `x:Email`, `x:Calendar`, `x:AddressBook` collide with the
§2 JMAP ops of the same names in `src/emails/`, `src/calendars/`,
`src/addressBooks/`. Implementation agents must disambiguate the registry
side (suggested `sysEmailGet`, `sysCalendarGet`, `sysAddressBookGet`, …) —
the audit must check `src/index.ts` has no duplicate export.

<!-- GENERATED by scripts/registryInventoryGenerate.ts from ~/opensource/stalwart/resources/schema/schema.json.gz — do not edit by hand. -->

All methods run over `POST /jmap/` with `"using": ["urn:ietf:params:jmap:core", "urn:stalwart:jmap"]`.
Singletons have no `/query` (see the bottom of `MethodName::parse`, `crates/jmap-proto/src/request/method.rs`).
Thin typed helpers (`domainGet`/`domainSet`/`domainQuery`, …) are all built on generic
`registryGet` / `registrySet` / `registryQuery({objectType})`. Folder for every row: `src/registry/`.

Counts: 117 registry types + 27 views + 6 standard objects = 150 schema objects.

### directory — accounts, roles, tenants, credentials

| ObjectType | kind | methods | permissionPrefix | description | helpers | notes |
| --- | --- | --- | --- | --- | --- | --- |
| Account | object | `x:T/get`, `x:T/set`, `x:T/query` | sysAccount | Defines a user or group account for authentication and email access. | `accountGet` / `accountSet` / `accountQuery` | @type: User, Group |
| x:Account/Group | view | — (via parent `x:Account`) | — |  | — | parent `x:Account` |
| x:Account/User | view | — (via parent `x:Account`) | — |  | — | parent `x:Account` |
| AccountPassword | singleton | `x:T/get`, `x:T/set` (`ids: ["singleton"]`, no `/query`) | sysAccountPassword | Password-based authentication credential. | `accountPasswordGet` / `accountPasswordSet` | set: set.rs:762 account_set |
| AccountSettings | singleton | `x:T/get`, `x:T/set` (`ids: ["singleton"]`, no `/query`) | sysAccountSettings | Configures default account settings for locale and encryption. | `accountSettingsGet` / `accountSettingsSet` | set: set.rs:762 account_set |
| Role | object | `x:T/get`, `x:T/set`, `x:T/query` | sysRole | Defines a named set of permissions that can be assigned to accounts, groups, or tenants. | `roleGet` / `roleSet` / `roleQuery` |  |
| Tenant | object | `x:T/get`, `x:T/set`, `x:T/query` | sysTenant | Defines a tenant for multi-tenant environments with isolated resources and quotas. | `tenantGet` / `tenantSet` / `tenantQuery` | schema:enterprise |
| MailingList | object | `x:T/get`, `x:T/set`, `x:T/query` | sysMailingList | Defines a mailing list that distributes messages to a group of recipients. | `mailingListGet` / `mailingListSet` / `mailingListQuery` |  |
| OAuthClient | object | `x:T/get`, `x:T/set`, `x:T/query` | sysOAuthClient | Defines a registered OAuth client application. | `oauthClientGet` / `oauthClientSet` / `oauthClientQuery` |  |
| ApiKey | object | `x:T/get`, `x:T/set`, `x:T/query` | sysApiKey | API key credential for programmatic access. | `apiKeyGet` / `apiKeySet` / `apiKeyQuery` | query: query.rs:140 credential_query; set: set.rs:762 account_set |
| AppPassword | object | `x:T/get`, `x:T/set`, `x:T/query` | sysAppPassword | App password credential for programmatic access. | `appPasswordGet` / `appPasswordSet` / `appPasswordQuery` | query: query.rs:140 credential_query; set: set.rs:762 account_set |
| MaskedEmail | object | `x:T/get`, `x:T/set`, `x:T/query` | sysMaskedEmail | Defines a masked email address for privacy protection. | `maskedEmailGet` / `maskedEmailSet` / `maskedEmailQuery` | schema:enterprise; RUNTIME enterprise-gated (mod.rs:20) |
| PublicKey | object | `x:T/get`, `x:T/set`, `x:T/query` | sysPublicKey | Defines a public key for email encryption (OpenPGP or S/MIME). | `publicKeyGet` / `publicKeySet` / `publicKeyQuery` |  |
| Directory | object | `x:T/get`, `x:T/set`, `x:T/query` | sysDirectory | Defines an external directory for account authentication and lookups. | `directoryGet` / `directorySet` / `directoryQuery` | @type: Ldap, Sql, Oidc |
| Authentication | singleton | `x:T/get`, `x:T/set` (`ids: ["singleton"]`, no `/query`) | sysAuthentication | Configures authentication settings including password policies and default roles. | `authenticationGet` / `authenticationSet` |  |
| OidcProvider | singleton | `x:T/get`, `x:T/set` (`ids: ["singleton"]`, no `/query`) | sysOidcProvider | Configures the OAuth and OpenID Connect provider settings. | `oidcProviderGet` / `oidcProviderSet` |  |

### domains — domains, DNS, DKIM, certificates

| ObjectType | kind | methods | permissionPrefix | description | helpers | notes |
| --- | --- | --- | --- | --- | --- | --- |
| Domain | object | `x:T/get`, `x:T/set`, `x:T/query` | sysDomain | Defines an email domain and its DNS, DKIM, and TLS certificate settings. | `domainGet` / `domainSet` / `domainQuery` |  |
| x:Domain/DomainZone | view | — (via parent `x:Domain`) | — |  | — | parent `x:Domain` |
| DkimSignature | object | `x:T/get`, `x:T/set`, `x:T/query` | sysDkimSignature | Defines a DKIM signature used to sign outgoing email messages. | `dkimSignatureGet` / `dkimSignatureSet` / `dkimSignatureQuery` | @type: Dkim1Ed25519Sha256, Dkim1RsaSha256, Dkim2Ed25519Sha256, Dkim2RsaSha256 |
| Certificate | object | `x:T/get`, `x:T/set`, `x:T/query` | sysCertificate | Defines a TLS certificate and its associated private key. | `certificateGet` / `certificateSet` / `certificateQuery` |  |
| AcmeProvider | object | `x:T/get`, `x:T/set`, `x:T/query` | sysAcmeProvider | Defines an ACME provider for automatic TLS certificate management. | `acmeProviderGet` / `acmeProviderSet` / `acmeProviderQuery` |  |
| DnsServer | object | `x:T/get`, `x:T/set`, `x:T/query` | sysDnsServer | Defines a DNS server for automatic record management. | `dnsServerGet` / `dnsServerSet` / `dnsServerQuery` | @type: Tsig, Deprecated1, Cloudflare, DigitalOcean, DeSEC, Ovh, Bunny, Porkbun, Dnsimple, Spaceship, Route53, GoogleCloudDns, Alidns, ArvanCloud, Autodns, AzureDns, BaiduCloud, BluecatV2, ClouDns, Constellix, Cpanel, Ddnss, DnsMadeEasy, Domeneshop, Dreamhost, DuckDns, Dynu, EasyDns, EdgeDns, Exoscale, FreeMyIp, GandiV5, Gcore, Glesys, Godaddy, Hetzner, HostingDe, Hostinger, HuaweiCloud, Hurricane, IbmCloud, Infoblox, Infomaniak, Inwx, Ionos, Ipv64, Joker, Lightsail, Linode, LuaDns, MythicBeasts, Namecheap, NameDotCom, NameSilo, Netcup, Netlify, Nifcloud, Ns1, OracleCloud, Plesk, Safedns, Scaleway, TencentCloud, Transip, UltraDns, Vercel, Volcengine, Vultr, WebSupport, YandexCloud, PowerDns |
| DnsResolver | singleton | `x:T/get`, `x:T/set` (`ids: ["singleton"]`, no `/query`) | sysDnsResolver | Configures the DNS resolver used for domain lookups. | `dnsResolverGet` / `dnsResolverSet` | @type: System, Custom, Cloudflare, Quad9, Google |

### mta — SMTP stages, routing, throttles, queue

| ObjectType | kind | methods | permissionPrefix | description | helpers | notes |
| --- | --- | --- | --- | --- | --- | --- |
| MtaConnectionStrategy | object | `x:T/get`, `x:T/set`, `x:T/query` | sysMtaConnectionStrategy | Defines a connection strategy for outbound message delivery. | `mtaConnectionStrategyGet` / `mtaConnectionStrategySet` / `mtaConnectionStrategyQuery` |  |
| MtaDeliverySchedule | object | `x:T/get`, `x:T/set`, `x:T/query` | sysMtaDeliverySchedule | Defines retry and notification intervals for message delivery. | `mtaDeliveryScheduleGet` / `mtaDeliveryScheduleSet` / `mtaDeliveryScheduleQuery` |  |
| MtaExtensions | singleton | `x:T/get`, `x:T/set` (`ids: ["singleton"]`, no `/query`) | sysMtaExtensions | Configures SMTP protocol extensions offered to clients. | `mtaExtensionsGet` / `mtaExtensionsSet` |  |
| MtaHook | object | `x:T/get`, `x:T/set`, `x:T/query` | sysMtaHook | Defines an MTA hook endpoint for message processing. | `mtaHookGet` / `mtaHookSet` / `mtaHookQuery` |  |
| MtaInboundSession | singleton | `x:T/get`, `x:T/set` (`ids: ["singleton"]`, no `/query`) | sysMtaInboundSession | Configures inbound SMTP session timeouts and transfer limits. | `mtaInboundSessionGet` / `mtaInboundSessionSet` |  |
| MtaInboundThrottle | object | `x:T/get`, `x:T/set`, `x:T/query` | sysMtaInboundThrottle | Defines an inbound rate limit rule for SMTP connections. | `mtaInboundThrottleGet` / `mtaInboundThrottleSet` / `mtaInboundThrottleQuery` |  |
| MtaMilter | object | `x:T/get`, `x:T/set`, `x:T/query` | sysMtaMilter | Defines a Milter filter endpoint for message processing. | `mtaMilterGet` / `mtaMilterSet` / `mtaMilterQuery` |  |
| MtaOutboundStrategy | singleton | `x:T/get`, `x:T/set` (`ids: ["singleton"]`, no `/query`) | sysMtaOutboundStrategy | Configures outbound message delivery routing, scheduling, and TLS strategies. | `mtaOutboundStrategyGet` / `mtaOutboundStrategySet` |  |
| MtaOutboundThrottle | object | `x:T/get`, `x:T/set`, `x:T/query` | sysMtaOutboundThrottle | Defines an outbound rate limit rule for message delivery. | `mtaOutboundThrottleGet` / `mtaOutboundThrottleSet` / `mtaOutboundThrottleQuery` |  |
| MtaQueueQuota | object | `x:T/get`, `x:T/set`, `x:T/query` | sysMtaQueueQuota | Defines a quota rule for message queues. | `mtaQueueQuotaGet` / `mtaQueueQuotaSet` / `mtaQueueQuotaQuery` |  |
| MtaRoute | object | `x:T/get`, `x:T/set`, `x:T/query` | sysMtaRoute | Defines a routing rule for outbound message delivery. | `mtaRouteGet` / `mtaRouteSet` / `mtaRouteQuery` | @type: Mx, Relay, Local |
| MtaStageAuth | singleton | `x:T/get`, `x:T/set` (`ids: ["singleton"]`, no `/query`) | sysMtaStageAuth | Configures SMTP authentication requirements and error handling. | `mtaStageAuthGet` / `mtaStageAuthSet` |  |
| MtaStageConnect | singleton | `x:T/get`, `x:T/set` (`ids: ["singleton"]`, no `/query`) | sysMtaStageConnect | Configures SMTP connection greeting and hostname settings. | `mtaStageConnectGet` / `mtaStageConnectSet` |  |
| MtaStageData | singleton | `x:T/get`, `x:T/set` (`ids: ["singleton"]`, no `/query`) | sysMtaStageData | Configures message processing rules for the SMTP DATA stage. | `mtaStageDataGet` / `mtaStageDataSet` |  |
| MtaStageEhlo | singleton | `x:T/get`, `x:T/set` (`ids: ["singleton"]`, no `/query`) | sysMtaStageEhlo | Configures EHLO command requirements and validation. | `mtaStageEhloGet` / `mtaStageEhloSet` |  |
| MtaStageMail | singleton | `x:T/get`, `x:T/set` (`ids: ["singleton"]`, no `/query`) | sysMtaStageMail | Configures MAIL FROM stage processing and sender validation. | `mtaStageMailGet` / `mtaStageMailSet` |  |
| MtaStageRcpt | singleton | `x:T/get`, `x:T/set` (`ids: ["singleton"]`, no `/query`) | sysMtaStageRcpt | Configures RCPT TO stage processing and recipient validation. | `mtaStageRcptGet` / `mtaStageRcptSet` |  |
| MtaSts | singleton | `x:T/get`, `x:T/set` (`ids: ["singleton"]`, no `/query`) | sysMtaSts | Configures the MTA-STS policy for the server. | `mtaStsGet` / `mtaStsSet` |  |
| MtaTlsStrategy | object | `x:T/get`, `x:T/set`, `x:T/query` | sysMtaTlsStrategy | Defines a TLS security strategy for outbound connections. | `mtaTlsStrategyGet` / `mtaTlsStrategySet` / `mtaTlsStrategyQuery` |  |
| MtaVirtualQueue | object | `x:T/get`, `x:T/set`, `x:T/query` | sysMtaVirtualQueue | Defines a virtual queue for organizing outbound message delivery. | `mtaVirtualQueueGet` / `mtaVirtualQueueSet` / `mtaVirtualQueueQuery` |  |
| NetworkListener | object | `x:T/get`, `x:T/set`, `x:T/query` | sysNetworkListener | Defines a network listener for accepting incoming connections. | `networkListenerGet` / `networkListenerSet` / `networkListenerQuery` |  |
| QueuedMessage | object | `x:T/get`, `x:T/set`, `x:T/query` | sysQueuedMessage | Represents a queued email message pending delivery. | `queuedMessageGet` / `queuedMessageSet` / `queuedMessageQuery` | query: query.rs:122 queued_message_query; set: set.rs:766 queued_message_set |
| x:QueuedMessage/MessageContents | view | — (via parent `x:QueuedMessage`) | — |  | — | parent `x:QueuedMessage` |

### filtering — spam, sieve, lookups, auth reports config

| ObjectType | kind | methods | permissionPrefix | description | helpers | notes |
| --- | --- | --- | --- | --- | --- | --- |
| SpamClassifier | singleton | `x:T/get`, `x:T/set` (`ids: ["singleton"]`, no `/query`) | sysSpamClassifier | Configures the spam classifier model, training parameters, and auto-learning settings. | `spamClassifierGet` / `spamClassifierSet` |  |
| SpamDnsblServer | object | `x:T/get`, `x:T/set`, `x:T/query` | sysSpamDnsblServer | Defines a DNSBL server used for spam filtering lookups. | `spamDnsblServerGet` / `spamDnsblServerSet` / `spamDnsblServerQuery` | @type: Any, Url, Domain, Email, Ip, Header, Body |
| SpamDnsblSettings | singleton | `x:T/get`, `x:T/set` (`ids: ["singleton"]`, no `/query`) | sysSpamDnsblSettings | Configures DNSBL query limits for spam filtering. | `spamDnsblSettingsGet` / `spamDnsblSettingsSet` |  |
| SpamFileExtension | object | `x:T/get`, `x:T/set`, `x:T/query` | sysSpamFileExtension | Defines a file extension classification rule for spam filtering. | `spamFileExtensionGet` / `spamFileExtensionSet` / `spamFileExtensionQuery` |  |
| SpamLlm | singleton | `x:T/get`, `x:T/set` (`ids: ["singleton"]`, no `/query`) | sysSpamLlm | Configures the LLM-based spam classifier. | `spamLlmGet` / `spamLlmSet` | schema:enterprise; @type: Disable, Enable |
| SpamPyzor | singleton | `x:T/get`, `x:T/set` (`ids: ["singleton"]`, no `/query`) | sysSpamPyzor | Configures the Pyzor collaborative spam detection service. | `spamPyzorGet` / `spamPyzorSet` |  |
| SpamRule | object | `x:T/get`, `x:T/set`, `x:T/query` | sysSpamRule | Defines a spam filter rule for message classification. | `spamRuleGet` / `spamRuleSet` / `spamRuleQuery` | @type: Any, Url, Domain, Email, Ip, Header, Body |
| SpamSettings | singleton | `x:T/get`, `x:T/set` (`ids: ["singleton"]`, no `/query`) | sysSpamSettings | Configures global spam filter thresholds, greylisting, and trust settings. | `spamSettingsGet` / `spamSettingsSet` |  |
| SpamTag | object | `x:T/get`, `x:T/set`, `x:T/query` | sysSpamTag | Defines a score or action assigned to a spam classification tag. | `spamTagGet` / `spamTagSet` / `spamTagQuery` | @type: Score, Discard, Reject |
| SpamTrainingSample | object | `x:T/get`, `x:T/set`, `x:T/query` | sysSpamTrainingSample | Stores an email sample used for spam classifier training. | `spamTrainingSampleGet` / `spamTrainingSampleSet` / `spamTrainingSampleQuery` | query: query.rs:113 spam_sample_query; set: set.rs:755 spam_sample_set |
| Asn | singleton | `x:T/get`, `x:T/set` (`ids: ["singleton"]`, no `/query`) | sysAsn | Configures ASN and geolocation data sources for IP address lookups. | `asnGet` / `asnSet` | @type: Disabled, Resource, Dns |
| MemoryLookupKey | object | `x:T/get`, `x:T/set`, `x:T/query` | sysMemoryLookupKey | Defines an in-memory lookup key for fast data access. | `memoryLookupKeyGet` / `memoryLookupKeySet` / `memoryLookupKeyQuery` |  |
| x:MemoryLookupKey/SpamBlockedDomain | view | — (via parent `x:MemoryLookupKey`) | — |  | — | parent `x:MemoryLookupKey` |
| x:MemoryLookupKey/SpamTrap | view | — (via parent `x:MemoryLookupKey`) | — |  | — | parent `x:MemoryLookupKey` |
| x:MemoryLookupKey/SpamTrustedDomain | view | — (via parent `x:MemoryLookupKey`) | — |  | — | parent `x:MemoryLookupKey` |
| x:MemoryLookupKey/SpamUrlRedirector | view | — (via parent `x:MemoryLookupKey`) | — |  | — | parent `x:MemoryLookupKey` |
| MemoryLookupKeyValue | object | `x:T/get`, `x:T/set`, `x:T/query` | sysMemoryLookupKeyValue | Defines an in-memory lookup key-value pair. | `memoryLookupKeyValueGet` / `memoryLookupKeyValueSet` / `memoryLookupKeyValueQuery` |  |
| StoreLookup | object | `x:T/get`, `x:T/set`, `x:T/query` | sysStoreLookup | Defines an external store used for lookups. | `storeLookupGet` / `storeLookupSet` / `storeLookupQuery` |  |
| HttpLookup | object | `x:T/get`, `x:T/set`, `x:T/query` | sysHttpLookup | Defines an HTTP-based lookup list. | `httpLookupGet` / `httpLookupSet` / `httpLookupQuery` |  |
| SieveSystemInterpreter | singleton | `x:T/get`, `x:T/set` (`ids: ["singleton"]`, no `/query`) | sysSieveSystemInterpreter | Configures the system-level Sieve script interpreter settings and limits. | `sieveSystemInterpreterGet` / `sieveSystemInterpreterSet` |  |
| SieveSystemScript | object | `x:T/get`, `x:T/set`, `x:T/query` | sysSieveSystemScript | Defines a system Sieve script executed by the server. | `sieveSystemScriptGet` / `sieveSystemScriptSet` / `sieveSystemScriptQuery` |  |
| SieveUserInterpreter | singleton | `x:T/get`, `x:T/set` (`ids: ["singleton"]`, no `/query`) | sysSieveUserInterpreter | Configures the user-level Sieve script interpreter settings and limits. | `sieveUserInterpreterGet` / `sieveUserInterpreterSet` |  |
| SieveUserScript | object | `x:T/get`, `x:T/set`, `x:T/query` | sysSieveUserScript | Defines a global Sieve script available for user imports. | `sieveUserScriptGet` / `sieveUserScriptSet` / `sieveUserScriptQuery` |  |
| SenderAuth | singleton | `x:T/get`, `x:T/set` (`ids: ["singleton"]`, no `/query`) | sysSenderAuth | Configures sender authentication verification including DKIM, SPF, DMARC, and ARC. | `senderAuthGet` / `senderAuthSet` |  |
| ReportSettings | singleton | `x:T/get`, `x:T/set` (`ids: ["singleton"]`, no `/query`) | sysReportSettings | Configures inbound report analysis and outbound report settings. | `reportSettingsGet` / `reportSettingsSet` |  |
| DkimReportSettings | singleton | `x:T/get`, `x:T/set` (`ids: ["singleton"]`, no `/query`) | sysDkimReportSettings | Configures DKIM authentication failure report generation. | `dkimReportSettingsGet` / `dkimReportSettingsSet` |  |
| DmarcReportSettings | singleton | `x:T/get`, `x:T/set` (`ids: ["singleton"]`, no `/query`) | sysDmarcReportSettings | Configures DMARC aggregate and failure report generation. | `dmarcReportSettingsGet` / `dmarcReportSettingsSet` |  |
| DsnReportSettings | singleton | `x:T/get`, `x:T/set` (`ids: ["singleton"]`, no `/query`) | sysDsnReportSettings | Configures Delivery Status Notification (DSN) report generation. | `dsnReportSettingsGet` / `dsnReportSettingsSet` |  |
| SpfReportSettings | singleton | `x:T/get`, `x:T/set` (`ids: ["singleton"]`, no `/query`) | sysSpfReportSettings | Configures SPF authentication failure report generation. | `spfReportSettingsGet` / `spfReportSettingsSet` |  |
| TlsReportSettings | singleton | `x:T/get`, `x:T/set` (`ids: ["singleton"]`, no `/query`) | sysTlsReportSettings | Configures TLS aggregate report generation. | `tlsReportSettingsGet` / `tlsReportSettingsSet` |  |

### data — external/internal reports, telemetry, storage

| ObjectType | kind | methods | permissionPrefix | description | helpers | notes |
| --- | --- | --- | --- | --- | --- | --- |
| ArfExternalReport | object | `x:T/get`, `x:T/set`, `x:T/query` | sysArfExternalReport | Stores an ARF feedback report received from an external source. | `arfExternalReportGet` / `arfExternalReportSet` / `arfExternalReportQuery` | query: query.rs:65 special report_query; set: set.rs:745 special report_set |
| DmarcExternalReport | object | `x:T/get`, `x:T/set`, `x:T/query` | sysDmarcExternalReport | Stores a DMARC aggregate report received from an external source. | `dmarcExternalReportGet` / `dmarcExternalReportSet` / `dmarcExternalReportQuery` | query: query.rs:65 special report_query; set: set.rs:745 special report_set |
| TlsExternalReport | object | `x:T/get`, `x:T/set`, `x:T/query` | sysTlsExternalReport | Stores a TLS aggregate report received from an external source. | `tlsExternalReportGet` / `tlsExternalReportSet` / `tlsExternalReportQuery` | query: query.rs:65 special report_query; set: set.rs:745 special report_set |
| DmarcInternalReport | object | `x:T/get`, `x:T/set`, `x:T/query` | sysDmarcInternalReport | Stores an outbound DMARC aggregate report pending delivery. | `dmarcInternalReportGet` / `dmarcInternalReportSet` / `dmarcInternalReportQuery` | query: query.rs:65 special report_query; set: set.rs:745 special report_set |
| TlsInternalReport | object | `x:T/get`, `x:T/set`, `x:T/query` | sysTlsInternalReport | Stores an outbound TLS aggregate report pending delivery. | `tlsInternalReportGet` / `tlsInternalReportSet` / `tlsInternalReportQuery` | query: query.rs:65 special report_query; set: set.rs:745 special report_set |
| ArchivedItem | object | `x:T/get`, `x:T/set`, `x:T/query` | sysArchivedItem | Represents an archived item that can be restored. | `archivedItemGet` / `archivedItemSet` / `archivedItemQuery` | schema:enterprise; RUNTIME enterprise-gated (mod.rs:20); query: query.rs:82 archived_item_query (enterprise); set: set.rs:751 archived_item_set (enterprise); @type: Email, FileNode, CalendarEvent, ContactCard, SieveScript |
| Log | object | `x:T/get`, `x:T/query` | sysLog | Represents a server log entry. | `logGet` / `logQuery` | read-only; query: query.rs:160 log_query; set: set.rs:780 read-only (all set ops fail) |
| Trace | object | `x:T/get`, `x:T/query` | sysTrace | Stores a message delivery trace with associated events. | `traceGet` / `traceQuery` | schema:enterprise; RUNTIME enterprise-gated (mod.rs:20); read-only; query: query.rs:104 trace_query (enterprise); set: set.rs:780 read-only (all set ops fail) |
| x:Trace/InboundDelivery | view | — (via parent `x:Trace`) | — |  | — | parent `x:Trace` |
| x:Trace/OutboundDelivery | view | — (via parent `x:Trace`) | — |  | — | parent `x:Trace` |
| Metric | object | `x:T/get`, `x:T/query` | sysMetric | Stores a collected server metric data point. | `metricGet` / `metricQuery` | RUNTIME enterprise-gated (mod.rs:20); read-only; query: query.rs:94 metric_query (enterprise); set: set.rs:780 read-only (all set ops fail); @type: Counter, Gauge, Histogram |
| Tracer | object | `x:T/get`, `x:T/set`, `x:T/query` | sysTracer | Defines a logging and tracing output method. | `tracerGet` / `tracerSet` / `tracerQuery` | @type: Log, Stdout, Journal, OtelHttp, OtelGrpc |
| Alert | object | `x:T/get`, `x:T/set`, `x:T/query` | sysAlert | Defines an alert rule triggered by metric conditions. | `alertGet` / `alertSet` / `alertQuery` | schema:enterprise |
| WebHook | object | `x:T/get`, `x:T/set`, `x:T/query` | sysWebHook | Defines a webhook endpoint for event notifications. | `webHookGet` / `webHookSet` / `webHookQuery` |  |
| Metrics | singleton | `x:T/get`, `x:T/set` (`ids: ["singleton"]`, no `/query`) | sysMetrics | Configures metrics collection and export via OpenTelemetry and Prometheus. | `metricsGet` / `metricsSet` |  |
| x:Metrics/CollectorOtel | view | — (via parent `x:Metrics`) | — |  | — | parent `x:Metrics` |
| x:Metrics/CollectorPrometheus | view | — (via parent `x:Metrics`) | — |  | — | parent `x:Metrics` |
| BlobStore | singleton | `x:T/get`, `x:T/set` (`ids: ["singleton"]`, no `/query`) | sysBlobStore | Configures the blob storage backend for messages and files. | `blobStoreGet` / `blobStoreSet` | @type: Default, Sharded, S3, Azure, FileSystem, FoundationDb, PostgreSql, MySql |
| DataStore | singleton | `x:T/get`, `x:T/set` (`ids: ["singleton"]`, no `/query`) | sysDataStore | Configures the primary data store backend. | `dataStoreGet` / `dataStoreSet` | @type: RocksDb, Sqlite, FoundationDb, PostgreSql, MySql |
| Cache | singleton | `x:T/get`, `x:T/set` (`ids: ["singleton"]`, no `/query`) | sysCache | Configures in-memory cache sizes for data, DNS records, and authorization tokens. | `cacheGet` / `cacheSet` |  |
| Search | singleton | `x:T/get`, `x:T/set` (`ids: ["singleton"]`, no `/query`) | sysSearch | Configures full-text search indexing for emails, calendars, contacts, and tracing. | `searchGet` / `searchSet` |  |
| SearchStore | singleton | `x:T/get`, `x:T/set` (`ids: ["singleton"]`, no `/query`) | sysSearchStore | Configures the full-text search backend. | `searchStoreGet` / `searchStoreSet` | @type: Default, ElasticSearch, Meilisearch, FoundationDb, PostgreSql, MySql |
| InMemoryStore | singleton | `x:T/get`, `x:T/set` (`ids: ["singleton"]`, no `/query`) | sysInMemoryStore | Configures the in-memory cache and lookup store. | `inMemoryStoreGet` / `inMemoryStoreSet` | @type: Default, Sharded, Redis, RedisCluster, RedisSentinel |
| FileStorage | singleton | `x:T/get`, `x:T/set` (`ids: ["singleton"]`, no `/query`) | sysFileStorage | Configures file storage limits. | `fileStorageGet` / `fileStorageSet` |  |
| DataRetention | singleton | `x:T/get`, `x:T/set` (`ids: ["singleton"]`, no `/query`) | sysDataRetention | Configures data retention policies, expunge schedules, and archival settings. | `dataRetentionGet` / `dataRetentionSet` |  |
| x:DataRetention/ArchivingRetention | view | — (via parent `x:DataRetention`) | — |  | — | parent `x:DataRetention` |
| x:DataRetention/DataCleanup | view | — (via parent `x:DataRetention`) | — |  | — | parent `x:DataRetention` |
| x:DataRetention/DataExpunge | view | — (via parent `x:DataRetention`) | — |  | — | parent `x:DataRetention` |
| x:DataRetention/TelemetryRetention | view | — (via parent `x:DataRetention`) | — |  | — | parent `x:DataRetention` |
| MetricsStore | singleton | `x:T/get`, `x:T/set` (`ids: ["singleton"]`, no `/query`) | sysMetricsStore | Configures the storage backend for metrics data. | `metricsStoreGet` / `metricsStoreSet` | schema:enterprise; @type: Disabled, Default, FoundationDb, PostgreSql, MySql |
| TracingStore | singleton | `x:T/get`, `x:T/set` (`ids: ["singleton"]`, no `/query`) | sysTracingStore | Configures the storage backend for tracing data. | `tracingStoreGet` / `tracingStoreSet` | schema:enterprise; @type: Disabled, Default, FoundationDb, PostgreSql, MySql |
| EventTracingLevel | object | `x:T/get`, `x:T/set`, `x:T/query` | sysEventTracingLevel | Defines a custom logging level override for a specific event type. | `eventTracingLevelGet` / `eventTracingLevelSet` / `eventTracingLevelQuery` |  |

### system — server, protocols, cluster, tasks, tenants infra

| ObjectType | kind | methods | permissionPrefix | description | helpers | notes |
| --- | --- | --- | --- | --- | --- | --- |
| SystemSettings | singleton | `x:T/get`, `x:T/set` (`ids: ["singleton"]`, no `/query`) | sysSystemSettings | Configures core server settings including hostname, thread pool, and network services. | `systemSettingsGet` / `systemSettingsSet` |  |
| x:SystemSettings/NetworkServices | view | — (via parent `x:SystemSettings`) | — |  | — | parent `x:SystemSettings` |
| x:SystemSettings/NetworkSettings | view | — (via parent `x:SystemSettings`) | — |  | — | parent `x:SystemSettings` |
| Bootstrap | singleton | `x:T/get`, `x:T/set` (`ids: ["singleton"]`, no `/query`) | sysBootstrap | Initial setup shown the first time Stalwart starts. Configures the server's identity, storage, user accounts, logging, and DNS management. | `bootstrapGet` / `bootstrapSet` | set: set.rs:776 bootstrap_set |
| Enterprise | singleton | `x:T/get`, `x:T/set` (`ids: ["singleton"]`, no `/query`) | sysEnterprise | Configures enterprise licensing and branding settings. | `enterpriseGet` / `enterpriseSet` |  |
| Action | object | `x:T/set` (create only) | sysAction | Defines server management actions such as reloads, troubleshooting and cache operations. | `actionSet` | create-only; query: query.rs:169 query rejected (Actions cannot be queried); set: set.rs:772 action_set (create-only); @type: ReloadSettings, ReloadTlsCertificates, ReloadLookupStores, ReloadBlockedIps, UpdateApps, TroubleshootDmarc, ClassifySpam, InvalidateCaches, InvalidateNegativeCaches, PauseMtaQueue, ResumeMtaQueue |
| Task | object | `x:T/get`, `x:T/set`, `x:T/query` | sysTask | Represents a background task scheduled for execution. | `taskGet` / `taskSet` / `taskQuery` | query: query.rs:151 task_query; set: set.rs:770 task_set; @type: IndexDocument, UnindexDocument, IndexTrace, CalendarAlarmEmail, CalendarAlarmNotification, CalendarItipMessage, MergeThreads, DmarcReport, TlsReport, RestoreArchivedItem, DestroyAccount, AccountMaintenance, TenantMaintenance, StoreMaintenance, SpamFilterMaintenance, AcmeRenewal, DkimManagement, DnsManagement |
| x:Task/TaskFailed | view | — (via parent `x:Task`) | — |  | — | parent `x:Task` |
| TaskManager | singleton | `x:T/get`, `x:T/set` (`ids: ["singleton"]`, no `/query`) | sysTaskManager | Configures task execution settings including retry strategies. | `taskManagerGet` / `taskManagerSet` |  |
| ClusterNode | object | `x:T/get`, `x:T/query` | sysClusterNode | Represents a node in the cluster | `clusterNodeGet` / `clusterNodeQuery` | read-only; query: query.rs:131 cluster_node_query; set: set.rs:780 read-only (all set ops fail) |
| ClusterRole | object | `x:T/get`, `x:T/set`, `x:T/query` | sysClusterRole | Defines a cluster node role with enabled tasks and listeners. | `clusterRoleGet` / `clusterRoleSet` / `clusterRoleQuery` |  |
| Coordinator | singleton | `x:T/get`, `x:T/set` (`ids: ["singleton"]`, no `/query`) | sysCoordinator | Configures the cluster coordinator for inter-node communication. | `coordinatorGet` / `coordinatorSet` | @type: Disabled, Default, Kafka, Nats, Zenoh, Redis, RedisCluster, RedisSentinel |
| Http | singleton | `x:T/get`, `x:T/set` (`ids: ["singleton"]`, no `/query`) | sysHttp | Configures HTTP server settings including rate limiting, CORS, and security headers. | `httpGet` / `httpSet` |  |
| x:Http/HttpSecurity | view | — (via parent `x:Http`) | — |  | — | parent `x:Http` |
| HttpForm | singleton | `x:T/get`, `x:T/set` (`ids: ["singleton"]`, no `/query`) | sysHttpForm | Configures the contact form submission endpoint. | `httpFormGet` / `httpFormSet` |  |
| Imap | singleton | `x:T/get`, `x:T/set` (`ids: ["singleton"]`, no `/query`) | sysImap | Configures IMAP protocol settings including authentication, timeouts, and rate limits. | `imapGet` / `imapSet` |  |
| Jmap | singleton | `x:T/get`, `x:T/set` (`ids: ["singleton"]`, no `/query`) | sysJmap | Configures JMAP protocol limits for requests, uploads, and push notifications. | `jmapGet` / `jmapSet` |  |
| x:Jmap/JmapLimits | view | — (via parent `x:Jmap`) | — |  | — | parent `x:Jmap` |
| x:Jmap/JmapPush | view | — (via parent `x:Jmap`) | — |  | — | parent `x:Jmap` |
| x:Jmap/JmapWebsocket | view | — (via parent `x:Jmap`) | — |  | — | parent `x:Jmap` |
| WebDav | singleton | `x:T/get`, `x:T/set` (`ids: ["singleton"]`, no `/query`) | sysWebDav | Configures WebDAV protocol settings including property limits and locking. | `webDavGet` / `webDavSet` |  |
| Security | singleton | `x:T/get`, `x:T/set` (`ids: ["singleton"]`, no `/query`) | sysSecurity | Configures automatic IP banning rules for abuse, authentication failures, and port scanning. | `securityGet` / `securitySet` |  |
| Sharing | singleton | `x:T/get`, `x:T/set` (`ids: ["singleton"]`, no `/query`) | sysSharing | Configures sharing settings for calendars, address books, and files. | `sharingGet` / `sharingSet` |  |
| Email | singleton | `x:T/get`, `x:T/set` (`ids: ["singleton"]`, no `/query`) | sysEmail | Configures email message limits, encryption, compression, and default folder settings. | `emailGet` / `emailSet` |  |
| x:Email/EmailDefaults | view | — (via parent `x:Email`) | — |  | — | parent `x:Email` |
| x:Email/EmailEncryption | view | — (via parent `x:Email`) | — |  | — | parent `x:Email` |
| x:Email/EmailLimits | view | — (via parent `x:Email`) | — |  | — | parent `x:Email` |
| x:Email/EmailStorage | view | — (via parent `x:Email`) | — |  | — | parent `x:Email` |
| Calendar | singleton | `x:T/get`, `x:T/set` (`ids: ["singleton"]`, no `/query`) | sysCalendar | Configures calendar settings including iCalendar limits and default names. | `calendarGet` / `calendarSet` |  |
| CalendarAlarm | singleton | `x:T/get`, `x:T/set` (`ids: ["singleton"]`, no `/query`) | sysCalendarAlarm | Configures calendar alarm email notifications. | `calendarAlarmGet` / `calendarAlarmSet` |  |
| CalendarScheduling | singleton | `x:T/get`, `x:T/set` (`ids: ["singleton"]`, no `/query`) | sysCalendarScheduling | Configures calendar scheduling, iTIP messaging, and HTTP RSVP settings. | `calendarSchedulingGet` / `calendarSchedulingSet` |  |
| AddressBook | singleton | `x:T/get`, `x:T/set` (`ids: ["singleton"]`, no `/query`) | sysAddressBook | Configures address book and contact storage settings. | `addressBookGet` / `addressBookSet` |  |
| AiModel | object | `x:T/get`, `x:T/set`, `x:T/query` | sysAiModel | Defines an AI model endpoint for LLM-based features. | `aiModelGet` / `aiModelSet` / `aiModelQuery` | schema:enterprise |
| Application | object | `x:T/get`, `x:T/set`, `x:T/query` | sysApplication | Defines a web application served by the server. | `applicationGet` / `applicationSet` / `applicationQuery` |  |
| AllowedIp | object | `x:T/get`, `x:T/set`, `x:T/query` | sysAllowedIp | Defines an allowed IP address or network range. | `allowedIpGet` / `allowedIpSet` / `allowedIpQuery` |  |
| BlockedIp | object | `x:T/get`, `x:T/set`, `x:T/query` | sysBlockedIp | Defines a blocked IP address or network range. | `blockedIpGet` / `blockedIpSet` / `blockedIpQuery` |  |

Cross-checks: `crates/registry/src/schema/properties.rs` enum has 117 variants (Account=0 … WebHook=116);
`resources/schema/schema.json.gz` has 150 `objects` keys (144 `x:*` + 6 standard).
Schema `enterprise` flag is set on: x:AiModel, x:Alert, x:ArchivedItem, x:MaskedEmail, x:MetricsStore, x:SpamLlm, x:Tenant, x:Trace, x:TracingStore.
Runtime enterprise gate (`crates/jmap/src/registry/mod.rs:20-30`) covers only: x:MaskedEmail, x:ArchivedItem, x:Metric, x:Trace.
Standard (non-`x:`) schema objects: AddressBook, Calendar, Mailbox, Principal, SieveScript, VacationResponse.

## 4. Proposed work packages

11 packages covering all 308 in-scope rows (71 §1 + 94 §2 + 144 §3;
`GET /logo` is §5). Every package depends on the shared core (`src/jmap`,
`src/client`); packages 2–6 additionally depend on package 1 for session
handling, packages 8–11 additionally depend on package 7 for the generic
`registryGet`/`registrySet`/`registryQuery({objectType})`. Effort is sized by
row count and row difficulty (S ≈ ≤25 straightforward rows, M ≈ 25–36 rows or
enterprise/side-effect handling).

| #   | package           | folders                                                                                                                                                           | rows                                                                                                            | deps                | effort | notes                                                                                                                                                                                                                                                    |
| --- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `core-transport`  | `src/jmap/`, `src/client/`, `src/eventSource/`, `src/wellKnown/` (jmap redirect only), `src/health/`, `src/metrics/`                                              | 20 (§1: 7 jmap + 1 wk-jmap + 1 robots + 2 healthz + 1 metrics + 1 otel-note; §2: 6 transport + `Core/echo`)     | — (builds the core) | S      | session cache, upload/download URL templates (loopback vs `defaultHostname` gotcha), SSE + WebSocket; `coreEcho` already exists as the per-op pattern                                                                                                    |
| 2   | `mail`            | `src/mailboxes/`, `src/threads/`, `src/emails/`, `src/searchSnippets/`, `src/identities/`, `src/emailSubmissions/`, `src/vacationResponses/`, `src/wellKnown/`    | 36 (§2: 26 mail methods; §1: 5 wk discovery + 1 mail config + 2 autodiscover + 1 well-known OPTIONS + 1 form)   | 1                   | M      | send path needs `Identity/get` → `Email/set` + `EmailSubmission/set` wiring; `POST /form/*` anonymous rate-limited                                                                                                                                       |
| 3   | `groupware-cal`   | `src/principals/`, `src/calendars/`, `src/calendarEvents/`, `src/calendarEventNotifications/`, `src/participantIdentities/`, `src/wellKnown/`                     | 29 (§2: 25; §1: caldav + carddav + calendar-rsvp + api-calendar-rsvp)                                           | 1                   | M      | `getAvailability` needs the `:availability` URN; RSVP spans a static page + a JSON API                                                                                                                                                                   |
| 4   | `groupware-share` | `src/sieveScripts/`, `src/blobs/`, `src/quotas/`, `src/pushSubscriptions/`, `src/addressBooks/`, `src/contactCards/`, `src/fileNodes/`, `src/shareNotifications/` | 36 (§2)                                                                                                         | 1                   | M      | `:parse` capabilities for `ContactCard/parse`; blob method-form vs HTTP-form uploads; `ShareNotification` rides the principals capability                                                                                                                |
| 5   | `auth-oauth`      | `src/oauth/`, `src/management/` (login/discover/account/schema), `src/live/`                                                                                      | 22 (§1: 3 wk-oauth + 7 auth + login/device pages + api/auth + discover + account + 2 schema + 3 token + 3 live) | 1                   | M      | OAuth grant types incl. device flow, PKCE S256, `client_secret_basic/post`/`none`; live token→SSE `?token=` handoff; login/device pages are static (no helper)                                                                                           |
| 6   | `scim`            | `src/scim/`                                                                                                                                                       | 21 (§1: 20 SCIM + 1 DAV-out-of-scope note)                                                                      | 1                   | M      | enterprise-gated: must surface 4xx on community, not retry; `Me` → 501 pinned; no local verification possible beyond error shape                                                                                                                         |
| 7   | `reg-directory`   | `src/registry/` (+ generic helpers)                                                                                                                               | 16 (§3: 14 types + 2 views)                                                                                     | 1                   | S      | builds generic `registryGet/Set/Query` + `account*`, credential (`account_set`) and `@type: User/Group, Ldap/Sql/Oidc` variants first; `MaskedEmail` enterprise-gated                                                                                    |
| 8   | `reg-domains-mta` | `src/registry/`                                                                                                                                                   | 30 (§3: 28 types + 2 views)                                                                                     | 1, 7                | M      | `QueuedMessage` special query/set; `MtaRoute`/`DnsServer` large `@type` unions; many singletons (`ids: ["singleton"]`)                                                                                                                                   |
| 9   | `reg-filtering`   | `src/registry/`                                                                                                                                                   | 34 (§3: 26 types + 8 views)                                                                                     | 1, 7                | M      | `SpamTrainingSample` special query/set; sieve/report singletons; 8 views ride along                                                                                                                                                                      |
| 10  | `reg-data`        | `src/registry/`                                                                                                                                                   | 32 (§3: 24 types + 8 views)                                                                                     | 1, 7                | M      | 5 report types share `report_query`/`report_set`; `Log/Metric/Trace/ClusterNode` read-only; `ArchivedItem/Metric/Trace` (+`Alert`, stores) enterprise-gated on community                                                                                 |
| 11  | `reg-system`      | `src/registry/`                                                                                                                                                   | 32 (§3: 25 types + 7 views)                                                                                     | 1, 7                | M      | `Action` create-only (query rejected, update/destroy fail) with 11 `@type` side effects (`PauseMtaQueue` etc. — never run destructive ones in e2e); `Task` special query/set; `Bootstrap` bootstrap-mode-only; resolve the 3 barrel-name collisions (§3) |

Row arithmetic: 20+36+29+36+22+21+16+30+34+32+32 = 308; plus `GET /logo` (§5) = 309 total rows.

## 5. Out of scope

- `/dav/*` WebDAV (`request.rs:254`) — same calendars, address books and files are reachable via JMAP §2; only the `/.well-known/caldav|carddav` redirects stay in scope.
- IMAP/POP3/SMTP/ManageSieve wire protocols — different ports/protocols, not HTTP; covered by Stalwart's protocol crates, not this client.
- WebUI static assets — `/{app}` bundles (`/admin`, `/account`, `request.rs:688`), `GET /login` + `GET /device` pages (`request.rs:682`), `GET /logo` enterprise branding (`request.rs:630`). The JSON APIs behind them (`POST /api/auth`, SCIM, registry) are in scope.
- `otel` arm (`request.rs:621`) — reserved no-op, no surface.
- Anything enterprise-gated on the community build (`x:Trace`, `x:Metric`, `x:ArchivedItem`, `x:MaskedEmail` runtime gate; SCIM; `/api/live/tracing|metrics`, `/api/token/tracing|metrics`) is implemented as typed calls that surface the server's "Enterprise feature" error — no client-side emulation.
- Bulk-destructive operations in e2e (`x:Account` destroy, `x:Action` queue-pause/cert-reload variants, `SCIM DELETE`, mail to external addresses) — implemented but never exercised against live; see `docs/local-instance.md` and [architecture.md](./architecture.md) §8.
