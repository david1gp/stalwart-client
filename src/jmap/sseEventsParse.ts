import type { SseEvent } from "./sseEvent.js"

/**
 * Parse a `text/event-stream` body into an async iterable of events.
 * Handles `event:` / `data:` / `id:` fields, multi-line data, comments (`:`),
 * and `\r\n` / `\n` line endings. Used by JMAP EventSource and the
 * `/api/live/*` telemetry streams.
 */
export async function* sseEventsParse(stream: ReadableStream<Uint8Array>): AsyncIterable<SseEvent> {
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let buffer = ""
  let event = "message"
  let dataLines: string[] = []
  let id: string | undefined

  function* flush(): Generator<SseEvent> {
    if (dataLines.length === 0 && id === undefined && event === "message") return
    const data = dataLines.join("\n")
    const out: SseEvent = { event, data }
    if (id !== undefined) out.id = id
    yield out
    event = "message"
    dataLines = []
    id = undefined
  }

  function sseLineApply(line: string): void {
    if (line.startsWith(":")) return
    const colonIndex = line.indexOf(":")
    const field = colonIndex < 0 ? line : line.slice(0, colonIndex)
    const rawValue = colonIndex < 0 ? "" : line.slice(colonIndex + 1)
    const value = rawValue.startsWith(" ") ? rawValue.slice(1) : rawValue
    if (field === "event") event = value
    else if (field === "data") dataLines.push(value)
    else if (field === "id") id = value
  }

  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      let newlineIndex: number
      while ((newlineIndex = buffer.indexOf("\n")) >= 0) {
        const rawLine = buffer.slice(0, newlineIndex)
        buffer = buffer.slice(newlineIndex + 1)
        const line = rawLine.endsWith("\r") ? rawLine.slice(0, -1) : rawLine
        if (line === "") {
          yield* flush()
          continue
        }
        sseLineApply(line)
      }
    }
    buffer += decoder.decode()
    if (buffer !== "") {
      sseLineApply(buffer.endsWith("\r") ? buffer.slice(0, -1) : buffer)
    }
    yield* flush()
  } finally {
    reader.releaseLock()
  }
}
