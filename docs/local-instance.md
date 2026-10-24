# Local Stalwart test instance (for `@adaptive-ds/stalwart-client` E2E)

Throwaway single-node Stalwart (`docker.io/stalwartlabs/stalwart:latest`, community
build) on loopback, seeded non-interactively with a domain, an admin, and two
test users. Other agents: source `ops/local-stalwart/.env.local` and talk raw
JMAP to `http://127.0.0.1:18080`.

## Quick start

```bash
bash ops/local-stalwart/start.sh          # fresh run: wipes container + data/, bootstraps, leaves it running
bash ops/local-stalwart/start.sh --keep   # reuse data/ (recreates container, re-verifies admin login)
bash ops/local-stalwart/stop.sh           # stop + remove container (data/ kept)
source ops/local-stalwart/.env.local      # STALWART_BASE_URL, STALWART_USERNAME, STALWART_PASSWORD, ...
```

What `start.sh` does: detects `podman` (preferred) or `docker`; wipes the old
`stalwart-client-test` container + `ops/local-stalwart/data/` (unless `--keep`);
starts the container **in recovery mode** with a random
`STALWART_RECOVERY_ADMIN=admin:<random>`; runs `bun bootstrap.ts`, which creates
`x:Domain example.test`, sets `x:SystemSettings` (hostname `mail.example.test`,
default domain), creates `admin@example.test` (Admin role, generated password),
test users `alice`/`bob@example.test`, then recreates the container **without**
the recovery env (normal mode: all listeners + queue manager up, backdoor gone)
and verifies the admin login. Credentials/ids land in
`ops/local-stalwart/.env.local` (gitignored):

```
STALWART_BASE_URL=http://127.0.0.1:18080
STALWART_USERNAME=admin@example.test
STALWART_PASSWORD=<generated>
STALWART_DOMAIN_ID=b
STALWART_ADMIN_ACCOUNT_ID=b
STALWART_DOMAIN=example.test
STALWART_USER_A=alice@example.test
STALWART_USER_A_PASSWORD=<generated>
STALWART_USER_A_ACCOUNT_ID=c
STALWART_USER_B=bob@example.test
STALWART_USER_B_PASSWORD=<generated>
STALWART_USER_B_ACCOUNT_ID=d
```

Ports (all loopback): `18080→8080` (HTTP/JMAP), `10025→25` (SMTP),
`10143→143` (IMAP). Ids `b/c/d` are snowflake ids rendered in Stalwart's base36-ish
form; they are stable for a given data volume but regenerate on every fresh run —
always read them from `.env.local`, never hardcode.

## How bootstrap mode works (source citations)

