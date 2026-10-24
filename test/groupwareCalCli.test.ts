import { afterEach, describe, expect, test } from "bun:test"
import { buildApplication, run, type RouteMap, type CommandContext } from "@stricli/core"
import { calendarsCommands } from "../src/calendars/cli/calendarsCommands.js"
import { calendarEventNotificationsCommands } from "../src/calendarEventNotifications/cli/calendarEventNotificationsCommands.js"
import { calendarEventsCommands } from "../src/calendarEvents/cli/calendarEventsCommands.js"
import { participantIdentitiesCommands } from "../src/participantIdentities/cli/participantIdentitiesCommands.js"
import { principalsCommands } from "../src/principals/cli/principalsCommands.js"
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
  const app = buildApplication(map, { name: "groupware-cal-test-cli", versionInfo: { currentVersion: "0.0.0-test" } })
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

describe("groupwareCal CLI smoke tests", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("every route map exposes the expected subcommands", () => {
    expect(routePaths(principalsCommands)).toEqual([
      "get",
      "set",
      "query",
      "changes",
      "query-changes",
      "get-availability",
    ])
    expect(routePaths(calendarsCommands)).toEqual(["get", "set", "query", "changes"])
    expect(routePaths(calendarEventsCommands)).toEqual([
      "get",
      "set",
      "query",
      "changes",
      "query-changes",
      "copy",
      "parse",
    ])
    expect(routePaths(calendarEventNotificationsCommands)).toEqual(["get", "set", "query", "changes", "query-changes"])
    expect(routePaths(participantIdentitiesCommands)).toEqual(["get", "set", "changes"])
  })

  test("principal get runs through the route map", async () => {
    const { stdout, sent } = await runCommand(
      principalsCommands,
      ["get", "--baseUrl", "https://mail.example.com", "--token", "API_x", "--accountId", "a1", "--ids", "p1"],
      "Principal/get",
      { list: [{ id: "p1" }], notFound: [] },
    )
    expect(sent[0]?.methodCalls[0]?.[0]).toBe("Principal/get")
    expect(JSON.parse(stdout).list[0].id).toBe("p1")
  })

  test("calendar set runs through the route map", async () => {
    const { stdout, sent } = await runCommand(
      calendarsCommands,
      [
        "set",
        "--baseUrl",
        "https://mail.example.com",
        "--token",
        "API_x",
        "--accountId",
        "a1",
        "--createJson",
        '{"k1":{"name":"Work"}}',
      ],
      "Calendar/set",
      { created: { k1: { id: "c9" } } },
    )
    expect(sent[0]?.methodCalls[0]?.[0]).toBe("Calendar/set")
    expect(JSON.parse(stdout).created.k1.id).toBe("c9")
  })

  test("calendar-event query runs through the route map", async () => {
    const { stdout, sent } = await runCommand(
      calendarEventsCommands,
      [
        "query",
        "--baseUrl",
        "https://mail.example.com",
        "--token",
        "API_x",
        "--accountId",
        "a1",
        "--filterJson",
        '{"inCalendar":"c1"}',
      ],
      "CalendarEvent/query",
      { ids: ["e1"], queryState: "s1", position: 0 },
    )
    expect(sent[0]?.methodCalls[0]?.[0]).toBe("CalendarEvent/query")
    expect(JSON.parse(stdout).ids).toEqual(["e1"])
  })

  test("calendar-event-notification get runs through the route map", async () => {
    const { stdout, sent } = await runCommand(
      calendarEventNotificationsCommands,
      ["get", "--baseUrl", "https://mail.example.com", "--token", "API_x", "--accountId", "a1"],
      "CalendarEventNotification/get",
      { list: [], notFound: [] },
    )
    expect(sent[0]?.methodCalls[0]?.[0]).toBe("CalendarEventNotification/get")
    expect(JSON.parse(stdout).list).toEqual([])
  })

  test("participant-identity get runs through the route map", async () => {
    const { stdout, sent } = await runCommand(
      participantIdentitiesCommands,
      ["get", "--baseUrl", "https://mail.example.com", "--token", "API_x", "--accountId", "a1"],
      "ParticipantIdentity/get",
      { list: [], notFound: [] },
    )
    expect(sent[0]?.methodCalls[0]?.[0]).toBe("ParticipantIdentity/get")
    expect(JSON.parse(stdout).list).toEqual([])
  })
})
