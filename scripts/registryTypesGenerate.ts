#!/usr/bin/env bun
/**
 * Generate TypeScript types for Stalwart's management ("registry") objects.
 *
 * Reads the machine-readable Stalwart schema (gzipped JSON) from `--schema`
 * (default `~/opensource/stalwart/resources/schema/schema.json.gz`) or from a
 * live server with `--url <baseUrl>` (`GET /api/schema` redirect, Basic auth
 * from `STALWART_USERNAME`/`STALWART_PASSWORD`), and writes one-export-per-file
 * TypeScript modules under `--out` (default `src/registry/generated`).
 *
 * Never copies the schema file itself into the repo: only derived TypeScript
 * plus a `registrySchemaInfo.ts` record (sha256 + source) are written.
 */

import { createHash } from "node:crypto"
import { gunzipSync } from "node:zlib"
import { homedir } from "node:os"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

type SchemaPropertyType = {
  type: string
  format?: string
  nullable?: boolean
  objectName?: string
  enumName?: string
  class?: SchemaPropertyType
  keyClass?: SchemaPropertyType
  valueClass?: SchemaPropertyType
}

type SchemaProperty = {
  description: string
  type: SchemaPropertyType
  update: "mutable" | "immutable" | "serverSet"
}

type SchemaFields = {
  properties: Record<string, SchemaProperty>
  defaults?: Record<string, unknown>
}

type SchemaVariant = { name: string; label: string; schemaName?: string }

type SchemaEntry = { type: "single"; schemaName: string } | { type: "multiple"; variants: SchemaVariant[] }

type SchemaObject =
  | { type: "object"; description: string; permissionPrefix: string }
  | { type: "singleton"; description: string; permissionPrefix: string }
  | { type: "view"; objectName: string }

type SchemaFile = {
  objects: Record<string, SchemaObject>
  schemas: Record<string, SchemaEntry>
  fields: Record<string, SchemaFields>
  enums: Record<string, { name: string; label: string }[]>
}

function argValue(name: string): string | null {
  const index = process.argv.indexOf(name)
  const value = index >= 0 ? process.argv[index + 1] : undefined
  return value === undefined || value.startsWith("--") ? null : value
}

function expandHome(path: string): string {
  return path.startsWith("~/") ? join(homedir(), path.slice(2)) : path
}

async function schemaLoad(): Promise<{ bytes: Uint8Array; source: string }> {
  const url = argValue("--url")
  if (url !== null) {
    const username = process.env["STALWART_USERNAME"]
    const password = process.env["STALWART_PASSWORD"]
    if (username === undefined || password === undefined) {
      throw new Error("registryTypesGenerate: --url needs STALWART_USERNAME and STALWART_PASSWORD")
    }
    const response = await fetch(`${url}/api/schema`, {
      headers: { Authorization: `Basic ${btoa(`${username}:${password}`)}` },
      redirect: "follow",
    })
    if (!response.ok) {
      throw new Error(`registryTypesGenerate: GET /api/schema failed with ${response.status}`)
    }
    const bytes = new Uint8Array(await response.arrayBuffer())
    return { bytes, source: response.url }
  }
  const path = argValue("--schema") ?? "~/opensource/stalwart/resources/schema/schema.json.gz"
  const file = Bun.file(expandHome(path))
  if (!(await file.exists())) {
    throw new Error(`registryTypesGenerate: schema file not found: ${path}`)
  }
  return { bytes: new Uint8Array(await file.arrayBuffer()), source: path }
}

function schemaParse(bytes: Uint8Array): SchemaFile {
  const raw =
    bytes[0] === 0x1f && bytes[1] === 0x8b ? gunzipSync(bytes).toString("utf8") : Buffer.from(bytes).toString("utf8")
  return JSON.parse(raw) as SchemaFile
}

function jsdocEscape(text: string): string {
  return text.replaceAll("*/", "*\\/").trim()
}

function registryTypeName(schemaKey: string): string {
  return `Registry${schemaKey.slice("x:".length)}`
}

function registryEnumName(enumName: string): string {
  return `RegistryEnum${enumName}`
}

const thisDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = dirname(thisDir)

const { bytes, source } = await schemaLoad()
const sha256 = createHash("sha256").update(bytes).digest("hex")
const schema = schemaParse(bytes)

