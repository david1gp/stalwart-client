import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import type { PromiseResult } from "#result"
import type { StalwartClientConfig } from "../../../client/stalwartClientConfigSchema.js"
import { cliConfigFlagParams } from "../../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../../cli/cliConfigFlags.js"
import { cliFail } from "../../../cli/cliFail.js"
import { cliJsonParse } from "../../../cli/cliJsonParse.js"
import { cliRunApi } from "../../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../../cli/cliScalarFlagParams.js"
import { clusterNodeGet } from "../clusterNodeGet.js"
import { clusterNodeQuery } from "../clusterNodeQuery.js"
import { clusterRoleGet } from "../clusterRoleGet.js"
import { clusterRoleQuery } from "../clusterRoleQuery.js"
import { clusterRoleSet } from "../clusterRoleSet.js"
import { coordinatorGet } from "../coordinatorGet.js"
import { coordinatorSet } from "../coordinatorSet.js"

function getCommand(
  brief: string,
  run: (config: StalwartClientConfig, ids?: string[], properties?: string[]) => PromiseResult<unknown>,
) {
  return buildCommand({
    async func(this: CommandContext, flags: CliConfigFlags & { ids?: string[]; properties?: string[] }) {
      await cliRunApi(this, flags, (config) => run(config, flags.ids, flags.properties))
    },
    parameters: {
      flags: {
        ...cliConfigFlagParams,
        ids: cliScalarFlagParams.optionalStringList("Comma-separated ids (default: all)"),
        properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
      },
    },
    docs: { brief },
  })
}

function queryCommand(
  brief: string,
  run: (
    config: StalwartClientConfig,
    args: {
      filter?: Record<string, string | number | boolean | null>
      sort?: { property: string; isAscending?: boolean }[]
      limit?: number
      position?: number
    },
  ) => PromiseResult<unknown>,
) {
  return buildCommand({
    async func(
      this: CommandContext,
      flags: CliConfigFlags & { filterJson?: string; sortJson?: string; limit?: number; position?: number },
    ) {
      const filter = cliJsonParse(flags.filterJson, "query", "filterJson")
      if (!filter.success) cliFail(filter)
      const sort = cliJsonParse(flags.sortJson, "query", "sortJson")
      if (!sort.success) cliFail(sort)
      await cliRunApi(this, flags, (config) =>
        run(config, {
          ...(filter.data !== undefined
            ? { filter: filter.data as Record<string, string | number | boolean | null> }
            : {}),
          ...(sort.data !== undefined ? { sort: sort.data as { property: string; isAscending?: boolean }[] } : {}),
          ...(flags.limit !== undefined ? { limit: flags.limit } : {}),
          ...(flags.position !== undefined ? { position: flags.position } : {}),
        }),
      )
    },
    parameters: {
      flags: {
        ...cliConfigFlagParams,
        filterJson: cliScalarFlagParams.optionalString("Filter as JSON"),
        sortJson: cliScalarFlagParams.optionalString("Sort as JSON array"),
        limit: cliScalarFlagParams.optionalNumber("Max ids to return"),
        position: cliScalarFlagParams.optionalNumber("Zero-based start position"),
      },
    },
    docs: { brief },
  })
}

const clusterRoleSetCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { createJson?: string; updateJson?: string; destroy?: string[] },
  ) {
    const create = cliJsonParse(flags.createJson, "cluster-role set", "createJson")
    if (!create.success) cliFail(create)
    const update = cliJsonParse(flags.updateJson, "cluster-role set", "updateJson")
    if (!update.success) cliFail(update)
    await cliRunApi(this, flags, (config) =>
      clusterRoleSet({
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
      createJson: cliScalarFlagParams.optionalString('Creations as JSON: {"<creationId>": {…object…}}'),
      updateJson: cliScalarFlagParams.optionalString('Updates as JSON: {"<id>": {…patch…}}'),
      destroy: cliScalarFlagParams.optionalStringList("Comma-separated ids to destroy"),
    },
  },
  docs: { brief: "Create, update and/or destroy cluster node roles" },
})

const coordinatorGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { properties?: string[] }) {
    await cliRunApi(this, flags, (config) => coordinatorGet({ config, properties: flags.properties }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "Read the cluster coordinator singleton" },
})

const coordinatorSetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { patchJson: string }) {
    const parsed = cliJsonParse(flags.patchJson, "coordinator set", "patchJson")
    if (!parsed.success) cliFail(parsed)
    await cliRunApi(this, flags, (config) => coordinatorSet({ config, patch: parsed.data as Record<string, unknown> }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      patchJson: cliScalarFlagParams.requiredString("Singleton patch as JSON"),
    },
  },
  docs: { brief: "Patch the cluster coordinator singleton" },
})

export const clusterCommands = buildRouteMap({
  routes: {
    "cluster-node": buildRouteMap({
      routes: {
        get: getCommand("Fetch cluster nodes by id", (config, ids, properties) =>
          clusterNodeGet({ config, ids, properties }),
        ),
        query: queryCommand("List cluster node ids", (config, args) => clusterNodeQuery({ config, ...args })),
      },
      docs: { brief: "Cluster nodes (read-only)" },
    }),
    "cluster-role": buildRouteMap({
      routes: {
        get: getCommand("Fetch cluster node roles by id", (config, ids, properties) =>
          clusterRoleGet({ config, ids, properties }),
        ),
        query: queryCommand("List cluster role ids", (config, args) => clusterRoleQuery({ config, ...args })),
        set: clusterRoleSetCommand,
      },
      docs: { brief: "Cluster node roles" },
    }),
    coordinator: buildRouteMap({
      routes: { get: coordinatorGetCommand, set: coordinatorSetCommand },
      docs: { brief: "Cluster coordinator settings" },
    }),
  },
  docs: { brief: "Cluster nodes, roles and coordinator" },
})
