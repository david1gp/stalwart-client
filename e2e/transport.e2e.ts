import { afterAll, beforeAll, describe, expect, test } from "bun:test"
import { stalwartClientConfig } from "../src/client/stalwartClientConfig.js"
import type { StalwartClientConfig } from "../src/client/stalwartClientConfigSchema.js"
import { stalwartMethodCall } from "../src/client/stalwartMethodCall.js"
import { eventSourceListen } from "../src/eventSource/eventSourceListen.js"
import type { EventSourceSubscription } from "../src/eventSource/eventSourceSubscription.js"
import { healthLive } from "../src/health/healthLive.js"
import { healthReady } from "../src/health/healthReady.js"
import { metricsPrometheus } from "../src/metrics/metricsPrometheus.js"
import { webSocketConnect } from "../src/webSocket/webSocketConnect.js"
import type { JmapWebSocketClient } from "../src/webSocket/jmapWebSocketClient.js"
import { stalwartE2eSetup } from "./e2eSetup.js"
import { e2eRunId } from "./e2eRunId.js"

let adminConfig: StalwartClientConfig
let userConfig: StalwartClientConfig
let userAccountId: string
let runId: string
const mailboxIds: string[] = []
let sseSubscription: EventSourceSubscription | undefined
let wsClient: JmapWebSocketClient | undefined

/** Same overlay parse as e2eSetup: the local harness file wins over process env. */
async function transportOverlayEnv(): Promise<Record<string, string | undefined>> {
  const target = process.env.STALWART_E2E_TARGET ?? "live"
  if (target !== "local") return process.env
  const localFile = Bun.file(new URL("../ops/local-stalwart/.env.local", import.meta.url))
  const overlay: Record<string, string> = {}
  for (const line of (await localFile.text()).split("\n")) {
    const trimmed = line.trim()
    if (trimmed === "" || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq < 0) continue
    overlay[trimmed.slice(0, eq)] = trimmed.slice(eq + 1)
  }
  return { ...process.env, ...overlay }
}

async function mailboxCreate(name: string): Promise<string> {
  const created = await stalwartMethodCall<{
    created: Record<string, { id: string }>
  }>({
    config: userConfig,
    methodName: "Mailbox/set",
    arguments: { accountId: userAccountId, create: { m1: { name } } },
  })
  if (!created.success) throw new Error(`Mailbox/set create failed: ${created.errorMessage}`)
  const id = created.data.created["m1"]?.id
  if (typeof id !== "string") throw new Error("Mailbox/set create returned no id")
  mailboxIds.push(id)
  return id
}

async function collectFirstState(
  subscription: EventSourceSubscription,
  timeoutMs: number,
): Promise<{ changed: Record<string, Record<string, string>> } | undefined> {
  const timeout = new Promise<undefined>((resolve) => setTimeout(() => resolve(undefined), timeoutMs))
  const first = (async () => {
    for await (const change of subscription.stateChanges) return change
    return undefined
  })()
  return Promise.race([first, timeout])
}

beforeAll(async () => {
  adminConfig = await stalwartE2eSetup()
  runId = e2eRunId()
  const env = await transportOverlayEnv()
  const username = env.STALWART_USER_A
  const password = env.STALWART_USER_A_PASSWORD
  userAccountId = env.STALWART_USER_A_ACCOUNT_ID ?? ""
  if (username === undefined || password === undefined || userAccountId === "") {
    throw new Error("transport e2e needs STALWART_USER_A* in the env overlay")
  }
  const configured = stalwartClientConfig({ baseUrl: adminConfig.baseUrl, username, password })
  if (!configured.success) throw new Error(`user config invalid: ${configured.errorMessage}`)
  userConfig = configured.data
}, 30_000)

