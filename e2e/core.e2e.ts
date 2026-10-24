import { afterAll, beforeAll, describe, expect, test } from "bun:test"
import { coreEcho } from "../dist/jmap/coreEcho.js"
import { jmapSessionGet } from "../dist/jmap/jmapSessionGet.js"
import type { StalwartClientConfig } from "../dist/client/stalwartClientConfigSchema.js"
import { stalwartE2eSetup } from "./e2eSetup.js"

let config: StalwartClientConfig

beforeAll(async () => {
  config = await stalwartE2eSetup()
})

afterAll(() => {})

describe("e2e core: session + echo", () => {
  test(
    "session get returns apiUrl and primary accounts",
    async () => {
      const session = await jmapSessionGet({ config })
      if (!session.success) throw new Error(`jmapSessionGet failed: ${session.errorMessage}`)
      expect(session.data.apiUrl.length).toBeGreaterThan(0)
      expect(Object.keys(session.data.primaryAccounts).length).toBeGreaterThan(0)
      console.info(`E2E session user=${session.data.username} apiUrl=${session.data.apiUrl}`)
    },
    { timeout: 30_000 },
  )

  test(
    "Core/echo returns args verbatim",
    async () => {
      const echoed = await coreEcho({ config, args: { hello: true, e2e: 1 } })
      if (!echoed.success) throw new Error(`coreEcho failed: ${echoed.errorMessage}`)
      expect(echoed.data).toEqual({ hello: true, e2e: 1 })
    },
    { timeout: 30_000 },
  )
})
