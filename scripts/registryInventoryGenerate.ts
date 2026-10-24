/**
 * `scripts/registryInventoryGenerate.ts` — generate the registry (`x:*`)
 * section of `docs/api-inventory.md`.
 *
 * Reads `~/opensource/stalwart/resources/schema/schema.json.gz` with
 * `Bun.gunzipSync` (Stalwart HEAD `aa47d8ef`) and prints markdown to stdout.
 * Paste the output into `docs/api-inventory.md` §3.
 *
 * Per-object data comes from the schema file (`objects` entry: `type`,
 * `description`, `permissionPrefix`, `enterprise`; `schemas` entry for
 * `multiple` `@type` variants). Behavioral marks (enterprise gate,
 * create-only / read-only, special query/set mappings) are curated from the
 * Stalwart source — each carries its `crates/...:line` reference — because
 * that behavior is not encoded in the schema file.
 *
 * Cross-checks enforced here: 117 `ObjectType` variants
 * (`crates/registry/src/schema/properties.rs`), 150 schema `objects`
 * (117 types + 27 views + 6 standard JMAP objects).
 */

const SCHEMA_GZ = `${process.env.HOME}/opensource/stalwart/resources/schema/schema.json.gz`

type SchemaObject = {
  type: "object" | "singleton" | "view"
  description?: string
  permissionPrefix?: string
  enterprise?: boolean
}

type SchemaFile = {
  objects: Record<string, SchemaObject>
  schemas: Record<string, { type: string; variants?: { name: string }[] }>
}

const raw = await Bun.file(SCHEMA_GZ).bytes()
const schema = JSON.parse(Buffer.from(Bun.gunzipSync(raw)).toString("utf8")) as SchemaFile

const objectKeys = Object.keys(schema.objects)
const xKeys = objectKeys.filter((k) => k.startsWith("x:")).sort()
const viewKeys = xKeys.filter((k) => k.includes("/"))
const typeKeys = xKeys.filter((k) => !k.includes("/"))
const stdKeys = objectKeys.filter((k) => !k.startsWith("x:"))

if (typeKeys.length !== 117) throw new Error(`expected 117 registry types, got ${typeKeys.length}`)
if (viewKeys.length !== 27) throw new Error(`expected 27 views, got ${viewKeys.length}`)
if (objectKeys.length !== 150) throw new Error(`expected 150 schema objects, got ${objectKeys.length}`)

// --- curated behavioral marks (source-ref'd; not in the schema file) ---

// Runtime enterprise gate: crates/jmap/src/registry/mod.rs:20-30.
// On community these fail with "Enterprise feature"; assert_enterprise_object
// is checked in query.rs:62, get.rs:61, set.rs:109.
const RUNTIME_ENTERPRISE = new Set(["MaskedEmail", "ArchivedItem", "Metric", "Trace"])
// Create-only: update/destroy always fail —
// crates/jmap/src/registry/mapping/action.rs:43-45.
const CREATE_ONLY = new Set(["Action"])
// Read-only: set fails all creates/updates/destroys —
// crates/jmap/src/registry/set.rs:781-783.
const READ_ONLY = new Set(["Log", "Metric", "Trace", "ClusterNode"])
// Special query mappings — crates/jmap/src/registry/query.rs.
const QUERY_SPECIAL: Record<string, string> = {
  ArfExternalReport: "query.rs:65 special report_query",
  DmarcExternalReport: "query.rs:65 special report_query",
  TlsExternalReport: "query.rs:65 special report_query",
  DmarcInternalReport: "query.rs:65 special report_query",
  TlsInternalReport: "query.rs:65 special report_query",
  ArchivedItem: "query.rs:82 archived_item_query (enterprise)",
  Metric: "query.rs:94 metric_query (enterprise)",
  Trace: "query.rs:104 trace_query (enterprise)",
  SpamTrainingSample: "query.rs:113 spam_sample_query",
  QueuedMessage: "query.rs:122 queued_message_query",
  ClusterNode: "query.rs:131 cluster_node_query",
  ApiKey: "query.rs:140 credential_query",
  AppPassword: "query.rs:140 credential_query",
  Task: "query.rs:151 task_query",
  Log: "query.rs:160 log_query",
  Action: "query.rs:169 query rejected (Actions cannot be queried)",
}
// Special set handlers — crates/jmap/src/registry/set.rs + mapping/*.
const SET_SPECIAL: Record<string, string> = {
  ArfExternalReport: "set.rs:745 special report_set",
  DmarcExternalReport: "set.rs:745 special report_set",
  TlsExternalReport: "set.rs:745 special report_set",
  DmarcInternalReport: "set.rs:745 special report_set",
  TlsInternalReport: "set.rs:745 special report_set",
  ArchivedItem: "set.rs:751 archived_item_set (enterprise)",
  SpamTrainingSample: "set.rs:755 spam_sample_set",
  AccountSettings: "set.rs:762 account_set",
  ApiKey: "set.rs:762 account_set",
  AccountPassword: "set.rs:762 account_set",
  AppPassword: "set.rs:762 account_set",
  QueuedMessage: "set.rs:766 queued_message_set",
  Task: "set.rs:770 task_set",
  Action: "set.rs:772 action_set (create-only)",
  Bootstrap: "set.rs:776 bootstrap_set",
  Log: "set.rs:780 read-only (all set ops fail)",
  Metric: "set.rs:780 read-only (all set ops fail)",
  Trace: "set.rs:780 read-only (all set ops fail)",
  ClusterNode: "set.rs:780 read-only (all set ops fail)",
}

