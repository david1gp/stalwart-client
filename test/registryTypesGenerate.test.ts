import { describe, expect, test } from "bun:test"
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises"
import { join } from "node:path"
import { registryObjectTypes } from "../src/registry/generated/registryObjectTypes.js"
import { registrySchemaInfo } from "../src/registry/generated/registrySchemaInfo.js"
import { registryViews } from "../src/registry/generated/registryViews.js"

const repoRoot = join(import.meta.dir, "..")
const generatedDir = join(repoRoot, "src", "registry", "generated")

async function generatedSnapshot(dir: string): Promise<Map<string, string>> {
  const files = (await readdir(dir)).filter((f) => f.endsWith(".ts")).sort()
  const snapshot = new Map<string, string>()
  for (const file of files) {
    snapshot.set(file, await readFile(join(dir, file), "utf8"))
  }
  return snapshot
}

describe("registry types generation is idempotent, not stale", () => {
  test("generating into a temp dir equals the committed output", async () => {
    // Inside the repo: biome refuses to format files outside the project root.
    const tempDir = await mkdtemp(join(repoRoot, ".tmp-registry-generated-"))
    try {
      const proc = Bun.spawn(["bun", "scripts/registryTypesGenerate.ts", "--out", tempDir], {
        cwd: repoRoot,
        stdout: "pipe",
        stderr: "pipe",
      })
      const [stdout, stderr, exitCode] = await Promise.all([
        new Response(proc.stdout).text(),
        new Response(proc.stderr).text(),
        proc.exited,
      ])
      if (exitCode !== 0) throw new Error(`registryTypesGenerate failed:\n${stdout}\n${stderr}`)
      const [committed, fresh] = await Promise.all([generatedSnapshot(generatedDir), generatedSnapshot(tempDir)])
      expect([...fresh.keys()]).toEqual([...committed.keys()])
      for (const [file, content] of fresh) {
        const expected = committed.get(file)
        expect(expected, file).toBeDefined()
        if (expected !== undefined) {
          expect(content, file).toBe(expected)
        }
      }
    } finally {
      await rm(tempDir, { recursive: true, force: true })
    }
  }, 120000)
})

describe("registry types cover all 117 management objects", () => {
  test("registryObjectTypes has exactly 117 method objects", () => {
    expect(Object.keys(registryObjectTypes)).toHaveLength(117)
  })

  test("every object entry names a valid kind and method set", () => {
    for (const [name, entry] of Object.entries(registryObjectTypes)) {
      expect(entry.kind === "object" || entry.kind === "singleton").toBe(true)
      if (entry.kind === "singleton") {
        expect(entry.methods).toEqual(["get", "set"])
      } else {
        expect(entry.methods).toEqual(["get", "set", "query"])
      }
      expect(entry.permissionPrefix.length).toBeGreaterThan(0)
      expect(`x:${name}`).toBe(entry.schemaName as string)
    }
  })

  test("views point at a known method object, never collide with one", () => {
    const objects = new Set(Object.keys(registryObjectTypes))
    expect(Object.keys(registryViews).length).toBeGreaterThan(0)
    for (const [view, entry] of Object.entries(registryViews)) {
      expect(objects.has(view)).toBe(false)
      expect(objects.has(entry.viewOf)).toBe(true)
    }
  })

  test("schema info records provenance without vendoring the schema", () => {
    expect(registrySchemaInfo.sha256).toMatch(/^[0-9a-f]{64}$/)
    expect(registrySchemaInfo.source.length).toBeGreaterThan(0)
    expect(registrySchemaInfo.objectCount).toBe(117)
  })
})

describe("registry generated files keep one export per file", () => {
  test("no generated file declares two top-level exports and no name collides", async () => {
    const files = (await readdir(generatedDir)).filter((f) => f.endsWith(".ts")).sort()
    expect(files.length).toBeGreaterThan(0)
    const exportNames = new Set<string>()
    for (const file of files) {
      const content = await readFile(join(generatedDir, file), "utf8")
      const declarations = content.match(/^export (interface|type|const) (\w+)/gm) ?? []
      expect(declarations, file).toHaveLength(1)
      const name = declarations[0]?.split(/\s+/).at(-1) ?? ""
      expect(name, file).toBe(file.replace(/\.ts$/, ""))
      expect(exportNames.has(name), file).toBe(false)
      exportNames.add(name)
    }
  })
})