const fieldsKeys = Object.keys(schema.fields)
  .filter((key) => key.startsWith("x:"))
  .sort()
const schemasKeys = Object.keys(schema.schemas)
  .filter((key) => key.startsWith("x:"))
  .sort()
const enumNames = Object.keys(schema.enums).sort()

// Method objects: the x: entries with kind object/singleton. Views are not
// method objects; they are recorded separately in registryViews.ts.
const objectNames = Object.keys(schema.objects)
  .filter((key) => key.startsWith("x:"))
  .filter((key) => schema.objects[key]?.type === "object" || schema.objects[key]?.type === "singleton")
  .map((key) => key.slice("x:".length))
  .sort()
const viewNames = Object.keys(schema.objects)
  .filter((key) => key.startsWith("x:"))
  .filter((key) => schema.objects[key]?.type === "view")
  .sort()

// Every `object`/`objectList`/`map`-value/`set`-class reference inside x:
// fields must resolve to a generated type. Unknown targets would break
// codegen, so fail loudly instead of emitting `any`.
const generatedTypes = new Set<string>()
for (const key of fieldsKeys) {
  generatedTypes.add(registryTypeName(key))
  generatedTypes.add(`${registryTypeName(key)}Create`)
}
for (const key of schemasKeys) {
  if (schema.schemas[key]?.type === "multiple") {
    generatedTypes.add(registryTypeName(key))
    generatedTypes.add(`${registryTypeName(key)}Create`)
  }
}
for (const name of enumNames) {
  generatedTypes.add(registryEnumName(name))
}

// Detect export-name collisions before writing anything.
const seen = new Map<string, string>()
function claim(exportName: string, origin: string): void {
  const prev = seen.get(exportName)
  if (prev !== undefined) {
    throw new Error(`registryTypesGenerate: name collision for ${exportName}: ${prev} vs ${origin}`)
  }
  seen.set(exportName, origin)
}
for (const key of fieldsKeys) {
  claim(registryTypeName(key), `fields:${key}`)
  claim(`${registryTypeName(key)}Create`, `fields:${key}#create`)
}
for (const key of schemasKeys) {
  if (schema.schemas[key]?.type === "multiple") {
    claim(registryTypeName(key), `schemas:${key}`)
    claim(`${registryTypeName(key)}Create`, `schemas:${key}#create`)
  }
}
for (const name of enumNames) {
  claim(registryEnumName(name), `enums:${name}`)
}
claim("RegistryObjectType", "metadata:object-type")
claim("registryObjectTypes", "metadata:object-types")
claim("registryViews", "metadata:views")
claim("RegistryObjectMap", "metadata:object-map")
claim("RegistryObjectCreateMap", "metadata:create-map")
claim("registrySchemaInfo", "metadata:schema-info")

const imports = new Map<string, Set<string>>()

function refFor(fromFile: string, exportName: string): string {
  if (!generatedTypes.has(exportName)) {
    throw new Error(`registryTypesGenerate: ${fromFile} references unknown type ${exportName}`)
  }
  let files = imports.get(fromFile)
  if (files === undefined) {
    files = new Set<string>()
    imports.set(fromFile, files)
  }
  files.add(exportName)
  return exportName
}

function keyClassTs(fromFile: string, cls: SchemaPropertyType): string {
  if (cls.type === "enum") {
    return refFor(fromFile, registryEnumName(cls.enumName ?? ""))
  }
  if (cls.type === "string" || cls.type === "objectId") {
    return "string"
  }
  throw new Error(`registryTypesGenerate: unsupported key class ${JSON.stringify(cls)} in ${fromFile}`)
}

function mapValueTs(fromFile: string, value: SchemaPropertyType): string {
  if (value.type === "string" || value.type === "number" || value.type === "boolean") {
    return value.type
  }
  if (value.type === "enum") {
    return refFor(fromFile, registryEnumName(value.enumName ?? ""))
  }
  if (value.type === "object") {
    if (value.objectName === undefined) {
      throw new Error(`registryTypesGenerate: object value without objectName in ${fromFile}`)
    }
    return refFor(fromFile, registryTypeName(value.objectName))
  }
  throw new Error(`registryTypesGenerate: unsupported map value ${JSON.stringify(value)} in ${fromFile}`)
}

