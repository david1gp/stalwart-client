import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { cliConfigFlagParams } from "../../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../../cli/cliConfigFlags.js"
import { cliFail } from "../../../cli/cliFail.js"
import { cliJsonParse } from "../../../cli/cliJsonParse.js"
import { cliRunApi } from "../../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../../cli/cliScalarFlagParams.js"
import { taskFailedQuery } from "../taskFailedQuery.js"
import type { TaskFailedQueryOptions } from "../taskFailedQueryOptionsSchema.js"
import { taskGet } from "../taskGet.js"
import { taskManagerGet } from "../taskManagerGet.js"
import { taskManagerSet } from "../taskManagerSet.js"
import { taskQuery } from "../taskQuery.js"
import type { TaskQueryOptions } from "../taskQueryOptionsSchema.js"
import { taskSet } from "../taskSet.js"

const taskGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { ids?: string[]; properties?: string[] }) {
    await cliRunApi(this, flags, (config) => taskGet({ config, ids: flags.ids, properties: flags.properties }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      ids: cliScalarFlagParams.optionalStringList("Comma-separated task ids (default: all)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "Fetch background tasks by id" },
})

const taskQueryCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & {
      due?: string
      dueIsGreaterThan?: string
      dueIsGreaterThanOrEqual?: string
      dueIsLessThan?: string
      dueIsLessThanOrEqual?: string
      status?: string
      type?: string
      ascending?: boolean
      limit?: number
      position?: number
    },
  ) {
    await cliRunApi(this, flags, (config) =>
      taskQuery({
        config,
        filter: {
          ...(flags.due !== undefined ? { due: flags.due } : {}),
          ...(flags.dueIsGreaterThan !== undefined ? { dueIsGreaterThan: flags.dueIsGreaterThan } : {}),
          ...(flags.dueIsGreaterThanOrEqual !== undefined
            ? { dueIsGreaterThanOrEqual: flags.dueIsGreaterThanOrEqual }
            : {}),
          ...(flags.dueIsLessThan !== undefined ? { dueIsLessThan: flags.dueIsLessThan } : {}),
          ...(flags.dueIsLessThanOrEqual !== undefined ? { dueIsLessThanOrEqual: flags.dueIsLessThanOrEqual } : {}),
          ...(flags.status !== undefined ? { status: flags.status as "Failed" | "Pending" | "Retry" } : {}),
          ...(flags.type !== undefined
            ? { type: flags.type as NonNullable<NonNullable<TaskQueryOptions["filter"]>["type"]> }
            : {}),
        },
        ...(flags.ascending !== undefined
          ? { sort: [{ property: "due" as const, isAscending: flags.ascending }] }
          : {}),
        ...(flags.limit !== undefined ? { limit: flags.limit } : {}),
        ...(flags.position !== undefined ? { position: flags.position } : {}),
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      due: cliScalarFlagParams.optionalString("Due timestamp equality filter"),
      dueIsGreaterThan: cliScalarFlagParams.optionalString("Due timestamp lower bound (exclusive)"),
      dueIsGreaterThanOrEqual: cliScalarFlagParams.optionalString("Due timestamp lower bound (inclusive)"),
      dueIsLessThan: cliScalarFlagParams.optionalString("Due timestamp upper bound (exclusive)"),
      dueIsLessThanOrEqual: cliScalarFlagParams.optionalString("Due timestamp upper bound (inclusive)"),
      status: cliScalarFlagParams.optionalString("Task status: Failed, Pending or Retry"),
      type: cliScalarFlagParams.optionalString("Task type, e.g. IndexDocument or DmarcReport"),
      ascending: cliScalarFlagParams.optionalBoolean("Sort by due ascending (default: descending)"),
      limit: cliScalarFlagParams.optionalNumber("Max ids to return"),
      position: cliScalarFlagParams.optionalNumber("Zero-based start position"),
    },
  },
  docs: { brief: "List background task ids (only due/status/type filters, due sorting)" },
})

const taskFailedQueryCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { due?: string; type?: string; ascending?: boolean; limit?: number; position?: number },
  ) {
    await cliRunApi(this, flags, (config) =>
      taskFailedQuery({
        config,
        ...(flags.due !== undefined ? { due: flags.due } : {}),
        ...(flags.type !== undefined ? { type: flags.type as NonNullable<TaskFailedQueryOptions["type"]> } : {}),
        ...(flags.ascending !== undefined
          ? { sort: [{ property: "due" as const, isAscending: flags.ascending }] }
          : {}),
        ...(flags.limit !== undefined ? { limit: flags.limit } : {}),
        ...(flags.position !== undefined ? { position: flags.position } : {}),
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      due: cliScalarFlagParams.optionalString("Due timestamp equality filter"),
      type: cliScalarFlagParams.optionalString("Task type, e.g. IndexDocument or DmarcReport"),
      ascending: cliScalarFlagParams.optionalBoolean("Sort by due ascending (default: descending)"),
      limit: cliScalarFlagParams.optionalNumber("Max ids to return"),
      position: cliScalarFlagParams.optionalNumber("Zero-based start position"),
    },
  },
  docs: { brief: "List failed background task ids (the x:Task/TaskFailed view)" },
})

const taskSetCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { createJson?: string; updateJson?: string; destroy?: string[] },
  ) {
    const create = cliJsonParse(flags.createJson, "task set", "createJson")
    if (!create.success) cliFail(create)
    const update = cliJsonParse(flags.updateJson, "task set", "updateJson")
    if (!update.success) cliFail(update)
    await cliRunApi(this, flags, (config) =>
      taskSet({
        config,
        ...(create.data !== undefined ? { create: create.data as Record<string, Record<string, unknown>> } : {}),
        ...(update.data !== undefined ? { update: update.data as Record<string, Record<string, unknown>> } : {}),
        ...(flags.destroy !== undefined ? { destroy: flags.destroy } : {}),
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      createJson: cliScalarFlagParams.optionalString('Creations as JSON: {"<creationId>": {"@type": …}}'),
      updateJson: cliScalarFlagParams.optionalString('Updates as JSON: {"<id>": {…patch…}}'),
      destroy: cliScalarFlagParams.optionalStringList("Comma-separated ids to destroy"),
    },
  },
  docs: { brief: "Create, update and/or destroy background tasks" },
})

const taskManagerGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { properties?: string[] }) {
    await cliRunApi(this, flags, (config) => taskManagerGet({ config, properties: flags.properties }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "Read the task execution settings singleton" },
})

const taskManagerSetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { patchJson: string }) {
    const parsed = cliJsonParse(flags.patchJson, "task-manager set", "patchJson")
    if (!parsed.success) cliFail(parsed)
    await cliRunApi(this, flags, (config) => taskManagerSet({ config, patch: parsed.data as Record<string, unknown> }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      patchJson: cliScalarFlagParams.requiredString("Singleton patch as JSON"),
    },
  },
  docs: { brief: "Patch the task execution settings singleton" },
})

export const tasksCommands = buildRouteMap({
  routes: {
    task: buildRouteMap({
      routes: { get: taskGetCommand, query: taskQueryCommand, set: taskSetCommand },
      docs: { brief: "Background tasks scheduled for execution" },
    }),
    "task-failed": buildRouteMap({
      routes: { query: taskFailedQueryCommand },
      docs: { brief: "Failed background tasks (x:Task/TaskFailed view)" },
    }),
    "task-manager": buildRouteMap({
      routes: { get: taskManagerGetCommand, set: taskManagerSetCommand },
      docs: { brief: "Task execution settings (retry strategies)" },
    }),
  },
  docs: { brief: "Background tasks and task manager settings" },
})
