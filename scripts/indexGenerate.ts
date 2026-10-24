/**
 * `scripts/indexGenerate.ts` — regenerate `src/index.ts`.
 *
 * Scans src TS files (excluding src/cli, cli folders, src/cli.ts,
 * src/index.ts) and emits one export line per exported symbol,
 * `export type { X } from "./path.js"` line per exported symbol, grouped by
 * directory and sorted deterministically.
 *
 * Parallel agents MUST run `bun run index:generate` after adding files —
 * never edit `src/index.ts` by hand.
 */
import { readdir } from "node:fs/promises"
import { join, relative } from "node:path"

const repoRoot = join(import.meta.dir, "..")
const srcDir = join(repoRoot, "src")
const outFile = join(srcDir, "index.ts")

const excludedDirs = new Set(["cli"])
const excludedFiles = new Set(["cli.ts", "index.ts"])

type ExportEntry = {
  name: string
  isType: boolean
  path: string
}

async function collectFiles(dir: string, out: string[]): Promise<void> {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (dir === srcDir && excludedDirs.has(entry.name)) continue
      if (entry.name === "cli") continue
      await collectFiles(full, out)
      continue
    }
    if (!entry.name.endsWith(".ts")) continue
    if (dir === srcDir && excludedFiles.has(entry.name)) continue
    out.push(full)
  }
}

const valueExportPattern = /^export (?:async )?function\*? ([A-Za-z0-9_]+)|^export const ([A-Za-z0-9_]+)/gm
const typeExportPattern = /^export (?:type|interface) ([A-Za-z0-9_]+)/gm

async function generate(): Promise<void> {
  const files: string[] = []
  await collectFiles(srcDir, files)
  files.sort()

  const { readFile, writeFile } = await import("node:fs/promises")
  const byDir = new Map<string, ExportEntry[]>()
  for (const file of files) {
    const source = await readFile(file, "utf8")
    const rel = `./${relative(srcDir, file).replace(/\.ts$/, ".js")}`
    const dir = relative(srcDir, join(file, "..")) || "."
    const entries = byDir.get(dir) ?? []
    const seen = new Set(entries.map((e) => e.name))
    for (const match of source.matchAll(valueExportPattern)) {
      const name = match[1] ?? match[2]
      if (name !== undefined && !seen.has(name)) {
        seen.add(name)
        entries.push({ name, isType: false, path: rel })
      }
    }
    for (const match of source.matchAll(typeExportPattern)) {
      const name = match[1]
      if (name !== undefined && !seen.has(name)) {
        seen.add(name)
        entries.push({ name, isType: true, path: rel })
      }
    }
    if (entries.length > 0) byDir.set(dir, entries)
  }

  const lines: string[] = []
  for (const [dir, entries] of [...byDir.entries()].sort(([a], [b]) => (a < b ? -1 : 1))) {
    if (dir !== "client" && dir !== "jmap") lines.push(`\n// ${dir}`)
    entries.sort((a, b) => (a.name < b.name ? -1 : 1))
    for (const entry of entries) {
      lines.push(
        entry.isType
          ? `export type { ${entry.name} } from "${entry.path}"`
          : `export { ${entry.name} } from "${entry.path}"`,
      )
    }
  }
  await writeFile(outFile, `${lines.join("\n")}\n`)
  console.log(`index:generate wrote ${outFile} (${lines.length} lines)`)
}

await generate()