// Maps every distinct schema `type.type`/`format` deliberately:
// - boolean -> boolean.
// - every number format (duration in milliseconds, integer, unsignedInteger,
//   size in bytes, float) -> number.
// - every string format (string, emailAddress, uri, secret, secretText,
//   ipAddress, ipNetwork, text, html, color) plus objectId (id string),
//   blobId and utcDateTime (ISO-8601 string) -> string.
// - enum -> RegistryEnum<Name> literal union.
// - object -> referenced Registry type (single interface or @type union).
// - objectList -> index-keyed JSON object on the wire ({"0": {...}}).
// - set -> JSON object of `true` flags on the wire ({"value": true}).
// - map -> JSON object keyed by keyClass.
function propertyTs(fromFile: string, prop: SchemaProperty): string {
  const t = prop.type
  let base: string
  if (t.type === "boolean") {
    base = "boolean"
  } else if (t.type === "number") {
    base = "number"
  } else if (t.type === "string" || t.type === "objectId" || t.type === "blobId" || t.type === "utcDateTime") {
    base = "string"
  } else if (t.type === "enum") {
    base = refFor(fromFile, registryEnumName(t.enumName ?? ""))
  } else if (t.type === "object") {
    if (t.objectName === undefined) {
      throw new Error(`registryTypesGenerate: object without objectName in ${fromFile}`)
    }
    base = refFor(fromFile, registryTypeName(t.objectName))
  } else if (t.type === "objectList") {
    if (t.objectName === undefined) {
      throw new Error(`registryTypesGenerate: objectList without objectName in ${fromFile}`)
    }
    base = `Record<string, ${refFor(fromFile, registryTypeName(t.objectName))}>`
  } else if (t.type === "set") {
    if (t.class === undefined) {
      throw new Error(`registryTypesGenerate: set without class in ${fromFile}`)
    }
    const key = keyClassTs(fromFile, t.class)
    base = key === "string" ? "Record<string, true>" : `Partial<Record<${key}, true>>`
  } else if (t.type === "map") {
    if (t.keyClass === undefined || t.valueClass === undefined) {
      throw new Error(`registryTypesGenerate: map without key/value class in ${fromFile}`)
    }
    const key = keyClassTs(fromFile, t.keyClass)
    const value = mapValueTs(fromFile, t.valueClass)
    base = key === "string" ? `Record<string, ${value}>` : `Partial<Record<${key}, ${value}>>`
  } else {
    throw new Error(`registryTypesGenerate: unsupported property type ${JSON.stringify(t)} in ${fromFile}`)
  }
  return t.nullable === true ? `${base} | null` : base
}

const header = `// Generated by scripts/registryTypesGenerate.ts from Stalwart schema ${sha256} (${source}). Do not edit.`

const outDir = argValue("--out") ?? join(repoRoot, "src", "registry", "generated")

type PendingFile = { name: string; content: string }
const pending: PendingFile[] = []

function importLines(fromFile: string): string {
  const names = [...(imports.get(fromFile) ?? [])].sort()
  return names.map((name) => `import type { ${name} } from "./${name}.js";`).join("\n")
}

// Entity + create-input interfaces for every x: fields entry.
for (const key of fieldsKeys) {
  const fields = schema.fields[key]
  if (fields === undefined) {
    continue
  }
  const typeName = registryTypeName(key)
  const createName = `${typeName}Create`
  const props = Object.keys(fields.properties).sort()
  const entityLines: string[] = []
  const createLines: string[] = []
  for (const propName of props) {
    const prop = fields.properties[propName]
    if (prop === undefined) {
      continue
    }
    const ts = propertyTs(typeName, prop)
    entityLines.push(`  /** ${jsdocEscape(prop.description)} */\n  ${propName}: ${ts};`)
    if (prop.update === "serverSet") {
      continue
    }
    const hasDefault = fields.defaults !== undefined && propName in fields.defaults
    const marker = hasDefault || prop.type.nullable === true ? "?" : ""
    const def =
      hasDefault && fields.defaults !== undefined ? `\n@default ${JSON.stringify(fields.defaults[propName])}` : ""
    // Escape after combining: default JSON can itself contain `*/`.
    const doc = jsdocEscape(`${prop.description}${def}`).replaceAll("\n", "\n   * ")
    createLines.push(`  /** ${doc} */\n  ${propName}${marker}: ${ts};`)
  }
  const head = importLines(typeName)
  pending.push({
    name: `${typeName}.ts`,
    content: `${header}\n${head === "" ? "" : `${head}\n\n`}/** Registry entity for schema ${key}. */\nexport interface ${typeName} {\n${entityLines.join("\n")}\n}\n`,
  })
  pending.push({
    name: `${createName}.ts`,
    content: `${header}\n${head === "" ? "" : `${head}\n\n`}/** Create input for schema ${key}. Omits serverSet properties; properties with a default or a nullable type are optional. */\nexport interface ${createName} {\n${createLines.join("\n")}\n}\n`,
  })
}

