import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import type { PromiseResult } from "#result"
import type { StalwartClientConfig } from "../../../client/stalwartClientConfigSchema.js"
import { cliConfigFlagParams } from "../../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../../cli/cliConfigFlags.js"
import { cliFail } from "../../../cli/cliFail.js"
import { cliJsonParse } from "../../../cli/cliJsonParse.js"
import { cliRunApi } from "../../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../../cli/cliScalarFlagParams.js"
import { aiModelGet } from "../aiModelGet.js"
import { aiModelQuery } from "../aiModelQuery.js"
import { aiModelSet } from "../aiModelSet.js"
import { allowedIpAdd } from "../allowedIpAdd.js"
import { allowedIpGet } from "../allowedIpGet.js"
import { allowedIpQuery } from "../allowedIpQuery.js"
import { allowedIpRemove } from "../allowedIpRemove.js"
import { allowedIpSet } from "../allowedIpSet.js"
import { applicationGet } from "../applicationGet.js"
import { applicationQuery } from "../applicationQuery.js"
import { applicationSet } from "../applicationSet.js"
import { blockedIpAdd } from "../blockedIpAdd.js"
import { blockedIpGet } from "../blockedIpGet.js"
import { blockedIpQuery } from "../blockedIpQuery.js"
import { blockedIpRemove } from "../blockedIpRemove.js"
import { blockedIpSet } from "../blockedIpSet.js"
import { bootstrapGet } from "../bootstrapGet.js"
import { bootstrapSet } from "../bootstrapSet.js"
import { enterpriseGet } from "../enterpriseGet.js"
import { enterpriseSet } from "../enterpriseSet.js"
import { httpFormGet } from "../httpFormGet.js"
import { httpFormSet } from "../httpFormSet.js"
import { httpGet } from "../httpGet.js"
import { httpSet } from "../httpSet.js"
import { imapGet } from "../imapGet.js"
import { imapSet } from "../imapSet.js"
import { jmapGet } from "../jmapGet.js"
import { jmapSet } from "../jmapSet.js"
import { securityGet } from "../securityGet.js"
import { securitySet } from "../securitySet.js"
import { sharingGet } from "../sharingGet.js"
import { sharingSet } from "../sharingSet.js"
import { systemSettingsGet } from "../systemSettingsGet.js"
import { systemSettingsSet } from "../systemSettingsSet.js"
import { webDavGet } from "../webDavGet.js"
import { webDavSet } from "../webDavSet.js"

function singletonGetCommand(
  brief: string,
  run: (config: StalwartClientConfig, properties?: string[]) => PromiseResult<unknown>,
) {
  return buildCommand({
    async func(this: CommandContext, flags: CliConfigFlags & { properties?: string[] }) {
      await cliRunApi(this, flags, (config) => run(config, flags.properties))
    },
    parameters: {
      flags: {
        ...cliConfigFlagParams,
        properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
      },
    },
    docs: { brief },
  })
}

function singletonSetCommand(
  brief: string,
  run: (config: StalwartClientConfig, patch: Record<string, unknown>) => PromiseResult<unknown>,
) {
  return buildCommand({
    async func(this: CommandContext, flags: CliConfigFlags & { patchJson: string }) {
      const parsed = cliJsonParse(flags.patchJson, "set", "patchJson")
      if (!parsed.success) cliFail(parsed)
      await cliRunApi(this, flags, (config) => run(config, parsed.data as Record<string, unknown>))
    },
    parameters: {
      flags: {
        ...cliConfigFlagParams,
        patchJson: cliScalarFlagParams.requiredString("Singleton patch as JSON (durations are ms numbers)"),
      },
    },
    docs: { brief },
  })
}

function objectGetCommand(
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

function objectQueryCommand(
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
        filterJson: cliScalarFlagParams.optionalString('Filter as JSON, e.g. {"address":"192.0.2.1"}'),
        sortJson: cliScalarFlagParams.optionalString('Sort as JSON array, e.g. [{"property":"address"}]'),
        limit: cliScalarFlagParams.optionalNumber("Max ids to return"),
        position: cliScalarFlagParams.optionalNumber("Zero-based start position"),
      },
    },
    docs: { brief },
  })
}

