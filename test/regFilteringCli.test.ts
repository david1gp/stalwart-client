import { afterEach, describe, expect, test } from "bun:test"
import { buildApplication, run, type CommandContext, type RouteMap } from "@stricli/core"
import { lookupCommands } from "../src/registry/lookups/cli/lookupCommands.js"
import { reportSettingsCommands } from "../src/registry/reportSettings/cli/reportSettingsCommands.js"
import { sieveCommands } from "../src/registry/sieve/cli/sieveCommands.js"
import { spamCommands } from "../src/registry/spam/cli/spamCommands.js"
import { fetchMockCreate, fetchMockJson } from "./fetchMock.js"
import { jmapTestSessionCreate } from "./jmapTestSession.js"

type RouteEntries = { name: { original: string }; target: { getAllEntries?: () => RouteEntries[] } }[]

function routePaths(map: RouteMap<CommandContext>, prefix: string[] = []): string[] {
  const entries = map.getAllEntries() as unknown as RouteEntries
  return entries.flatMap((entry) => {
    const path = [...prefix, entry.name.original]
    if (entry.target.getAllEntries === undefined) return [path.join(" ")]
    return routePaths(entry.target as unknown as RouteMap<CommandContext>, path)
  })
}

function mockMethodResponse(name: string, args: Record<string, unknown>) {
  const sent: { methodCalls: [string, Record<string, unknown>, string][] }[] = []
  const mock = fetchMockCreate((request) => {
    if (new URL(request.url).pathname === "/jmap/session") return fetchMockJson(jmapTestSessionCreate())
    sent.push(JSON.parse(String(request.body)) as { methodCalls: [string, Record<string, unknown>, string][] })
    return fetchMockJson({ methodResponses: [[name, args, "c1"]], sessionState: "1" })
  })
  return { mock, sent }
}

async function runCommand(
  map: RouteMap<CommandContext>,
  inputs: string[],
  name: string,
  args: Record<string, unknown>,
): Promise<{ stdout: string; sent: { methodCalls: [string, Record<string, unknown>, string][] }[] }> {
  const m = mockMethodResponse(name, args)
  let stdout = ""
  const app = buildApplication(map, { name: "reg-filtering-test-cli", versionInfo: { currentVersion: "0.0.0-test" } })
  try {
    await run(app, inputs, {
      process: {
        stdout: { write: (text: string) => (stdout += text) },
        stderr: { write: () => {} },
      },
    } as never)
  } finally {
    m.mock.restore()
  }
  return { stdout, sent: m.sent }
}

const FLAGS = ["--baseUrl", "https://mail.example.com", "--token", "API_x", "--accountId", "a1"]

describe("regFiltering CLI smoke tests", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("spam routes expose every filtering op", () => {
    expect(routePaths(spamCommands)).toEqual([
      "classifier get",
      "classifier set",
      "dnsbl-server get",
      "dnsbl-server query",
      "dnsbl-server set",
      "dnsbl-settings get",
      "dnsbl-settings set",
      "file-extension get",
      "file-extension query",
      "file-extension set",
      "llm get",
      "llm set",
      "pyzor get",
      "pyzor set",
      "rule get",
      "rule query",
      "rule set",
      "settings get",
      "settings set",
      "tag get",
      "tag query",
      "tag set",
      "training-sample get",
      "training-sample query",
      "training-sample set",
      "blocked-domain query",
      "trap query",
      "trusted-domain query",
      "url-redirector query",
    ])
  })

  test("sieve routes expose every sieve op", () => {
    expect(routePaths(sieveCommands)).toEqual([
      "system-interpreter get",
      "system-interpreter set",
      "system-script get",
      "system-script query",
      "system-script set",
      "system-script create",
      "user-interpreter get",
      "user-interpreter set",
      "user-script get",
      "user-script query",
      "user-script set",
    ])
  })

  test("lookup routes expose every lookup op", () => {
    expect(routePaths(lookupCommands)).toEqual([
      "asn get",
      "asn set",
      "memory-key get",
      "memory-key query",
      "memory-key set",
      "memory-key-value get",
      "memory-key-value query",
      "memory-key-value set",
      "store-lookup get",
      "store-lookup query",
      "store-lookup set",
      "http-lookup get",
      "http-lookup query",
      "http-lookup set",
    ])
  })

  test("report-settings routes expose every report op", () => {
    expect(routePaths(reportSettingsCommands)).toEqual([
      "sender-auth get",
      "sender-auth set",
      "settings get",
      "settings set",
      "dkim get",
      "dkim set",
      "dmarc get",
      "dmarc set",
      "dsn get",
      "dsn set",
      "spf get",
      "spf set",
      "tls get",
      "tls set",
    ])
  })

  test("spam rule query runs through the route map", async () => {
    const { stdout, sent } = await runCommand(
      spamCommands,
      ["rule", "query", ...FLAGS, "--filterJson", '{"name":"STWT_X"}', "--limit", "5"],
      "x:SpamRule/query",
      { ids: ["r1"], queryState: "n", position: 0 },
    )
    expect(sent[0]?.methodCalls[0]?.[0]).toBe("x:SpamRule/query")
    expect(JSON.parse(stdout).ids).toEqual(["r1"])
  })

  test("spam trap view runs through the route map with forced namespace", async () => {
    const { stdout, sent } = await runCommand(spamCommands, ["trap", "query", ...FLAGS], "x:MemoryLookupKey/query", {
      ids: [],
      queryState: "n",
      position: 0,
    })
    expect(sent[0]?.methodCalls[0]?.[1]).toEqual({ filter: { namespace: "spam-traps" } })
    expect(JSON.parse(stdout).ids).toEqual([])
  })

  test("sieve system-script create runs through the route map", async () => {
    const { stdout, sent } = await runCommand(
      sieveCommands,
      ["system-script", "create", ...FLAGS, "--name", "x", "--contents", 'require "fileinto";', "--noIsActive"],
      "x:SieveSystemScript/set",
      { created: { script: { id: "v9" } } },
    )
    expect(sent[0]?.methodCalls[0]?.[0]).toBe("x:SieveSystemScript/set")
    expect(JSON.parse(stdout).created.script.id).toBe("v9")
  })

  test("asn get runs through the route map", async () => {
    const { stdout, sent } = await runCommand(lookupCommands, ["asn", "get", ...FLAGS], "x:Asn/get", {
      list: [{ id: "singleton" }],
      notFound: [],
    })
    expect(sent[0]?.methodCalls[0]?.[0]).toBe("x:Asn/get")
    expect(JSON.parse(stdout).list[0].id).toBe("singleton")
  })

  test("sender-auth set runs through the route map", async () => {
    const { stdout, sent } = await runCommand(
      reportSettingsCommands,
      ["sender-auth", "set", ...FLAGS, "--updateJson", '{"singleton":{"dkimStrict":false}}'],
      "x:SenderAuth/set",
      { updated: { singleton: null } },
    )
    expect(sent[0]?.methodCalls[0]?.[0]).toBe("x:SenderAuth/set")
    expect(JSON.parse(stdout).updated).toEqual({ singleton: null })
  })
})