// Discriminated unions for every x: multiple schema. On the wire the variant
// `@type` and the variant schema fields combine into one flat object
// (serde internally-tagged `#[serde(tag = "@type")]`), e.g.
// `{"@type": "User", ...user fields}`. Variants without a schemaName carry
// only the discriminator.
function unionMembers(key: string, kind: "entity" | "create"): { text: string; refs: string[] } {
  const entry = schema.schemas[key]
  if (entry === undefined || entry.type !== "multiple") {
    throw new Error(`registryTypesGenerate: ${key} is not a multiple schema`)
  }
  const suffix = kind === "entity" ? "" : "Create"
  const members = entry.variants.map((variant) => {
    const tag = `{ "@type": ${JSON.stringify(variant.name)} }`
    if (variant.schemaName === undefined) {
      return tag
    }
    const member = `${registryTypeName(variant.schemaName)}${suffix}`
    refFor(registryTypeName(key) + suffix, member)
    return `(${tag} & ${member})`
  })
  return { text: members.join(" | "), refs: [] }
}

for (const key of schemasKeys) {
  const entry = schema.schemas[key]
  if (entry === undefined || entry.type !== "multiple") {
    continue
  }
  const typeName = registryTypeName(key)
  const createName = `${typeName}Create`
  const entity = unionMembers(key, "entity")
  const create = unionMembers(key, "create")
  const entityHead = importLines(typeName)
  const createHead = importLines(createName)
  const label = entry.variants.map((v) => v.label).join("; ")
  pending.push({
    name: `${typeName}.ts`,
    content: `${header}\n${entityHead === "" ? "" : `${entityHead}\n\n`}/** Registry union for schema ${key} (${jsdocEscape(label)}). */\nexport type ${typeName} = ${entity.text};\n`,
  })
  pending.push({
    name: `${createName}.ts`,
    content: `${header}\n${createHead === "" ? "" : `${createHead}\n\n`}/** Create input union for schema ${key}. */\nexport type ${createName} = ${create.text};\n`,
  })
}

// String-literal unions for every enum. The RegistryEnum prefix keeps enum
// names collision-free against Registry<Schema> entity names.
for (const name of enumNames) {
  const values = schema.enums[name] ?? []
  const union = [...values]
    .map((v) => v.name)
    .sort()
    .map((v) => JSON.stringify(v))
    .join(" | ")
  pending.push({
    name: `${registryEnumName(name)}.ts`,
    content: `${header}\n/** Registry enum ${name}. */\nexport type ${registryEnumName(name)} = ${union === "" ? "never" : union};\n`,
  })
}

// Metadata: object types, per-object details, views, maps, schema info.
const objectTypeUnion = objectNames.map((n) => JSON.stringify(n)).join(" | ")
pending.push({
  name: "RegistryObjectType.ts",
  content: `${header}\n/** Management method object names (x: prefix stripped). Singletons have no query method. */\nexport type RegistryObjectType = ${objectTypeUnion};\n`,
})

const objectTypeLines = objectNames.map((name) => {
  const obj = schema.objects[`x:${name}`]
  const kind = obj?.type === "singleton" ? ("singleton" as const) : ("object" as const)
  const methods = kind === "singleton" ? '["get", "set"]' : '["get", "set", "query"]'
  const description =
    obj?.type === "object" || obj?.type === "singleton" ? `/** ${jsdocEscape(obj.description)} */\n  ` : "  "
  const permissionPrefix =
    obj?.type === "object" || obj?.type === "singleton" ? JSON.stringify(obj.permissionPrefix) : '""'
  const schemaName = `x:${name}`
  return `  ${description}${JSON.stringify(name)}: { kind: ${JSON.stringify(kind)}, methods: ${methods}, permissionPrefix: ${permissionPrefix}, description: ${JSON.stringify((obj as { description?: string }).description ?? "")}, schemaName: ${JSON.stringify(schemaName)} },`
})
pending.push({
  name: "registryObjectTypes.ts",
  content: `${header}\n/** Per-object metadata for the 117 management method objects. Views live in registryViews.ts. */\nexport const registryObjectTypes = {\n${objectTypeLines.join("\n")}\n} as const;\n`,
})

