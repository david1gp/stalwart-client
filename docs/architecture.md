# stalwart-client — architecture + conventions for parallel agents

This is the conventions doc for every agent implementing per-area operations on
top of the core. Read it fully before writing code. TL;DR:

- One export per file, named after it. Subject-first names (`emailGet`, not `getEmail`).
- Bounded contexts: `src/jmap/` (generic JMAP core, **standards-only**),
  `src/client/` (Stalwart layer), then one folder per API area.
- Fallible functions return `Result`/`PromiseResult` and never throw.
- `errorData` is always a **JSON-stringified** server payload (never an object).
- Run `bun run index:generate` after adding files. Never edit `src/index.ts` or
  `src/cli/cliApp.ts` by hand beyond the one wiring line per context.

Stack: `bun`, `typescript`, `biome`, `valibot` as `import * as a from "valibot"`,
`@adaptive-ds/result` via the `#result` bare specifier, `@stricli/core` for the CLI.
See also `docs/sibling-pattern.md` in mailcow-client for the model this package copies.

## 1. The two layers: `src/jmap/` vs `src/client/`

`src/jmap/` is **standards-only and server-agnostic** and may later be split into
its own `@adaptive-ds/jmap-client` package. Hard rules:

- It must not import anything Stalwart-specific: no `stalwart*` names, no `x:`
  registry knowledge, no `STALWART_*` env vars.
- Generic HTTP/auth/config pieces it needs are the minimal interface it owns:
  `jmapClientConfigSchema` (`baseUrl` trimmed, optional `username`+`password` →
  Basic, optional `token` → Bearer, optional `accountId` default,
  `timeoutMs`, `retries`) and `jmapHttpRequest`.
- Server-specific capability mapping is an extension hook, not hardcoded:
  `jmapMethodCapabilities(methodName, ...resolvers)` takes
  `JmapCapabilityResolver`s. `src/jmap/` handles standard objects; anything
  else (`x:*`) is a `ResultErr` unless a resolver claims it.

`src/client/` is the Stalwart layer and wraps/extends the generic core:

- `stalwartClientConfigSchema` / `stalwartClientConfig` /
  `stalwartClientFromEnv` (`STALWART_BASE_URL`, `STALWART_USERNAME`,
  `STALWART_PASSWORD`, `STALWART_TOKEN`, `STALWART_ACCOUNT_ID`,
  `STALWART_TIMEOUT_MS`, `STALWART_RETRIES`).
- `stalwartCapabilityResolver`: `x:*` methods → `urn:stalwart:jmap`
  (`STALWART_CAPABILITY`). Always pass it as the first resolver.
- `stalwartRequest` / `stalwartMethodCall`: thin wrappers over
  `jmapRequest` / `jmapMethodCall` with the resolver pre-wired.

Auth recap (verified in Stalwart source at `crates/http/src/auth/authenticate.rs`):

- `Authorization: Basic base64(user:password)` — login or app password.
- `Authorization: Bearer <token>` — OAuth access token, or an `x:ApiKey`
  secret (`API_…` base64url of accountId + credentialId + secret,
  `crates/common/src/auth/credential.rs`). The client treats them identically.
- `config.token` is used only when username/password are not both set
  (Basic wins).

## 2. JMAP protocol essentials (verified against Stalwart source @ aa47d8ef)

- `GET /.well-known/jmap` → 307 to `/jmap/session`; `GET /jmap/session` → JMAP
  Session (RFC 8620 §2). `jmapSessionGet` caches per `JmapSessionCache`;
  call `jmapSessionCacheClear` to force a refetch.
- `POST /jmap/` with `{using, methodCalls, createdIds?}` → `{methodResponses,
  sessionState, createdIds?}`. Method-level failures come back as
  `["error", {type, description?, …}, callId]` and `jmapMethodCall` maps them
  to `createResultError(op, "<type>: <description>", JSON.stringify(args))`.
- `using` derivation: Stalwart enforces `using` per call
  (`crates/jmap/src/api/request.rs`); `jmapMethodCapabilities` always includes
  `urn:ietf:params:jmap:core` plus the object capability:
  Email/Mailbox/Thread/SearchSnippet → `urn:ietf:params:jmap:mail`;
  Core/PushSubscription → core only; Blob → `…:blob`;
  Identity/EmailSubmission → `…:submission`; VacationResponse →
  `…:vacationresponse`; SieveScript → `…:sieve`; Principal/ShareNotification →
  `…:principals`; Quota → `…:quota`;
  Calendar/CalendarEvent/CalendarEventNotification/ParticipantIdentity →
  `…:calendars`; AddressBook/ContactCard → `…:contacts`; FileNode →
  `…:filenode`; `Core/echo` → core only. `x:*` → `urn:stalwart:jmap` via the
  client-layer resolver.
