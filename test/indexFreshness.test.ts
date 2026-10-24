import { describe, expect, test } from "bun:test"
import { readFile } from "node:fs/promises"
import { join } from "node:path"

const repoRoot = join(import.meta.dir, "..")

describe("index freshness", () => {
  test("bun run index:generate produces no diff", async () => {
    const before = await readFile(join(repoRoot, "src/index.ts"), "utf8")
    const proc = Bun.spawn(["bun", "scripts/indexGenerate.ts"], {
      cwd: repoRoot,
      stdout: "pipe",
      stderr: "pipe",
    })
    const [stdout, stderr, exitCode] = await Promise.all([
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
      proc.exited,
    ])
    if (exitCode !== 0) throw new Error(`index:generate failed: ${stdout}\n${stderr}`)
    const after = await readFile(join(repoRoot, "src/index.ts"), "utf8")
    expect(after).toBe(before)
  })
})
