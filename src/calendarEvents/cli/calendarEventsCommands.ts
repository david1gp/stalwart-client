import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { calendarEventChanges } from "../calendarEventChanges.js"
import { calendarEventCopy } from "../calendarEventCopy.js"
import { calendarEventGet } from "../calendarEventGet.js"
import { calendarEventParse } from "../calendarEventParse.js"
import { calendarEventQuery } from "../calendarEventQuery.js"
import { calendarEventQueryChanges } from "../calendarEventQueryChanges.js"
import { calendarEventSet } from "../calendarEventSet.js"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliJsonParse } from "../../cli/cliJsonParse.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"

function jsonFlagRead(
  op: string,
  flag: string,
  value: string | undefined,
): Record<string, Record<string, unknown>> | undefined {
  if (value === undefined) return undefined
  const parsed = cliJsonParse(value, op, flag)
  if (!parsed.success) cliFail(parsed)
  return parsed.data as Record<string, Record<string, unknown>>
}

const getCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & {
      accountId?: string
      ids?: string[]
      properties?: string[]
      recurrenceOverridesBefore?: string
      recurrenceOverridesAfter?: string
      reduceParticipants?: boolean
      timeZone?: string
    },
  ) {
    await cliRunApi(this, flags, (config) =>
      calendarEventGet({
        config,
        accountId: flags.accountId,
        ids: flags.ids,
        properties: flags.properties,
        recurrenceOverridesBefore: flags.recurrenceOverridesBefore,
        recurrenceOverridesAfter: flags.recurrenceOverridesAfter,
        reduceParticipants: flags.reduceParticipants,
        timeZone: flags.timeZone,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: cliScalarFlagParams.optionalString("Account id (default: session primary account)"),
      ids: cliScalarFlagParams.optionalStringList("Comma-separated event ids"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
      recurrenceOverridesBefore: cliScalarFlagParams.optionalString("Only return overrides before this date-time"),
      recurrenceOverridesAfter: cliScalarFlagParams.optionalString("Only return overrides after this date-time"),
      reduceParticipants: cliScalarFlagParams.optionalBoolean("Reduce participants to the matching identity"),
      timeZone: cliScalarFlagParams.optionalString("Time zone for floating date-times, e.g. Europe/Berlin"),
    },
  },
  docs: { brief: "CalendarEvent/get — fetch events by id" },
})

const setCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & {
      accountId?: string
      ifInState?: string
      createJson?: string
      updateJson?: string
      destroy?: string[]
      sendSchedulingMessages?: boolean
    },
  ) {
    const op = "calendarEventSet"
    const create = jsonFlagRead(op, "createJson", flags.createJson)
    const update = jsonFlagRead(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      calendarEventSet({
        config,
        accountId: flags.accountId,
        ifInState: flags.ifInState,
        create,
        update,
        destroy: flags.destroy,
        sendSchedulingMessages: flags.sendSchedulingMessages,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: cliScalarFlagParams.optionalString("Account id (default: session primary account)"),
      ifInState: cliScalarFlagParams.optionalString("Require this state before applying"),
      createJson: cliScalarFlagParams.optionalString('Creations as JSON: {"<creationId>": {…event…}}'),
      updateJson: cliScalarFlagParams.optionalString('Updates as JSON: {"<id>": {…patch…}}'),
      destroy: cliScalarFlagParams.optionalStringList("Comma-separated ids to destroy"),
      sendSchedulingMessages: cliScalarFlagParams.optionalBoolean("Send iTIP scheduling messages"),
    },
  },
  docs: { brief: "CalendarEvent/set — create, update and/or destroy events" },
})

const queryCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & {
      accountId?: string
      filterJson?: string
      sortJson?: string
      position?: number
      anchor?: string
      anchorOffset?: number
      limit?: number
      calculateTotal?: boolean
      expandRecurrences?: boolean
      timeZone?: string
    },
  ) {
    const op = "calendarEventQuery"
    const filter = jsonFlagRead(op, "filterJson", flags.filterJson)
    const sortParsed =
      flags.sortJson === undefined
        ? undefined
        : (() => {
            const parsed = cliJsonParse(flags.sortJson, op, "sortJson")
            if (!parsed.success) cliFail(parsed)
            return parsed.data as { property: string; isAscending?: boolean }[]
          })()
    await cliRunApi(this, flags, (config) =>
      calendarEventQuery({
        config,
        accountId: flags.accountId,
        filter,
        sort: sortParsed,
        position: flags.position,
        anchor: flags.anchor,
        anchorOffset: flags.anchorOffset,
        limit: flags.limit,
        calculateTotal: flags.calculateTotal,
        expandRecurrences: flags.expandRecurrences,
        timeZone: flags.timeZone,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: cliScalarFlagParams.optionalString("Account id (default: session primary account)"),
      filterJson: cliScalarFlagParams.optionalString('Filter as JSON, e.g. {"inCalendar":"abc"}'),
      sortJson: cliScalarFlagParams.optionalString('Sort as JSON array, e.g. [{"property":"start"}]'),
      position: cliScalarFlagParams.optionalNumber("Zero-based start position"),
      anchor: cliScalarFlagParams.optionalString("Anchor id for pagination"),
      anchorOffset: cliScalarFlagParams.optionalNumber("Offset relative to the anchor"),
      limit: cliScalarFlagParams.optionalNumber("Max ids to return"),
      calculateTotal: cliScalarFlagParams.optionalBoolean("Return the total match count"),
      expandRecurrences: cliScalarFlagParams.optionalBoolean("Expand recurring events into instances"),
      timeZone: cliScalarFlagParams.optionalString("Time zone for floating date-times, e.g. Europe/Berlin"),
    },
  },
  docs: { brief: "CalendarEvent/query — list event ids matching a filter" },
})

const changesCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { accountId?: string; sinceState: string; maxChanges?: number },
  ) {
    await cliRunApi(this, flags, (config) =>
      calendarEventChanges({
        config,
        accountId: flags.accountId,
        sinceState: flags.sinceState,
        maxChanges: flags.maxChanges,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: cliScalarFlagParams.optionalString("Account id (default: session primary account)"),
      sinceState: cliScalarFlagParams.requiredString("State to compare against"),
      maxChanges: cliScalarFlagParams.optionalNumber("Max changes to return"),
    },
  },
  docs: { brief: "CalendarEvent/changes — changed event ids since a state" },
})

const queryChangesCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { accountId?: string; sinceQueryState: string; maxChanges?: number },
  ) {
    await cliRunApi(this, flags, (config) =>
      calendarEventQueryChanges({
        config,
        accountId: flags.accountId,
        sinceQueryState: flags.sinceQueryState,
        maxChanges: flags.maxChanges,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: cliScalarFlagParams.optionalString("Account id (default: session primary account)"),
      sinceQueryState: cliScalarFlagParams.requiredString("Query state to compare against"),
      maxChanges: cliScalarFlagParams.optionalNumber("Max changes to return"),
    },
  },
  docs: { brief: "CalendarEvent/queryChanges — changes to a previous CalendarEvent/query result" },
})

const copyCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & {
      fromAccountId?: string
      ifFromInState?: string
      accountId?: string
      ifInState?: string
      createJson: string
      onSuccessDestroyOriginal?: boolean
      destroyFromIfInState?: string
    },
  ) {
    const op = "calendarEventCopy"
    const parsed = cliJsonParse(flags.createJson, op, "createJson")
    if (!parsed.success) cliFail(parsed)
    const create = parsed.data as Record<string, Record<string, unknown>>
    await cliRunApi(this, flags, (config) =>
      calendarEventCopy({
        config,
        fromAccountId: flags.fromAccountId,
        ifFromInState: flags.ifFromInState,
        accountId: flags.accountId,
        ifInState: flags.ifInState,
        create,
        onSuccessDestroyOriginal: flags.onSuccessDestroyOriginal,
        destroyFromIfInState: flags.destroyFromIfInState,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      fromAccountId: cliScalarFlagParams.optionalString("Source account id (default: session primary account)"),
      ifFromInState: cliScalarFlagParams.optionalString("Require this source state before copying"),
      accountId: cliScalarFlagParams.optionalString("Destination account id (default: session primary account)"),
      ifInState: cliScalarFlagParams.optionalString("Require this destination state before copying"),
      createJson: {
        kind: "parsed" as const,
        parse: String,
        brief: 'Copies as JSON: {"<fromId>": {…overrides…}}',
      },
      onSuccessDestroyOriginal: cliScalarFlagParams.optionalBoolean("Destroy the originals after copying"),
      destroyFromIfInState: cliScalarFlagParams.optionalString("Require this source state before destroying originals"),
    },
  },
  docs: { brief: "CalendarEvent/copy — copy events from another account" },
})

const parseCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { accountId?: string; blobIds: string[]; properties?: string[] },
  ) {
    await cliRunApi(this, flags, (config) =>
      calendarEventParse({
        config,
        accountId: flags.accountId,
        blobIds: flags.blobIds,
        properties: flags.properties,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: cliScalarFlagParams.optionalString("Account id (default: session primary account)"),
      blobIds: {
        kind: "parsed" as const,
        parse: String,
        variadic: "," as const,
        brief: "Comma-separated blob ids of uploaded .ics files",
      },
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "CalendarEvent/parse — parse uploaded .ics blobs into events" },
})

export const calendarEventsCommands = buildRouteMap({
  routes: {
    get: getCommand,
    set: setCommand,
    query: queryCommand,
    changes: changesCommand,
    "query-changes": queryChangesCommand,
    copy: copyCommand,
    parse: parseCommand,
  },
  docs: { brief: "JMAP CalendarEvent methods" },
})