- `accountId` resolution (`jmapAccountIdResolve`): explicit arg ?? 
  `config.accountId` ?? `session.primaryAccounts[capability]`. Stalwart
  auto-fills Core/PushSubscription/registry methods with the caller's account
  and requires it otherwise (`resolve_account_id`).
- Upload/download use session URL templates: `uploadUrl`
  (`/jmap/upload/{accountId}/`, raw POST → `{accountId, blobId, type, size}`),
  `downloadUrl` (`/jmap/download/{accountId}/{blobId}/{name}?accept=`).
- Registry filters: property equal, or `<prop>Is{GreaterThan,
  GreaterThanOrEqual, LessThan, LessThanOrEqual}`
  (`crates/jmap-proto/src/object/registry.rs`). 117 `x:*` object types;
  singletons have no `/query` (see the inventory doc for the full table).

## 3. Per-operation file pattern (copy `coreEcho` exactly)

One bounded-context folder per API area. Three files per op:

1. Options schema — `coreEchoOptionsSchema.ts`:
   ```ts
   import * as a from "valibot"
   import { jmapClientConfigSchema } from "../client/stalwartClientConfigSchema.js" // or jmap… for core ops

   export const coreEchoOptionsSchema = a.object({
     config: stalwartClientConfigSchema,
     args: a.optional(a.record(a.string(), a.unknown())),
   })

   export type CoreEchoOptions = a.InferInput<typeof coreEchoOptionsSchema>
   ```
   Options always take `config` first. Types derive from the schema
   (`a.InferInput`); no shared `types.ts` buckets.
2. Operation — `coreEcho.ts`:
   ```ts
   import * as a from "valibot"
   import { createResultError, type PromiseResult } from "#result"
   import { coreEchoOptionsSchema, type CoreEchoOptions } from "./coreEchoOptionsSchema.js"
   import { stalwartMethodCall } from "../client/stalwartMethodCall.js"

   export async function coreEcho(options: CoreEchoOptions): PromiseResult<Record<string, unknown>> {
     const op = "coreEcho"
     const parsed = a.safeParse(coreEchoOptionsSchema, options)
     if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
     return stalwartMethodCall<Record<string, unknown>>({
       config: parsed.output.config,
       methodName: "Core/echo",
       arguments: (parsed.output.args ?? {}) as Record<string, unknown>,
     })
   }
   ```
   Rules: `const op = "fnName"` first, `a.safeParse` →
   `createResultError(op, a.summarize(parsed.issues))` on failure, early
   returns (`if (!r.success) return r`), never throw. `errorData` is always
   `JSON.stringify(serverPayload)` — `@adaptive-ds/result@0.6`
   `createResultError(op, msg, errorData?: string | null)` takes a **string**.
3. CLI module — `src/<ctx>/cli/<ctx>Commands.ts` exporting `<ctx>Commands`
   (see §5). Complex args arrive as `--*Json` flags; validation stays in the
   library op.

Naming: subject-first, verb after the subject: `emailGet`, `emailSet`,
`emailQuery`, `emailChanges`, `emailQueryChanges`, `emailCopy`, `emailImport`,
`emailParse`, `domainQuery` (registry reads are `query`, not `list`).

`/set` responses are partial successes: a non-empty
`notCreated`/`notUpdated`/`notDestroyed` must become a ResultErr via
`jmapSetErrorCheck(op, response)` — it carries the full SetResponse as
(JSON-stringified) errorData. Never silently drop set errors.

## 4. Bounded-context folder plan

- `jmap/` — generic core (done): config, auth header, HTTP request, session,
  capabilities + resolver hook, accountId, set-error check, upload/download,
  SSE parser, `coreEcho` reference op.
- Mail: `mailboxes/ emails/ threads/ searchSnippets/ identities/
  emailSubmissions/ vacationResponses/ sieveScripts/ blobs/ quotas/
  pushSubscriptions/ eventSource/`
- Groupware: `principals/ calendars/ calendarEvents/
  calendarEventNotifications/ participantIdentities/ addressBooks/
  contactCards/ fileNodes/ shareNotifications/`
- `registry/` — generic `x:*` get/set/query helpers + generated per-type
  schemas plus curated helpers (`accounts/ domains/` …).
- HTTP helpers: `management/ oauth/ scim/ wellKnown/ health/ metrics/ live/`.

Contexts own their layers (`schemas/ops/cli/` live inside the context);
no global `schemas/` or `utils/` buckets. CLI-only helpers live in `src/cli/`.

