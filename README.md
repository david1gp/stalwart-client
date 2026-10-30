# @adaptive-ds/stalwart-client

Run your Stalwart mail server from TypeScript: send mail, manage calendars and contacts, and automate every server setting — all type-safe, all from one package.

Full JMAP coverage (mail, calendars, address books, files, sharing, quotas, push, object metadata) plus the complete Stalwart management registry (120 object types), OAuth/OIDC, SCIM 2.0, and live telemetry. Every fallible call returns a `Result`, every input and response is Valibot-validated, and everything is also available as a JSON CLI.

[![npm](https://img.shields.io/npm/v/%40adaptive-ds%2Fstalwart-client)](https://www.npmjs.com/package/@adaptive-ds/stalwart-client)
[![license](https://img.shields.io/npm/l/%40adaptive-ds%2Fstalwart-client)](./LICENSE)

## Quick links

- [Install](#install)
- [Library quick start](#library-quick-start)
- [What it covers](#what-it-covers)
- [Mail](#mail)
- [Groupware](#groupware)
- [Server management (registry)](#server-management-registry)
- [OAuth, SCIM, and live telemetry](#oauth-scim-and-live-telemetry)
- [CLI](#cli)
- [Configuration](#configuration)
- [Validation and errors](#validation-and-errors)
- [Development and testing](#development-and-testing)
- [Stalwart documentation](https://stalw.art/docs)
- [GitHub repository](https://github.com/david1gp/stalwart-client)

## Install

The package targets Node.js 22+ and Bun 1.3+. The CLI executable is included in the package.

```sh
bun add @adaptive-ds/stalwart-client @adaptive-ds/result valibot
# or
npm install @adaptive-ds/stalwart-client @adaptive-ds/result valibot
```

`@adaptive-ds/result` and `valibot` are peer dependencies and must be installed by library consumers. `@stricli/core` is installed as the CLI's package dependency.

Run the CLI without a local install with Bun:

```sh
bunx --package @adaptive-ds/stalwart-client stalwart-client --help
```

## Library quick start

`stalwartClientFromEnv` reads `STALWART_*` variables and returns `Result<StalwartClientConfig>`. Check `success` before reading `data`; every operation returns a `PromiseResult` and follows the same pattern.

```ts
import {
  emailSend,
  jmapSessionGet,
  stalwartClientFromEnv,
} from "@adaptive-ds/stalwart-client"

const fromEnv = stalwartClientFromEnv()
if (!fromEnv.success) throw new Error(fromEnv.errorMessage)
const config = fromEnv.data

const session = await jmapSessionGet({ config })
if (!session.success) throw new Error(session.errorMessage)
console.log(session.data.primaryAccounts)

const sent = await emailSend({
  config,
  accountId: config.accountId ?? "main",
  identityId: "my-identity",
  mailboxIds: ["sent"],
  subject: "Hello from stalwart-client",
  to: [{ email: "friend@example.com" }],
  textBody: "Sent with a Result-typed JMAP client.",
})
if (!sent.success) console.error(`${sent.op}: ${sent.errorMessage}`)
```

Prefer explicit config over environment in long-lived services:

```ts
import { stalwartClientConfig } from "@adaptive-ds/stalwart-client"

const configured = stalwartClientConfig({
  baseUrl: "https://mail.example.com",
  username: "alice",
  password: process.env.STALWART_APP_PASSWORD ?? "",
})
if (!configured.success) throw new Error(configured.errorMessage)
```

## What it covers

- **Mail (JMAP)** — mailboxes, threads, emails (get/query/set/copy/import/parse/send), search snippets, identities, submissions, vacation responses
- **Groupware (JMAP)** — principals, calendars, calendar events and notifications, participant identities, Sieve scripts, blobs, quotas, push subscriptions, address books, contact cards, file nodes, share notifications
- **Transports** — JMAP over HTTP, EventSource (SSE), and WebSocket, plus blob upload/download
- **Server management (registry)** — all 120 generated Stalwart management object types (domains, DKIM, certificates, MTA, spam, Sieve, lookups, reports, telemetry, storage, cluster, tasks, groupware settings, OAuth grants, index queues) plus 27 views, with typed get/set/query and a generic escape hatch for the rest
- **OAuth/OIDC** — discovery, device and authorization-code flows, PKCE helpers, token issuance and introspection, UserInfo, client registration
- **SCIM 2.0** — users, groups, bulk, search, and service discovery
- **HTTP helpers** — `.well-known` discovery, Outlook autodiscover, contact forms, calendar RSVP pages, health and Prometheus metrics

One export per file, named after its subject (`emailGet`, not `getEmail`). Every operation is exported from the package root and is also importable by its bounded-context path, for example:

```ts
import { emailGet } from "@adaptive-ds/stalwart-client/emails/emailGet"
```

## Mail

Standard Mailbox/Thread/Email methods plus send/import conveniences:

```ts
import { emailGet, emailQuery } from "@adaptive-ds/stalwart-client"

const queried = await emailQuery({
  config,
  accountId: "main",
  filter: { inMailbox: "inbox", hasAttachment: false },
  sort: [{ property: "receivedAt", isAscending: false }],
  limit: 20,
})
if (!queried.success) throw new Error(queried.errorMessage)

const messages = await emailGet({
  config,
  accountId: "main",
  ids: queried.data.ids.slice(0, 5),
  properties: ["id", "subject", "from", "receivedAt", "preview"],
})
if (messages.success) console.log(messages.data.list)
```

```sh
stalwart-client email query --account-id main --filter-in-mailbox inbox --limit 20
stalwart-client email get --account-id main --id <email-id>
stalwart-client email send --account-id main --identity-id <id> --to friend@example.com --subject "Hi" --text-body "Hello"
```

## Groupware

Calendars, events, availability, contacts, files, and shares follow the same `Result` pattern:

```ts
import {
  calendarEventGet,
  principalGet,
} from "@adaptive-ds/stalwart-client"

const principals = await principalGet({ config, accountId: "main", ids: ["alice"] })
if (!principals.success) throw new Error(principals.errorMessage)

const events = await calendarEventGet({ config, accountId: "main", ids: ["event-id"] })
if (events.success) console.log(events.data.list)
```

```sh
stalwart-client calendar get --account-id main
stalwart-client calendar-event query --account-id main --limit 20
stalwart-client principal get --account-id main --id alice
stalwart-client contact query --account-id main --limit 20
stalwart-client file query --account-id main --limit 20
```

## Server management (registry)

The registry covers every Stalwart management object — domains, DKIM, certificates, MTA stages and routes, spam rules, DNS resolvers, storage, cluster, background tasks, and more. Use the typed per-area functions, or the generic `registryGet`/`registrySet`/`registryQuery` escape hatch for anything else:

```ts
import { registryGet } from "@adaptive-ds/stalwart-client"

const domain = await registryGet({
  config,
  type: "NetworkListener",
  id: "imap",
})
if (!domain.success) console.error(`${domain.op}: ${domain.errorMessage}`)
else console.log(domain.data)
```

```sh
stalwart-client registry types
stalwart-client registry get --type NetworkListener --id imap
stalwart-client domains domain get --id example.com
stalwart-client mta mta-route list
stalwart-client spam settings get
```

Registry writes need an admin account (the server rejects non-admins with `forbidden`).

## OAuth, SCIM, and live telemetry

```sh
stalwart-client oauth openid-configuration
stalwart-client oauth device-authorize --client-id <id>
stalwart-client scim user list
stalwart-client live delivery --help
stalwart-client management login --username admin
```

```ts
import { scimUserGet } from "@adaptive-ds/stalwart-client"

const user = await scimUserGet({ config, id: "user-id" })
if (user.success) console.log(user.data)
```

## CLI

Install the package and run the `stalwart-client` executable:

```sh
bun add --global @adaptive-ds/stalwart-client
stalwart-client --help
```

When invoking the CLI directly with Bun, use `bun --no-env-file` so the CLI controls environment loading (for example, `bun --no-env-file ./dist/cli.js --help`). Node execution does not require this flag.

The CLI prints one JSON result per invocation. Successes go to stdout. Help also returns a successful JSON result. Failures go to stderr and exit with status 1.

Commands accept named options only. Positional values and JSON input are rejected. The CLI automatically loads `.env` from the current directory when it exists. Use the global `--env-path <path>` option to select another environment file; inherited process environment values take precedence over values from the file. A missing default `.env` is ignored, but an explicitly selected file must be readable.

Authentication is resolved in this order: explicit flags, `STALWART_USERNAME`/`STALWART_PASSWORD` (Basic, preferred when both are set), then `STALWART_TOKEN` (Bearer — OAuth access token or `API_…` key, used only when username/password are not both set).

```sh
export STALWART_BASE_URL=https://mail.example.com
export STALWART_USERNAME=alice
export STALWART_PASSWORD=your-app-password
stalwart-client session get
stalwart-client mailbox query --account-id main --limit 20
```

Use `--base-url` to target another server. Binary commands keep data out of the JSON result unless `--output` is supplied, in which case they write the file there:

```sh
stalwart-client blob upload --account-id main --content-type application/pdf --path ./invoice.pdf
stalwart-client blob download --account-id main --id <blob-id> --output ./downloaded.pdf
```

## Configuration

```dotenv
STALWART_BASE_URL=https://mail.example.com
STALWART_USERNAME=alice
STALWART_PASSWORD=replace-with-an-app-password
# STALWART_TOKEN=replace-with-a-bearer-token-or-api-key
# STALWART_ACCOUNT_ID=main
# STALWART_TIMEOUT_MS=30000
# STALWART_RETRIES=2
```

`STALWART_BASE_URL` is required (no trailing slash). `STALWART_TOKEN` accepts an OAuth access token or a Stalwart API key (starting with `API_`) and is used only when username/password are not both set. `STALWART_ACCOUNT_ID` is the default JMAP account used when an operation does not pass one.

## Validation and errors

Fallible functions return `Result<T>` or `PromiseResult<T>` from `#result`. Runtime inputs and JSON responses are validated with Valibot.

```ts
const result = await emailGet({ config, accountId: "main", ids: [] })
if (!result.success) {
  console.error(`${result.op}: ${result.errorMessage}`)
}
```

`errorData` on failures is always a JSON-stringified server payload (never an object). Transport, HTTP, timeout, and validation failures are returned as errors, not thrown — `try/catch` is for your own bugs, not for API errors.

## Development and testing

Requirements are Bun 1.3+ and Node.js 22+.

```sh
bun install
bun run check    # format:check + type-check + 800+ unit tests
bun run build    # emit dist/
bun run test:e2e:local  # full e2e suite against a throwaway local Stalwart
```

Conventions: one export per file named after it, subject-first names, bounded contexts under `src/` (generic JMAP core in `src/jmap/`, Stalwart layer in `src/client/`, one folder per API area). Run `bun run index:generate` after adding files; never edit `src/index.ts` by hand. The API contract is inventoried in [`docs/api-inventory.md`](./docs/api-inventory.md) and the agent conventions in [`docs/architecture.md`](./docs/architecture.md).