Fresh boot with **no config file** (`crates/store/src/registry/local.rs:81`,
`RegistryInit::Bootstrap`) puts the server in bootstrap mode:
`crates/store/src/build/registry.rs:34` prints a one-time `admin`/random-password
banner (or honors `STALWART_RECOVERY_ADMIN`), backed by an in-memory ephemeral
store (`EphemeralStore::open`). In this mode `x:Bootstrap/get|set`
(`crates/jmap/src/registry/mapping/bootstrap.rs:50,80`) is the **only**
accessible method — every other get/query/set fails with
"`The server is in bootstrap mode. Only the 'Bootstrap' object type can be
accessed until the bootstrap process is complete.`"
(`crates/jmap/src/registry/query.rs:56-60`, same guard in `get.rs:55`,
`set.rs:103`).

**We deliberately never enter bootstrap mode.** `ops/local-stalwart/config.json`
is mounted from the start, so even an empty SQLite DB parses as a datastore and
the server boots in *normal* mode — empty, with zero accounts, i.e. no way to
authenticate. Setup therefore goes through **recovery mode**
(`STALWART_RECOVERY_MODE=1`, `crates/store/src/build/registry.rs:25-31`), which
binds a single `http-recovery` listener on `[::]:8080`
(`crates/common/src/config/server/listener.rs:66-82`), skips queue/task/push
services (`crates/services/src/lib.rs:41,49`,
`crates/smtp/src/lib.rs:41`), and grants the `STALWART_RECOVERY_ADMIN` credential
superuser access (`crates/common/src/auth/authentication.rs:87-118`,
id `u32::MAX`, `crates/common/src/auth/mod.rs:35`). The recovery admin can use
all registry methods except a few explicitly cleared ones (API keys/app passwords
for itself, account settings/password — `crates/http/src/auth/permissions.rs:60-122`).

`x:Bootstrap/set` writes `/etc/stalwart/config.json` (`write_data_store`,
`crates/store/src/registry/local.rs`) and builds the domain, system settings,
admin, DKIM tasks, etc. in one shot
(`crates/jmap/src/registry/mapping/bootstrap.rs:80-330`) — but it only runs in
true bootstrap mode. Our `bootstrap.ts` replicates its *effect* with individual
registry calls in recovery mode, which is equivalent and restart-free until the
final normal-mode switch. On first normal boot `insert_safe_defaults`
(`crates/common/src/manager/defaults.rs:60-120`) fills in the 7 default
listeners (smtp/submissions/imaps/pop3s/sieve/https/http), roles, routes, TLS
strategies, etc. Note the defaults include `https` on 443 with `use_tls: true`
and no certificate installed — with no ACME/cert configured, direct TLS ports
may fail handshakes; plain `http` on 8080 and cleartext SMTP/IMAP test ports are
what this instance uses.

Domain validity: `is_valid_domain` (`crates/utils/src/lib.rs:428-442`) accepts
`example.test` because `test` is in `RESERVED_TLDS` (also `localhost`,
`*.localhost`, `*.test`, …); real TLDs need a valid PSL suffix.

## Auth (verified)

- **Basic with full email + password** works for every account type
  (`admin@example.test`, `alice@example.test`). **Bare usernames work too**
  (`alice` → `alice@example.test` via `defaultDomainId` in SystemSettings).
- **Basic as `admin` with the recovery password** only works while
  `STALWART_RECOVERY_ADMIN` is set (recovery container). After the normal-mode
  restart it 401s — verified the backdoor is gone.
- **API keys** (`x:ApiKey/set` → `secret: "API_AAAAA…"`): usable as
  `Authorization: Bearer <key>` (maps to the owning account), **not** as a Basic
  password. Scope: recovery admin cannot create/query them
  (`SysApiKey*` cleared, `permissions.rs:107-122`); the real admin can.
- **App passwords** (`x:AppPassword/set` on the user's own account id →
  `secret: "app_…"`): usable as the **Basic password** for that user, **not**
  as Bearer (Bearer non-`API_` tokens are treated as JWT/OAuth and 401).
- Failed auth → HTTP 401
  `{"type":"about:blank","status":401,…"detail":"You have to authenticate first."}`.
  HTTP Basic credentials are cached server-side (`http_auth` cache,
  `crates/http/src/auth/authenticate.rs:28-78`); a password change may take up
  to the OAuth token expiry to fully propagate on cached connections.

## Verified raw examples (run 2026-10-24 against the local instance)

Conventions: `B=http://127.0.0.1:18080`, all bodies
`Content-Type: application/json`. Registry methods need
`"using":["urn:ietf:params:jmap:core","urn:stalwart:jmap"]` (verified that even
`x:Domain/query` works with only the core capability in `using`, but always send
both). `accountId` is the *caller's* account id (`b`=admin, `c`=alice, `d`=bob).

### GET /jmap/session (admin, HTTP 200)

```bash
curl -s -u admin@example.test:<pw> $B/jmap/session
```

Notable fields: `username: "admin@example.test"`, `accounts: {"b":
"admin@example.test"}`. Capabilities (`urn:ietf:params:jmap:*`): blob,
calendars, calendars:parse, contacts, contacts:parse, core, emailpush, filenode,
mail, principals, principals:availability, quota, sieve, submission,
vacationresponse, webpush-vapid, websocket. **`urn:stalwart:jmap` is NOT listed
in `capabilities`** (only in `primaryAccounts`, alongside mail/submission/… all
→ `"b"`). `apiUrl`/`downloadUrl`/`uploadUrl`/`eventSourceUrl` point at
`https://mail.example.test/...` (from `defaultHostname` — use `$B` instead).
`GET /.well-known/jmap` → 307 to `/jmap/session`.