function objectSetCommand(
  brief: string,
  run: (
    config: StalwartClientConfig,
    args: {
      create?: Record<string, Record<string, unknown>>
      update?: Record<string, Record<string, unknown>>
      destroy?: string[]
    },
  ) => PromiseResult<unknown>,
) {
  return buildCommand({
    async func(
      this: CommandContext,
      flags: CliConfigFlags & { createJson?: string; updateJson?: string; destroy?: string[] },
    ) {
      const create = cliJsonParse(flags.createJson, "set", "createJson")
      if (!create.success) cliFail(create)
      const update = cliJsonParse(flags.updateJson, "set", "updateJson")
      if (!update.success) cliFail(update)
      await cliRunApi(this, flags, (config) =>
        run(config, {
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
    docs: { brief },
  })
}

function singletonRoutes(
  getBrief: string,
  setBrief: string,
  get: (config: StalwartClientConfig, properties?: string[]) => PromiseResult<unknown>,
  set: (config: StalwartClientConfig, patch: Record<string, unknown>) => PromiseResult<unknown>,
) {
  return buildRouteMap({
    routes: { get: singletonGetCommand(getBrief, get), set: singletonSetCommand(setBrief, set) },
    docs: { brief: getBrief },
  })
}

function objectRoutes(
  brief: string,
  get: (config: StalwartClientConfig, ids?: string[], properties?: string[]) => PromiseResult<unknown>,
  query: (
    config: StalwartClientConfig,
    args: {
      filter?: Record<string, string | number | boolean | null>
      sort?: { property: string; isAscending?: boolean }[]
      limit?: number
      position?: number
    },
  ) => PromiseResult<unknown>,
  set: (
    config: StalwartClientConfig,
    args: {
      create?: Record<string, Record<string, unknown>>
      update?: Record<string, Record<string, unknown>>
      destroy?: string[]
    },
  ) => PromiseResult<unknown>,
) {
  return buildRouteMap({
    routes: {
      get: objectGetCommand(`${brief} by id`, get),
      query: objectQueryCommand(`List ${brief} ids`, query),
      set: objectSetCommand(`Create, update and/or destroy ${brief}`, set),
    },
    docs: { brief },
  })
}

const allowedIpAddCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { address: string; expiresAt?: string; reason?: string }) {
    await cliRunApi(this, flags, (config) =>
      allowedIpAdd({
        config,
        address: flags.address,
        ...(flags.expiresAt !== undefined ? { expiresAt: flags.expiresAt } : {}),
        ...(flags.reason !== undefined ? { reason: flags.reason } : {}),
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      address: cliScalarFlagParams.requiredString("IP address or mask to allow (use documentation ranges in tests)"),
      expiresAt: cliScalarFlagParams.optionalString("Expiry timestamp"),
      reason: cliScalarFlagParams.optionalString("Reason for allowing"),
    },
  },
  docs: { brief: "Allow an IP address or network range" },
})

const allowedIpRemoveCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: string }) {
    await cliRunApi(this, flags, (config) => allowedIpRemove({ config, id: flags.id }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("Id of the allowed IP entry to destroy"),
    },
  },
  docs: { brief: "Remove an allowed IP entry" },
})

const blockedIpAddCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { address: string; expiresAt?: string; reason?: string }) {
    await cliRunApi(this, flags, (config) =>
      blockedIpAdd({
        config,
        address: flags.address,
        ...(flags.expiresAt !== undefined ? { expiresAt: flags.expiresAt } : {}),
        ...(flags.reason !== undefined
          ? {
              reason: flags.reason as
                | "authFailure"
                | "loitering"
                | "manual"
                | "other"
                | "portScanning"
                | "rcptToFailure",
            }
          : {}),
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      address: cliScalarFlagParams.requiredString("IP address or mask to block (never 127.0.0.1 or ::1)"),
      expiresAt: cliScalarFlagParams.optionalString("Expiry timestamp"),
      reason: cliScalarFlagParams.optionalString("Block reason (default manual)"),
    },
  },
  docs: { brief: "Block an IP address or network range" },
})

const blockedIpRemoveCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: string }) {
    await cliRunApi(this, flags, (config) => blockedIpRemove({ config, id: flags.id }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("Id of the blocked IP entry to destroy"),
    },
  },
  docs: { brief: "Remove a blocked IP entry" },
})