## 5. CLI conventions

- Shared infra in `src/cli/`: `cliApp`, `cliConfigFlagParams`
  (`--baseUrl --username --password --token --accountId`),
  `cliConfigFlags`, `cliConfigLoad` (flags override env), `cliRunApi`
  (config → run → pretty-JSON stdout, Result-JSON stderr + exit 1),
  `cliWriteJson`, `cliFail`, `cliJsonParse`/`cliJsonFlagParam`
  (`--*Json` flags; schema validation stays in the library op),
  `cliScalarFlagParams`, `cliBinaryOutput` (`--output` writes bytes,
  otherwise `{encoding:"base64",data}`), `versionCommand`.
- Each context exports `<ctx>Commands` from
  `src/<ctx>/cli/<ctx>Commands.ts` (built with `buildRouteMap`). Wiring in
  `cliApp.ts` is integration-time: one import + one route line per context
  (copy the `session`/`jmap`/`core` entries). Current routes: `version`,
  `session get`, `jmap call --method --argsJson`, `jmap request
  --requestJson`, `core echo`.
- Raw escape hatches (`jmap call`, `jmap request`) stay available forever;
  they are also the fastest way to smoke-test a new method before writing
  its typed op.

## 6. Index generation

Never edit `src/index.ts` by hand. After adding files:

```bash
bun run index:generate   # scans src/**, emits export lines, sorted
```

The generator skips `src/cli/**`, `**/cli/**`, `src/cli.ts`, `src/index.ts`.
`test/indexFreshness.test.ts` fails when the barrel is stale — regenerate
and the test passes.

## 7. Test conventions

- `bun test` (mocked `fetch`, no network). Use `test/fetchMock.ts`:
  ```ts
  import { fetchMockCreate, fetchMockJson } from "./fetchMock.js"
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => { mock?.restore(); mock = undefined })
  mock = fetchMockCreate((request) => {
    const url = new URL(request.url)
    if (url.pathname === "/jmap/session") return fetchMockJson(sessionFixture)
    return fetchMockJson({ methodResponses: [...], sessionState: "1" })
  })
  // mock.requests[n] = {url, method, headers, body}
  ```
  Assert exact URL/method/headers/`using`/body; assert `encodeURIComponent`
  path params; missing-arg and circular-input cases → `ResultErr` with `op`.
  `test/jmapTestSessionCreate.ts` helper: prefer the shared
  `test/jmapTestSession.ts` fixture over inline sessions.
- `test/cliOperationCoverage.test.ts`: every public op in `src/index.ts`
  must be called by a `src/**/cli/*Commands.ts` module AND reachable from
  `cliApp`. Helpers that are intentionally CLI-invisible
  (`stalwartMethodCall`, `jmapSetErrorCheck`, `sseEventsParse`, …) go in the
  test's `excludedExports` set with a comment.
- E2E (live + local): gate on env, import from `dist/`, never commit `.env`.

## 8. E2E conventions + safety rules

Setup: `e2e/e2eSetup.ts` loads config from `.env` (live) or
`ops/local-stalwart/.env.local` when `STALWART_E2E_TARGET=local`;
`e2e/e2eRunId.ts` namespaces throwaway objects. Scripts:
`bun run test:e2e` (live `.env`), `bun run test:e2e:local` (local harness).
One `e2e/<ctx>.e2e.ts` per context; place strict reverse-order teardown in
`afterAll` (best-effort, never `throw` inside cleanup — log and continue).

These rules are non-negotiable (violations can lock everyone out):

- Run-scoped throwaway objects only (e.g. domain `e2e-<runId>.test`, users
  under it). Strict reverse-order teardown. Never touch pre-existing objects.
- NO deliberate failed-auth tests, NO probing of unknown/random HTTP paths,
  NO port scans. Stalwart's auth/scan/loiter auto-ban would ban the host's
  public IP `78.159.110.222` — which is also Caddy's IP — locking everyone out.
- No mail to external addresses. No `x:Action` that pauses the queue or
  reloads certs on live.
- Live tracing/metrics and `x:Trace`/`x:Metric`/`x:ArchivedItem` are
  enterprise-only — expect `"Enterprise feature"` / forbidden, pin that.
- The live instance currently runs in recovery mode: auth is Basic with the
  recovery admin, the session primary account for `urn:stalwart:jmap` is the
  admin, `x:Domain/query` and `x:Account/query` return empty, 7
  NetworkListeners exist.

Other agents own `ops/local-stalwart/**`, `e2e/local*` harness files, and
`docs/local-instance.md` — do not touch those paths or `.env*` files; keep
`!.env.example` in `.gitignore` so the example stays committable.