afterAll(async () => {
  // Strict reverse order: close the socket, close the SSE subscription,
  // then destroy created mailboxes newest-first. Never throw in cleanup.
  try {
    wsClient?.close()
  } catch (error) {
    console.info(`e2e cleanup: ws close failed: ${String(error)}`)
  }
  try {
    sseSubscription?.close()
  } catch (error) {
    console.info(`e2e cleanup: sse close failed: ${String(error)}`)
  }
  for (const id of [...mailboxIds].reverse()) {
    try {
      const destroyed = await stalwartMethodCall<{ destroyed: string[] }>({
        config: userConfig,
        methodName: "Mailbox/set",
        arguments: { accountId: userAccountId, destroy: [id] },
      })
      if (!destroyed.success) console.info(`e2e cleanup: destroy ${id} failed: ${destroyed.errorMessage}`)
    } catch (error) {
      console.info(`e2e cleanup: destroy ${id} threw: ${String(error)}`)
    }
  }
})

describe("e2e transport: health + metrics", () => {
  test(
    "live probe is ok",
    async () => {
      const live = await healthLive({ config: adminConfig })
      if (!live.success) throw new Error(`healthLive failed: ${live.errorMessage}`)
      expect(live.data).toEqual({ ok: true, status: 200 })
    },
    { timeout: 30_000 },
  )

  test(
    "ready probe is ok on an initialized store",
    async () => {
      const ready = await healthReady({ config: adminConfig })
      if (!ready.success) throw new Error(`healthReady failed: ${ready.errorMessage}`)
      expect(ready.data).toEqual({ ok: true, status: 200 })
    },
    { timeout: 30_000 },
  )

  test(
    "metrics prometheus pins the local behaviour (no collector configured)",
    async () => {
      const metrics = await metricsPrometheus({ config: adminConfig })
      if (metrics.success) {
        expect(metrics.data.body.length).toBeGreaterThan(0)
        console.info(`E2E metrics body length=${metrics.data.body.length}`)
        return
      }
      const detail = `${metrics.errorMessage} ${metrics.errorData ?? ""}`
      expect(detail).toContain("404")
    },
    { timeout: 30_000 },
  )
})

describe("e2e transport: eventsource", () => {
  test(
    "a mailbox change arrives as a StateChange within 10 s",
    async () => {
      const subscription = await eventSourceListen({
        config: userConfig,
        types: "Mailbox",
        closeafter: "state",
      })
      if (!subscription.success) throw new Error(`eventSourceListen failed: ${subscription.errorMessage}`)
      sseSubscription = subscription.data

      await mailboxCreate(`e2e-${runId}-sse`)
      const change = await collectFirstState(subscription.data, 10_000)
      expect(change).toBeDefined()
      expect(change?.changed[userAccountId]?.["Mailbox"]).toEqual(expect.any(String))
    },
    { timeout: 30_000 },
  )
})

describe("e2e transport: websocket", () => {
  test(
    "Core/echo round-trips, then a mailbox change arrives as a push",
    async () => {
      const connected = await webSocketConnect({ config: userConfig })
      if (!connected.success) throw new Error(`webSocketConnect failed: ${connected.errorMessage}`)
      wsClient = connected.data

      const echoed = await wsClient.send({ methodName: "Core/echo", arguments: { e2e: runId } })
      if (!echoed.success) throw new Error(`ws Core/echo failed: ${echoed.errorMessage}`)
      expect(echoed.data.methodResponses).toEqual([["Core/echo", { e2e: runId }, "c1"]])

      const enabled = wsClient.pushEnable(["Mailbox"])
      if (!enabled.success) throw new Error(`pushEnable failed: ${enabled.errorMessage}`)

      const push = new Promise<Record<string, Record<string, string>> | undefined>((resolve) => {
        const timeoutId = setTimeout(() => resolve(undefined), 10_000)
        const unsubscribe = wsClient?.onStateChange((change) => {
          clearTimeout(timeoutId)
          unsubscribe()
          resolve(change.changed)
        })
      })
      await mailboxCreate(`e2e-${runId}-ws`)
      const changed = await push
      expect(changed?.[userAccountId]?.["Mailbox"]).toEqual(expect.any(String))

      const disabled = wsClient.pushDisable()
      if (!disabled.success) throw new Error(`pushDisable failed: ${disabled.errorMessage}`)
    },
    { timeout: 30_000 },
  )
})