const viewLines = viewNames.map((key) => {
  const obj = schema.objects[key]
  const viewOf = obj?.type === "view" ? obj.objectName.slice("x:".length) : ""
  return `  ${JSON.stringify(key.slice("x:".length))}: { kind: "view", viewOf: ${JSON.stringify(viewOf)}, objectName: ${JSON.stringify((obj as { objectName?: string }).objectName ?? "")} },`
})
pending.push({
  name: "registryViews.ts",
  content: `${header}\n/** Filtered views over a parent method object (e.g. Account/User over Account). */\nexport const registryViews = {\n${viewLines.join("\n")}\n} as const;\n`,
})

// RegistryObjectMap: entity type per method object. Every get response carries
// an `id` alongside the schema properties (singletons use id "singleton").
const mapLines = objectNames.map((name) => {
  const entry = schema.schemas[`x:${name}`]
  const base =
    entry?.type === "multiple" ? registryTypeName(`x:${name}`) : registryTypeName(entry?.schemaName ?? `x:${name}`)
  refFor("RegistryObjectMap", base)
  return `  ${JSON.stringify(name)}: ${base} & { id: string };`
})
const mapHead = importLines("RegistryObjectMap")
pending.push({
  name: "RegistryObjectMap.ts",
  content: `${header}\n${mapHead === "" ? "" : `${mapHead}\n\n`}/** Entity type per management method object, including the JMAP response id. */\nexport type RegistryObjectMap = {\n${mapLines.join("\n")}\n};\n`,
})

const createMapLines = objectNames.map((name) => {
  const entry = schema.schemas[`x:${name}`]
  const base =
    entry?.type === "multiple"
      ? `${registryTypeName(`x:${name}`)}Create`
      : `${registryTypeName(entry?.schemaName ?? `x:${name}`)}Create`
  refFor("RegistryObjectCreateMap", base)
  return `  ${JSON.stringify(name)}: ${base};`
})
const createMapHead = importLines("RegistryObjectCreateMap")
pending.push({
  name: "RegistryObjectCreateMap.ts",
  content: `${header}\n${createMapHead === "" ? "" : `${createMapHead}\n\n`}/** Create-input type per management method object. */\nexport type RegistryObjectCreateMap = {\n${createMapLines.join("\n")}\n};\n`,
})

pending.push({
  name: "registrySchemaInfo.ts",
  content: `${header}\n/** Provenance of the generated registry types. The schema file itself is AGPL and never copied into this repo. */\nexport const registrySchemaInfo = {\n  sha256: ${JSON.stringify(sha256)},\n  source: ${JSON.stringify(source)},\n  objectCount: ${objectNames.length},\n  viewCount: ${viewNames.length},\n} as const;\n`,
})

// Write, prune stale files, then format. Stale-file pruning keeps the output
// directory exactly equal to a fresh generation (idempotency check).
const { rm, mkdir, readdir } = await import("node:fs/promises")
await mkdir(outDir, { recursive: true })
const wanted = new Set(pending.map((f) => f.name))
for (const existing of await readdir(outDir)) {
  if (existing.endsWith(".ts") && !wanted.has(existing)) {
    await rm(join(outDir, existing))
  }
}
await Promise.all(pending.map((f) => Bun.write(join(outDir, f.name), f.content)))

const format = Bun.spawnSync(["bunx", "biome", "format", "--write", outDir], {
  stdout: "inherit",
  stderr: "inherit",
})
if (format.exitCode !== 0) {
  throw new Error("registryTypesGenerate: biome format failed")
}
console.log(
  `registryTypesGenerate: wrote ${pending.length} files to ${outDir} (schema ${sha256.slice(0, 12)} from ${source})`,
)