### x:Domain/query + x:Domain/get

```bash
curl -s -X POST $B/jmap/ -u admin@example.test:<pw> -H 'Content-Type: application/json' -d \
 '{"using":["urn:ietf:params:jmap:core","urn:stalwart:jmap"],"methodCalls":[
   ["x:Domain/query",{"accountId":"b","limit":10},"q"],
   ["x:Domain/get",{"accountId":"b","#ids":{"resultOf":"q","name":"x:Domain/query","path":"/ids/*"}},"g"]]}'
# → query ids ["b","c"]; get list[0]: {"name":"example.test","isEnabled":true,
#   "certificateManagement":{"@type":"Manual"},"dkimManagement":{"@type":"Automatic",…},
#   "dnsManagement":{"@type":"Manual"},"subAddressing":{"@type":"Enabled"},…,"id":"b"}
```

### Create a domain via x:Domain/set

```bash
# → {"methodResponses":[["x:Domain/set",{"accountId":"b","created":{"d2":{"id":"c"}}},"c0"]]}
'{"using":[…],"methodCalls":[["x:Domain/set",{"accountId":"b",
   "create":{"d2":{"name":"mail.example.test"}}},"c0"]]}'
```

### Create two user accounts (x:Account/set with inline password) and delete one

```bash
# create alice+bob+throwaway carol (credentials map key "0" is the credential slot):
'{"using":[…],"methodCalls":[["x:Account/set",{"accountId":"b","create":{
   "u1":{"@type":"User","name":"alice","domainId":"b",
          "credentials":{"0":{"@type":"Password","secret":"alice-pass-1"}}},
   "u2":{"@type":"User","name":"bob","domainId":"b",
          "credentials":{"0":{"@type":"Password","secret":"bob-pass-1"}}},
   "u3":{"@type":"User","name":"carol","domainId":"b"}}},"c0"]]}'
# → created {"u1":{"id":"c"},"u2":{"id":"d"},"u3":{"id":"e"}}
# destroy: [["x:Account/set",{"accountId":"b","destroy":["e"]},"c0"]] → {"destroyed":["e"]}
# carol/dave-style login afterwards → 401. x:Account/get shows roles
# {"@type":"User"} vs {"@type":"Admin"}, emailAddress auto-derived.
```

