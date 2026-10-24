# @adaptive-ds/stalwart-client

TypeScript client and CLI for the Stalwart mail server (JMAP + management API). Full API coverage, Result-typed, Valibot-validated.

> Skeleton — the full README (install, library + CLI examples per context, env
> reference) is written at integration time once all contexts land.

## Install

```bash
bun add @adaptive-ds/stalwart-client
```

## Library

```ts
import { coreEcho, jmapSessionGet, stalwartClientFromEnv } from "@adaptive-ds/stalwart-client"

const fromEnv = stalwartClientFromEnv()
if (!fromEnv.success) throw new Error(fromEnv.errorMessage)
const config = fromEnv.data

const session = await jmapSessionGet({ config })
if (!session.success) throw new Error(session.errorMessage)
console.log(session.data.primaryAccounts)

const echoed = await coreEcho({ config, args: { hello: true } })
if (!echoed.success) throw new Error(echoed.errorMessage)
console.log(echoed.data)
```

## Environment

`STALWART_BASE_URL` (required), `STALWART_USERNAME` / `STALWART_PASSWORD`
(Basic; optional), `STALWART_TOKEN` (Bearer, optional — used only when
username/password are unset), `STALWART_ACCOUNT_ID`,
`STALWART_TIMEOUT_MS` / `STALWART_RETRIES` (optional). Bun auto-loads `.env`.

## License

`MIT © David Siewert`.
