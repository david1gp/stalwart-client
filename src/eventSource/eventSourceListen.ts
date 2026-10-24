import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { jmapHttpRequest } from "../jmap/jmapHttpRequest.js"
import { jmapSessionGet } from "../jmap/jmapSessionGet.js"
import { jmapUrlTemplateFill } from "../jmap/jmapUrlTemplateFill.js"
import { sseEventsParse } from "../jmap/sseEventsParse.js"
import type { EventSourceSubscription } from "./eventSourceSubscription.js"
import { type EventSourceListenOptions, eventSourceListenOptionsSchema } from "./eventSourceListenOptionsSchema.js"
import { type JmapStateChange, jmapStateChangeSchema } from "./jmapStateChangeSchema.js"

/**
 * `GET /jmap/eventsource` (RFC 8620 §7 SSE): subscribe to `StateChange` pushes.
 *
 * The URL comes from the session `eventSourceUrl` template
 * (`types`/`closeafter`/`ping`), joined onto the configured `baseUrl` origin
 * like `jmapApiUrlResolve` — the session host (e.g. `mail.example.test`) is
 * not necessarily reachable. Only `state` events are yielded (`ping` and
 * `calendarAlert` frames are skipped); the subscription ends when the server
 * closes the stream, the caller breaks out, `close()` runs, or `signal`
 * aborts.
 */
export async function eventSourceListen(options: EventSourceListenOptions): PromiseResult<EventSourceSubscription> {
  const op = "eventSourceListen"
  const parsed = a.safeParse(eventSourceListenOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, signal } = parsed.output
  const types = parsed.output.types ?? "*"
  const closeafter = parsed.output.closeafter ?? "no"
  const ping = parsed.output.ping ?? 0

  const session = await jmapSessionGet({ config })
  if (!session.success) return session

  let url: string
  try {
    const filled = jmapUrlTemplateFill(session.data.eventSourceUrl, {
      types,
      closeafter,
      ping: String(ping),
    })
    const origin = new URL(config.baseUrl).origin
    const target = new URL(filled, origin)
    url = `${origin}${target.pathname}${target.search}`
  } catch (error) {
    return createResultError(op, "Building the EventSource URL failed", String(error))
  }

  // responseType "stream" sets Accept: text/event-stream; default auth attaches
  // the Authorization header like every other JMAP call.
  const stream = await jmapHttpRequest({
    config,
    method: "GET",
    path: url,
    responseType: "stream",
  })
  if (!stream.success) return stream

  const body = stream.data
  let closed = false
  const close = () => {
    closed = true
    body.cancel().catch(() => {})
  }
  if (signal !== undefined) {
    if (signal.aborted) close()
    else signal.addEventListener("abort", close, { once: true })
  }

  async function* stateChanges(): AsyncIterable<JmapStateChange> {
    try {
      for await (const event of sseEventsParse(body)) {
        if (closed || signal?.aborted) return
        if (event.event !== "state") continue
        let data: unknown
        try {
          data = JSON.parse(event.data)
        } catch {
          continue
        }
        const change = a.safeParse(jmapStateChangeSchema, data)
        if (!change.success) continue
        yield change.output
      }
    } finally {
      signal?.removeEventListener("abort", close)
      if (!closed) {
        closed = true
        await body.cancel().catch(() => {})
      }
    }
  }

  return createResult({ stateChanges: stateChanges(), close })
}