// --- management areas (every type assigned exactly once) ---
const AREAS: { name: string; folder: string; members: string[] }[] = [
  {
    name: "directory — accounts, roles, tenants, credentials",
    folder: "src/registry/",
    members: [
      "Account",
      "AccountPassword",
      "AccountSettings",
      "Role",
      "Tenant",
      "MailingList",
      "OAuthClient",
      "ApiKey",
      "AppPassword",
      "MaskedEmail",
      "PublicKey",
      "Directory",
      "Authentication",
      "OidcProvider",
    ],
  },
  {
    name: "domains — domains, DNS, DKIM, certificates",
    folder: "src/registry/",
    members: ["Domain", "DkimSignature", "Certificate", "AcmeProvider", "DnsServer", "DnsResolver"],
  },
  {
    name: "mta — SMTP stages, routing, throttles, queue",
    folder: "src/registry/",
    members: [
      "MtaConnectionStrategy",
      "MtaDeliverySchedule",
      "MtaExtensions",
      "MtaHook",
      "MtaInboundSession",
      "MtaInboundThrottle",
      "MtaMilter",
      "MtaOutboundStrategy",
      "MtaOutboundThrottle",
      "MtaQueueQuota",
      "MtaRoute",
      "MtaStageAuth",
      "MtaStageConnect",
      "MtaStageData",
      "MtaStageEhlo",
      "MtaStageMail",
      "MtaStageRcpt",
      "MtaSts",
      "MtaTlsStrategy",
      "MtaVirtualQueue",
      "NetworkListener",
      "QueuedMessage",
    ],
  },
  {
    name: "filtering — spam, sieve, lookups, auth reports config",
    folder: "src/registry/",
    members: [
      "SpamClassifier",
      "SpamDnsblServer",
      "SpamDnsblSettings",
      "SpamFileExtension",
      "SpamLlm",
      "SpamPyzor",
      "SpamRule",
      "SpamSettings",
      "SpamTag",
      "SpamTrainingSample",
      "Asn",
      "MemoryLookupKey",
      "MemoryLookupKeyValue",
      "StoreLookup",
      "HttpLookup",
      "SieveSystemInterpreter",
      "SieveSystemScript",
      "SieveUserInterpreter",
      "SieveUserScript",
      "SenderAuth",
      "ReportSettings",
      "DkimReportSettings",
      "DmarcReportSettings",
      "DsnReportSettings",
      "SpfReportSettings",
      "TlsReportSettings",
    ],
  },
  {
    name: "data — external/internal reports, telemetry, storage",
    folder: "src/registry/",
    members: [
      "ArfExternalReport",
      "DmarcExternalReport",
      "TlsExternalReport",
      "DmarcInternalReport",
      "TlsInternalReport",
      "ArchivedItem",
      "Log",
      "Trace",
      "Metric",
      "Tracer",
      "Alert",
      "WebHook",
      "Metrics",
      "BlobStore",
      "DataStore",
      "Cache",
      "Search",
      "SearchStore",
      "InMemoryStore",
      "FileStorage",
      "DataRetention",
      "MetricsStore",
      "TracingStore",
      "EventTracingLevel",
    ],
  },
  {
    name: "system — server, protocols, cluster, tasks, tenants infra",
    folder: "src/registry/",
    members: [
      "SystemSettings",
      "Bootstrap",
      "Enterprise",
      "Action",
      "Task",
      "TaskManager",
      "ClusterNode",
      "ClusterRole",
      "Coordinator",
      "Http",
      "HttpForm",
      "Imap",
      "Jmap",
      "WebDav",
      "Security",
      "Sharing",
      "Email",
      "Calendar",
      "CalendarAlarm",
      "CalendarScheduling",
      "AddressBook",
      "AiModel",
      "Application",
      "AllowedIp",
      "BlockedIp",
    ],
  },
]

{
  const assigned = AREAS.flatMap((a) => a.members).sort()
  const expected = [...typeKeys].map((k) => k.slice(2)).sort()
  const missing = expected.filter((m) => !assigned.includes(m))
  const extra = assigned.filter((m) => !expected.includes(m as string))
  if (missing.length > 0 || extra.length > 0)
    throw new Error(`area assignment mismatch: missing=${missing} extra=${extra}`)
}