export const systemCommands = buildRouteMap({
  routes: {
    "system-settings": singletonRoutes(
      "Read the core server settings singleton",
      "Patch the core server settings singleton",
      (config, properties) => systemSettingsGet({ config, properties }),
      (config, patch) => systemSettingsSet({ config, patch }),
    ),
    http: singletonRoutes(
      "Read the HTTP server settings singleton",
      "Patch the HTTP server settings singleton",
      (config, properties) => httpGet({ config, properties }),
      (config, patch) => httpSet({ config, patch }),
    ),
    "http-form": singletonRoutes(
      "Read the contact form endpoint singleton",
      "Patch the contact form endpoint singleton",
      (config, properties) => httpFormGet({ config, properties }),
      (config, patch) => httpFormSet({ config, patch }),
    ),
    imap: singletonRoutes(
      "Read the IMAP protocol settings singleton",
      "Patch the IMAP protocol settings singleton",
      (config, properties) => imapGet({ config, properties }),
      (config, patch) => imapSet({ config, patch }),
    ),
    jmap: singletonRoutes(
      "Read the JMAP protocol limits singleton",
      "Patch the JMAP protocol limits singleton",
      (config, properties) => jmapGet({ config, properties }),
      (config, patch) => jmapSet({ config, patch }),
    ),
    webdav: singletonRoutes(
      "Read the WebDAV protocol settings singleton",
      "Patch the WebDAV protocol settings singleton",
      (config, properties) => webDavGet({ config, properties }),
      (config, patch) => webDavSet({ config, patch }),
    ),
    security: singletonRoutes(
      "Read the automatic IP banning rules singleton",
      "Patch the automatic IP banning rules singleton",
      (config, properties) => securityGet({ config, properties }),
      (config, patch) => securitySet({ config, patch }),
    ),
    sharing: singletonRoutes(
      "Read the sharing settings singleton",
      "Patch the sharing settings singleton",
      (config, properties) => sharingGet({ config, properties }),
      (config, patch) => sharingSet({ config, patch }),
    ),
    enterprise: singletonRoutes(
      "Read the enterprise licensing singleton",
      "Patch the enterprise licensing singleton",
      (config, properties) => enterpriseGet({ config, properties }),
      (config, patch) => enterpriseSet({ config, patch }),
    ),
    bootstrap: singletonRoutes(
      "Read the first-run setup singleton",
      "Write the first-run setup singleton (bootstrap mode only)",
      (config, properties) => bootstrapGet({ config, properties }),
      (config, patch) => bootstrapSet({ config, patch }),
    ),
    "allowed-ip": buildRouteMap({
      routes: {
        get: objectGetCommand("Fetch allowed IP entries by id", (config, ids, properties) =>
          allowedIpGet({ config, ids, properties }),
        ),
        query: objectQueryCommand("allowed IP entries", (config, args) => allowedIpQuery({ config, ...args })),
        set: objectSetCommand("allowed IP entries", (config, args) => allowedIpSet({ config, ...args })),
        add: allowedIpAddCommand,
        remove: allowedIpRemoveCommand,
      },
      docs: { brief: "Allowed IP addresses and network ranges" },
    }),
    "blocked-ip": buildRouteMap({
      routes: {
        get: objectGetCommand("Fetch blocked IP entries by id", (config, ids, properties) =>
          blockedIpGet({ config, ids, properties }),
        ),
        query: objectQueryCommand("blocked IP entries", (config, args) => blockedIpQuery({ config, ...args })),
        set: objectSetCommand("blocked IP entries", (config, args) => blockedIpSet({ config, ...args })),
        add: blockedIpAddCommand,
        remove: blockedIpRemoveCommand,
      },
      docs: { brief: "Blocked IP addresses and network ranges" },
    }),
    application: objectRoutes(
      "web applications served by the server",
      (config, ids, properties) => applicationGet({ config, ids, properties }),
      (config, args) => applicationQuery({ config, ...args }),
      (config, args) => applicationSet({ config, ...args }),
    ),
    "ai-model": objectRoutes(
      "AI model endpoints for LLM-based features",
      (config, ids, properties) => aiModelGet({ config, ids, properties }),
      (config, args) => aiModelQuery({ config, ...args }),
      (config, args) => aiModelSet({ config, ...args }),
    ),
  },
  docs: { brief: "Server, protocol and access-control settings (registry system objects)" },
})
