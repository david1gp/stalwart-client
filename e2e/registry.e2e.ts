import { afterAll, beforeAll, describe, expect, test } from "bun:test"
import type { StalwartClientConfig } from "../src/client/stalwartClientConfigSchema.js"
import { registryGet } from "../src/registry/registryGet.js"
import { registryQuery } from "../src/registry/registryQuery.js"
import { registrySet } from "../src/registry/registrySet.js"
import { e2eRunId } from "./e2eRunId.js"
import { stalwartE2eSetup } from "./e2eSetup.js"

let config: StalwartClientConfig
const runId = e2eRunId()
const domainName = `e2e-${runId}.test`
const created: { domainId?: string } = {}

beforeAll(async () => {
  config = await stalwartE2eSetup()
})

afterAll(async () => {
  // Strict reverse-order, best-effort teardown of run-scoped objects only.
  if (created.domainId === undefined) return
  const signatures = await registryQuery({
    config,
    objectType: "DkimSignature",
    filter: { domainId: created.domainId },
  })
  if (signatures.success && signatures.data.ids.length > 0) {
    const removed = await registrySet({ config, objectType: "DkimSignature", destroy: signatures.data.ids.map(String) })
    if (!removed.success) console.warn(`teardown: DKIM signatures not removed: ${removed.errorMessage}`)
  }
  const removed = await registrySet({ config, objectType: "Domain", destroy: [created.domainId] })
  if (!removed.success) console.warn(`teardown: domain ${domainName} not removed: ${removed.errorMessage}`)
})

describe("e2e registry: generic get/set/query against a run-scoped domain", () => {
  test(
    "registrySet creates a throwaway domain",
    async () => {
      const r = await registrySet({ config, objectType: "Domain", create: { d1: { name: domainName } } })
      if (!r.success) throw new Error(`create failed: ${r.errorMessage} ${r.errorData ?? ""}`)
      created.domainId = r.data.created?.d1?.id
      expect(created.domainId).toBeString()
    },
    { timeout: 30_000 },
  )

  test(
    "registryQuery finds it by name and registryGet reads it back",
    async () => {
      const q = await registryQuery({ config, objectType: "Domain", filter: { name: domainName } })
      if (!q.success) throw new Error(q.errorMessage)
      expect(q.data.ids.map(String)).toEqual([created.domainId as string])
      const g = await registryGet({ config, objectType: "Domain", ids: [created.domainId as string] })
      if (!g.success) throw new Error(g.errorMessage)
      expect(g.data.list[0]?.name).toBe(domainName)
      expect(g.data.list[0]?.enable).toBe(true)
    },
    { timeout: 30_000 },
  )

  test(
    "registrySet updates a property and the change is visible",
    async () => {
      const u = await registrySet({
        config,
        objectType: "Domain",
        update: { [created.domainId as string]: { description: `e2e run ${runId}` } },
      })
      if (!u.success) throw new Error(u.errorMessage)
      const g = await registryGet({
        config,
        objectType: "Domain",
        ids: [created.domainId as string],
        properties: ["description"],
      })
      if (!g.success) throw new Error(g.errorMessage)
      expect(g.data.list[0]?.description).toBe(`e2e run ${runId}`)
    },
    { timeout: 30_000 },
  )

  test(
    "registryGet reads a singleton (Imap) without explicit ids",
    async () => {
      const g = await registryGet({ config, objectType: "Imap", properties: ["idleTimeout"] })
      if (!g.success) throw new Error(g.errorMessage)
      expect(g.data.list).toHaveLength(1)
      expect(g.data.list[0]?.id).toBe("singleton")
      expect(g.data.list[0]?.idleTimeout).toBeNumber()
    },
    { timeout: 30_000 },
  )
})
