import { afterEach, describe, expect, test } from "bun:test"
import { jmapDownload, jmapUpload } from "../src/index.js"
import { jmapClientConfig } from "../src/jmap/jmapClientConfig.js"
import { jmapUrlTemplateFill } from "../src/jmap/jmapUrlTemplateFill.js"
import { sseEventsCollect, sseEventsParse } from "../src/index.js"
import { fetchMockCreate, fetchMockJson } from "./fetchMock.js"
import { jmapTestSessionCreate } from "./jmapTestSession.js"

const config = jmapClientConfig({ baseUrl: "https://mail.example.com", token: "API_x" })
if (!config.success) throw new Error("fixture config invalid")

function sseStreamCreate(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  let index = 0
  return new ReadableStream<Uint8Array>({
    pull(controller) {
      if (index >= chunks.length) {
        controller.close()
        return
      }
      const chunk = chunks[index]
      index++
      if (chunk !== undefined) controller.enqueue(encoder.encode(chunk))
    },
  })
}

describe("sseEventsParse frames", () => {
  test("parses event/data/id across chunk boundaries", async () => {
    const stream = sseStreamCreate(['event: state\ndata: {"a":', "1}\nid: 42\n\n: comment\n\n"])
    const events = []
    for await (const event of sseEventsParse(stream)) events.push(event)
    expect(events).toEqual([{ event: "state", data: '{"a":1}', id: "42" }])
  })

  test("defaults to message event, joins multiline data", async () => {
    const stream = sseStreamCreate(["data: line1\ndata: line2\n\n"])
    const events = []
    for await (const event of sseEventsParse(stream)) events.push(event)
    expect(events).toEqual([{ event: "message", data: "line1\nline2" }])
  })

  test("handles CRLF line endings", async () => {
    const stream = sseStreamCreate(["event: ping\r\ndata: {}\r\n\r\n"])
    const r = await sseEventsCollect(stream)
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual([{ event: "ping", data: "{}" }])
  })
})

describe("jmapUpload fills the uploadUrl template", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("POSTs bytes and returns blob descriptor", async () => {
    mock = fetchMockCreate((request) => {
      const url = new URL(request.url)
      if (url.pathname === "/jmap/session") return fetchMockJson(jmapTestSessionCreate())
      if (url.pathname !== "/jmap/upload/a1/") throw new Error(`unexpected path ${url.pathname}`)
      return fetchMockJson({ accountId: "a1", blobId: "G123", type: "message/rfc822", size: 3 })
    })
    const r = await jmapUpload({
      config: config.data,
      accountId: "a1",
      data: new Uint8Array([1, 2, 3]),
      contentType: "message/rfc822",
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual({ accountId: "a1", blobId: "G123", type: "message/rfc822", size: 3 })
  })
})

describe("jmapDownload fills the downloadUrl template", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("GETs encoded name with accept param and returns bytes", async () => {
    const seen: string[] = []
    mock = fetchMockCreate((request) => {
      const url = new URL(request.url)
      if (url.pathname === "/jmap/session") return fetchMockJson(jmapTestSessionCreate())
      seen.push(`${url.pathname}${url.search}`)
      return new Response(new Uint8Array([9, 9]), { status: 200 })
    })
    const r = await jmapDownload({
      config: config.data,
      accountId: "a1",
      blobId: "G123",
      name: "hello world.eml",
    })
    expect(r.success).toBe(true)
    if (r.success) expect([...r.data]).toEqual([9, 9])
    expect(seen).toEqual(["/jmap/download/a1/G123/hello%20world.eml?accept=application%2Foctet-stream"])
  })
})

describe("jmapUrlTemplateFill expands RFC 8620 session URL templates", () => {
  test("replaces single-brace variables with percent-encoded values (Stalwart's real template syntax)", () => {
    expect(
      jmapUrlTemplateFill("https://mail.example.test/jmap/download/{accountId}/{blobId}/{name}?accept={type}", {
        accountId: "b",
        blobId: "G1",
        name: "a b/c.eml",
        type: "message/rfc822",
      }),
    ).toBe("https://mail.example.test/jmap/download/b/G1/a%20b%2Fc.eml?accept=message%2Frfc822")
  })

  test("leaves unknown variables untouched", () => {
    expect(jmapUrlTemplateFill("/x/{known}/{unknown}", { known: "1" })).toBe("/x/1/{unknown}")
  })
})