function helperBase(name: string): string {
  if (name === "OAuthClient") return "oauthClient"
  return name.charAt(0).toLowerCase() + name.slice(1)
}

function rowFor(typeName: string): string {
  const entry = schema.objects[`x:${typeName}`]
  const kind = entry.type
  const perm = entry.permissionPrefix ?? "—"
  const desc = (entry.description ?? "").replace(/\s+/g, " ").replace(/\|/g, "\\|")
  const base = helperBase(typeName)
  let methods: string
  let helpers: string
  if (CREATE_ONLY.has(typeName)) {
    methods = "`x:T/set` (create only)"
    helpers = `\`${base}Set\``
  } else if (READ_ONLY.has(typeName)) {
    methods = "`x:T/get`, `x:T/query`"
    helpers = `\`${base}Get\` / \`${base}Query\``
  } else if (kind === "singleton") {
    methods = '`x:T/get`, `x:T/set` (`ids: ["singleton"]`, no `/query`)'
    helpers = `\`${base}Get\` / \`${base}Set\``
  } else {
    methods = "`x:T/get`, `x:T/set`, `x:T/query`"
    helpers = `\`${base}Get\` / \`${base}Set\` / \`${base}Query\``
  }
  const notes: string[] = []
  if (entry.enterprise) notes.push("schema:enterprise")
  if (RUNTIME_ENTERPRISE.has(typeName)) notes.push("RUNTIME enterprise-gated (mod.rs:20)")
  if (CREATE_ONLY.has(typeName)) notes.push("create-only")
  if (READ_ONLY.has(typeName)) notes.push("read-only")
  if (QUERY_SPECIAL[typeName]) notes.push(`query: ${QUERY_SPECIAL[typeName]}`)
  if (SET_SPECIAL[typeName]) notes.push(`set: ${SET_SPECIAL[typeName]}`)
  const schemaEntry = schema.schemas[`x:${typeName}`]
  if (schemaEntry?.type === "multiple" && schemaEntry.variants)
    notes.push(`@type: ${schemaEntry.variants.map((v) => v.name).join(", ")}`)
  return `| ${typeName} | ${kind} | ${methods} | ${perm} | ${desc} | ${helpers} | ${notes.join("; ")} |`
}

function viewRows(parent: string): string[] {
  return viewKeys
    .filter((k) => k === `x:${parent}` || k.startsWith(`x:${parent}/`))
    .filter((k) => k !== `x:${parent}`)
    .map((k) => {
      const entry = schema.objects[k]
      const desc = (entry.description ?? "").replace(/\s+/g, " ").replace(/\|/g, "\\|")
      return `| ${k} | view | — (via parent \`x:${parent}\`) | ${entry.permissionPrefix ?? "—"} | ${desc} | — | parent \`x:${parent}\` |`
    })
}

const out: string[] = []
out.push(
  `<!-- GENERATED by scripts/registryInventoryGenerate.ts from ~/opensource/stalwart/resources/schema/schema.json.gz — do not edit by hand. -->`,
  ``,
  `All methods run over \`POST /jmap/\` with \`"using": ["urn:ietf:params:jmap:core", "urn:stalwart:jmap"]\`.`,
  `Singletons have no \`/query\` (see the bottom of \`MethodName::parse\`, \`crates/jmap-proto/src/request/method.rs\`).`,
  `Thin typed helpers (\`domainGet\`/\`domainSet\`/\`domainQuery\`, …) are all built on generic`,
  `\`registryGet\` / \`registrySet\` / \`registryQuery({objectType})\`. Folder for every row: \`src/registry/\`.`,
  ``,
  `Counts: 117 registry types + 27 views + 6 standard objects = 150 schema objects.`,
  ``,
)
for (const area of AREAS) {
  out.push(`### ${area.name}`, ``)
  out.push(`| ObjectType | kind | methods | permissionPrefix | description | helpers | notes |`)
  out.push(`| --- | --- | --- | --- | --- | --- | --- |`)
  for (const m of area.members) {
    out.push(rowFor(m))
    for (const v of viewRows(m)) out.push(v)
  }
  out.push(``)
}
out.push(
  `Cross-checks: \`crates/registry/src/schema/properties.rs\` enum has 117 variants (Account=0 … WebHook=116);`,
  `\`resources/schema/schema.json.gz\` has 150 \`objects\` keys (144 \`x:*\` + 6 standard).`,
  `Schema \`enterprise\` flag is set on: ${Object.keys(schema.objects)
    .filter((k) => schema.objects[k].enterprise)
    .join(", ")}.`,
  `Runtime enterprise gate (\`crates/jmap/src/registry/mod.rs:20-30\`) covers only: ${[...RUNTIME_ENTERPRISE].map((t) => `x:${t}`).join(", ")}.`,
  `Standard (non-\`x:\`) schema objects: ${stdKeys.join(", ")}.`,
)
console.log(out.join("\n"))