Gotcha: `x:AccountPassword/set` (update `{"singleton":{…}}`) **requires an
existing password** ("Cannot set a password … on an account that doesn't have
one", `account.rs:213-222`) — so always set the initial password inline at
create time as above, or via `credentials` on update (as `bootstrap.ts` does
for the admin).

### User login: Mailbox/get, Email/query

```bash
curl -s -X POST $B/jmap/ -u alice@example.test:<pw> -H 'Content-Type: application/json' -d \
 '{"using":["urn:ietf:params:jmap:core","urn:ietf:params:jmap:mail"],"methodCalls":[
   ["Mailbox/get",{"accountId":"c"},"m"],
   ["Email/query",{"accountId":"c","filter":{}},"e"]]}'
# → 5 mailboxes (Inbox a / Sent Items e / Junk c / Drafts d / Trash b), email ids []
```

### Identity/get (needed for identityId)

```bash
# → {"list":[{"id":"b","name":"alice@example.test","email":"alice@example.test",…}]}
[["Identity/get",{"accountId":"c"},"i"]]  # using += urn:ietf:params:jmap:submission
```

### Send alice→bob and confirm arrival (latency ≈ 70 ms, no queue wait)

One call, creation references (`#e1`) wire draft to submission; must save into
a mailbox (`mailboxIds`) *and* reference `identityId` from `Identity/get`:

```bash
curl -s -X POST $B/jmap/ -u alice@example.test:<pw> -H 'Content-Type: application/json' -d \
 '{"using":["urn:ietf:params:jmap:core","urn:ietf:params:jmap:mail","urn:ietf:params:jmap:submission"],
   "methodCalls":[
    ["Email/set",{"accountId":"c","create":{"e1":{
       "mailboxIds":{"d":true},
       "from":[{"email":"alice@example.test"}],"to":[{"email":"bob@example.test"}],
       "subject":"Hello from JMAP",
       "textBody":[{"partId":"t1","type":"text/plain"}],
       "bodyValues":{"t1":{"value":"Hi Bob, this is a test message sent via JMAP."}}}}},"m0"],
    ["EmailSubmission/set",{"accountId":"c","create":{"s1":{
       "emailId":"#e1",
       "envelope":{"mailFrom":{"email":"alice@example.test"},
                   "rcptTo":[{"email":"bob@example.test"}]},
       "identityId":"b"}}},"m1"]]}'
# → Email/set created {"id":"eaaaaab",…}; EmailSubmission/set created
#   {"id":"b","sendAt":"…","undoStatus":"pending"}
```

Bob polls his Inbox — message present on the **first poll ~1 s later** (measured
67 ms from submission response to query hit; `receivedAt` == `sendAt` second).
Same-id `eaaaaab` on both sides is coincidence of the id generator on a fresh
DB — do not assert on it.

```bash
curl -s -X POST $B/jmap/ -u bob@example.test:<pw> -H 'Content-Type: application/json' -d \
 '{"using":["urn:ietf:params:jmap:core","urn:ietf:params:jmap:mail"],"methodCalls":[
   ["Email/query",{"accountId":"d","filter":{"inMailbox":"a"}},"q"],
   ["Email/get",{"accountId":"d",
     "#ids":{"resultOf":"q","name":"Email/query","path":"/ids/*"},
     "properties":["id","from","to","subject","receivedAt","size","bodyValues"],
     "bodyProperties":["textBody"],"fetchTextBodyValues":true},"g"]]}'
# → ids ["eaaaaab"], from alice@example.test, subject "Hello from JMAP",
#   bodyValues {"0":{"value":"Hi Bob, this is a test message sent via JMAP.",…}}
```

### Singleton get/set round trip (x:Imap/get)

```bash
[["x:Imap/get",{"accountId":"b","ids":["singleton"]},"g"]]
# → {"allowPlainTextAuth":false,"maxAuthFailures":3,…,"timeoutIdle":1800000,…}
# set: [["x:Imap/set",{"accountId":"b","update":{"singleton":{"timeoutIdle":1200000}}},"s"]]
# → {"updated":{"singleton":null}}; get shows 1200000; set back to 1800000.
```

Gotcha: Durations are **milliseconds as numbers** (`1200000`), not `"20m"` strings —
string form fails with `invalidPatch / "Invalid path for Duration"`.

### x:Action/set (ReloadSettings — safe)

```bash
'{"using":[…],"methodCalls":[["x:Action/set",{"accountId":"b",
   "create":{"a1":{"@type":"ReloadSettings"}}},"c"]]}'
# → {"created":{"a1":{"id":"bvnzzus"}}}  (Actions: create-only; update/destroy
#   always fail — crates/jmap/src/registry/mapping/action.rs:43-45.)
```

### GET /api/account, GET /api/schema, GET /healthz/live

```bash
curl -s -u admin@example.test:<pw> $B/api/account
# → {"permissions":[…637…],"edition":"community","locale":"en-US"}
curl -s -u alice@example.test:<pw> $B/api/account
# → 239 permissions incl. self-service sysAccountPasswordGet/Update,
#   sysAccountSettingsGet/Update, sysApiKey*, sysAppPassword*,
#   sysArchivedItem*, sysMaskedEmail*, sysPublicKey*, sysSpamTrainingSample* —
#   but NOT sysDomain*/sysAccount* management (those calls → forbidden).
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" -u admin:… $B/api/schema
# → 302 /api/schema/<sha256>; GET that (authenticated) → gzipped schema JSON
#   (150 objects, 317 field entries), Content-Encoding: gzip
#   (crates/http/src/api/mod.rs:117-140).
curl -s $B/healthz/live   # → {"detail":"OK","status":200,…} (no auth)
curl -s $B/healthz/ready  # same shape; 503 while storage uninitialized
```
`/admin` and `/account` → 302 (WebUI bundle routes).

### Surprises / gotchas

- Registry methods reject non-admins with method-level
  `["error",{"type":"forbidden","description":"You are not authorized…"}]`
  (`x:Domain/query`, `x:Account/query`, `x:Imap/get` as alice all verified).
- `x:Trace/*`, `x:Metric/*`, `x:ArchivedItem/*` (and live-tracing/metrics token
  endpoints) return `forbidden: "This feature is only available in the
  Enterprise edition…"` on this community image — asserted at
  `crates/jmap/src/registry/mod.rs:41` via `assert_enterprise_object`
  (`query.rs:62`). Client code must surface, not retry, these.
- `x:Bootstrap/get` in normal mode returns `notFound: ["singleton"]` (same for
  the recovery admin in recovery mode) — normal post-setup signal.
- `using` may omit `urn:stalwart:jmap` and registry calls still work; keep
  sending it anyway (it's the documented capability).
- Identity ids are per-database (alice's was `b` on one fresh DB and equally
  could differ) — always `Identity/get` first; a stale `identityId` fails with
  `invalidProperties / "Identity not found."` and nothing is sent.
- Session `apiUrl` etc. use `https://mail.example.test` (defaultHostname), not
  the loopback address — always derive the base URL from config, not session.
- Shell quoting: build JMAP bodies with python/`jq`/Bun, never hand-inline
  JSON with `!`/quotes in bash `-d` strings (an earlier probe 400'd with
  `notRequest` purely from mangled quoting).
- `x:NetworkListener/query` as admin lists the 7 default listeners
  (smtp:25, submissions:465, imaps:993, pop3s:995, sieve:4190, https:443,
  http:8080). Direct TLS ports have no certificate installed — use 18080/10025/10143.
- Deletes are immediate on community (no retention window); destroying an
  account unlinks its mail. The v0.16 migration doc explicitly warns against
  bulk-deleting `Account` objects on migrated stores.

## Applying this to the production test instance

Read-only analysis from `~/cs/stalwart/README.md` + `podman/stalwart.container`
(no changes made; instance not contacted by this agent). Current deployment
state (provided by operator, consistent with the README): container running with
`STALWART_RECOVERY_MODE=1` + `STALWART_RECOVERY_ADMIN=admin:<secret>`,
`x:Domain/query` and `x:Account/query` empty, 7 listeners present,
`x:Bootstrap/get` → notFound (past bootstrap), recovery admin id `d333333`.

1. **Credentials needed** (already in the project's gitignored `.env` as
   `STALWART_BASE_URL=https://stalwart.contentoren.de`,
   `STALWART_USERNAME=admin`, `STALWART_PASSWORD=<recovery secret>` —
   same three variables the local `.env.local` uses, so client code is portable).
2. **Bootstrap there = same recovery-mode path as local**: the exact
   `bootstrap.ts` sequence works against it — create `Domain contentoren.com`
   (or staging domain first), `SystemSettings/set` hostname
   `stalwart.contentoren.de` + default domain, create real admin + `Admin` role,
   then **remove `STALWART_RECOVERY_MODE`/`STALWART_RECOVERY_ADMIN`** from
   `podman/stalwart.env` and restart (Quad/`.container` already omits them, so
   this is an env-file edit + `daemon-reload` + restart).
3. **Before going live**: set the blob store (B2 `contentoren-stalwart` creds
   from `shared/b2-provision.sh stalwart`), OIDC directory
   (`issuerUrl https://auth.contentoren.de`, audience from
   `scripts/provision-oidc.sh`), TLS/listeners for the test ports — all via
   JMAP/`stalwart-cli apply`, snapshotted with `stalwart-cli snapshot`.
4. **Do NOT probe it with bad credentials or random paths**: recovery mode
   disables fail2ban (`crates/common/src/network/security.rs:164-187`); after
   the restart, every failure is SNATed to one IP and fail2ban would ban the
   whole deployment. Keep all negative testing on the local instance.
5. **Local-vs-prod session difference to expect**: locally `urn:stalwart:jmap`
   is absent from `capabilities` but present in `primaryAccounts`, and
   `x:ApiKey/query` works for the real admin but is `forbidden "Account not
   found."` for the recovery admin — the same asymmetry will show on prod until
   a real admin exists. `x:SystemSettings/get` returning an empty list on prod
   vs populated locally just reflects that no settings were written there yet.
