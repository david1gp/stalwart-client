import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { mtaConnectionStrategyGet } from "../mtaConnectionStrategyGet.js"
import { mtaConnectionStrategyQuery } from "../mtaConnectionStrategyQuery.js"
import { mtaConnectionStrategySet } from "../mtaConnectionStrategySet.js"
import { mtaDeliveryScheduleGet } from "../mtaDeliveryScheduleGet.js"
import { mtaDeliveryScheduleQuery } from "../mtaDeliveryScheduleQuery.js"
import { mtaDeliveryScheduleSet } from "../mtaDeliveryScheduleSet.js"
import { mtaExtensionsGet } from "../mtaExtensionsGet.js"
import { mtaExtensionsSet } from "../mtaExtensionsSet.js"
import { mtaHookGet } from "../mtaHookGet.js"
import { mtaHookQuery } from "../mtaHookQuery.js"
import { mtaHookSet } from "../mtaHookSet.js"
import { mtaInboundSessionGet } from "../mtaInboundSessionGet.js"
import { mtaInboundSessionSet } from "../mtaInboundSessionSet.js"
import { mtaInboundThrottleGet } from "../mtaInboundThrottleGet.js"
import { mtaInboundThrottleQuery } from "../mtaInboundThrottleQuery.js"
import { mtaInboundThrottleSet } from "../mtaInboundThrottleSet.js"
import { mtaMilterGet } from "../mtaMilterGet.js"
import { mtaMilterQuery } from "../mtaMilterQuery.js"
import { mtaMilterSet } from "../mtaMilterSet.js"
import { mtaOutboundStrategyGet } from "../mtaOutboundStrategyGet.js"
import { mtaOutboundStrategySet } from "../mtaOutboundStrategySet.js"
import { mtaOutboundThrottleGet } from "../mtaOutboundThrottleGet.js"
import { mtaOutboundThrottleQuery } from "../mtaOutboundThrottleQuery.js"
import { mtaOutboundThrottleSet } from "../mtaOutboundThrottleSet.js"
import { mtaQueueQuotaGet } from "../mtaQueueQuotaGet.js"
import { mtaQueueQuotaQuery } from "../mtaQueueQuotaQuery.js"
import { mtaQueueQuotaSet } from "../mtaQueueQuotaSet.js"
import { mtaRouteGet } from "../mtaRouteGet.js"
import { mtaRouteQuery } from "../mtaRouteQuery.js"
import { mtaRouteSet } from "../mtaRouteSet.js"
import { mtaStageAuthGet } from "../mtaStageAuthGet.js"
import { mtaStageAuthSet } from "../mtaStageAuthSet.js"
import { mtaStageConnectGet } from "../mtaStageConnectGet.js"
import { mtaStageConnectSet } from "../mtaStageConnectSet.js"
import { mtaStageDataGet } from "../mtaStageDataGet.js"
import { mtaStageDataSet } from "../mtaStageDataSet.js"
import { mtaStageEhloGet } from "../mtaStageEhloGet.js"
import { mtaStageEhloSet } from "../mtaStageEhloSet.js"
import { mtaStageMailGet } from "../mtaStageMailGet.js"
import { mtaStageMailSet } from "../mtaStageMailSet.js"
import { mtaStageRcptGet } from "../mtaStageRcptGet.js"
import { mtaStageRcptSet } from "../mtaStageRcptSet.js"
import { mtaStsGet } from "../mtaStsGet.js"
import { mtaStsSet } from "../mtaStsSet.js"
import { mtaTlsStrategyGet } from "../mtaTlsStrategyGet.js"
import { mtaTlsStrategyQuery } from "../mtaTlsStrategyQuery.js"
import { mtaTlsStrategySet } from "../mtaTlsStrategySet.js"
import { mtaVirtualQueueGet } from "../mtaVirtualQueueGet.js"
import { mtaVirtualQueueQuery } from "../mtaVirtualQueueQuery.js"
import { mtaVirtualQueueSet } from "../mtaVirtualQueueSet.js"
import { networkListenerGet } from "../networkListenerGet.js"
import { networkListenerQuery } from "../networkListenerQuery.js"
import { networkListenerSet } from "../networkListenerSet.js"
import { queuedMessageCancel } from "../queuedMessageCancel.js"
import { queuedMessageContents } from "../queuedMessageContents.js"
import { queuedMessageGet } from "../queuedMessageGet.js"
import { queuedMessageQuery } from "../queuedMessageQuery.js"
import { queuedMessageRetry } from "../queuedMessageRetry.js"
import { queuedMessageSet } from "../queuedMessageSet.js"
import { cliConfigFlagParams } from "../../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../../cli/cliConfigFlags.js"
import { cliFail } from "../../../cli/cliFail.js"
import { cliJsonParse } from "../../../cli/cliJsonParse.js"
import { cliRunApi } from "../../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../../cli/cliScalarFlagParams.js"

function jsonFlagRead(op: string, flag: string, value: string | undefined): Record<string, unknown> | undefined {
  if (value === undefined) return undefined
  const parsed = cliJsonParse(value, op, flag)
  if (!parsed.success) cliFail(parsed)
  return parsed.data as Record<string, unknown>
}

const mtaConnectionStrategyGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { ids?: string[]; properties?: string[] }) {
    await cliRunApi(this, flags, (config) =>
      mtaConnectionStrategyGet({ config, ids: flags.ids, properties: flags.properties }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      ids: cliScalarFlagParams.optionalStringList("Comma-separated ids (default: all)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:MtaConnectionStrategy/get — fetch MTA connection strategies" },
})

const mtaConnectionStrategyQueryCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { filterJson?: string; sortJson?: string; limit?: number; position?: number },
  ) {
    const op = "mtaConnectionStrategyQuery"
    const filter = jsonFlagRead(op, "filterJson", flags.filterJson)
    const sort = jsonFlagRead(op, "sortJson", flags.sortJson)
    await cliRunApi(this, flags, (config) =>
      mtaConnectionStrategyQuery({
        config,
        filter: filter as Record<string, string | number | boolean | null> | undefined,
        sort: sort as unknown as { property: string; isAscending?: boolean }[] | undefined,
        limit: flags.limit,
        position: flags.position,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      filterJson: cliScalarFlagParams.optionalString('Filter as JSON, e.g. {"name":"example.com"}'),
      sortJson: cliScalarFlagParams.optionalString('Sort as JSON array, e.g. [{"property":"name"}]'),
      limit: cliScalarFlagParams.optionalNumber("Max ids to return"),
      position: cliScalarFlagParams.optionalNumber("Zero-based start position"),
    },
  },
  docs: { brief: "x:MtaConnectionStrategy/query — list MTA connection strategies ids" },
})

const mtaConnectionStrategySetCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { createJson?: string; updateJson?: string; destroy?: string[] },
  ) {
    const op = "mtaConnectionStrategySet"
    const create = jsonFlagRead(op, "createJson", flags.createJson)
    const update = jsonFlagRead(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      mtaConnectionStrategySet({
        config,
        create: create as Record<string, Record<string, unknown>> | undefined,
        update: update as Record<string, Record<string, unknown>> | undefined,
        destroy: flags.destroy,
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
  docs: { brief: "x:MtaConnectionStrategy/set — create, update and/or destroy MTA connection strategies" },
})

const mtaDeliveryScheduleGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { ids?: string[]; properties?: string[] }) {
    await cliRunApi(this, flags, (config) =>
      mtaDeliveryScheduleGet({ config, ids: flags.ids, properties: flags.properties }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      ids: cliScalarFlagParams.optionalStringList("Comma-separated ids (default: all)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:MtaDeliverySchedule/get — fetch MTA delivery schedules" },
})

const mtaDeliveryScheduleQueryCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { filterJson?: string; sortJson?: string; limit?: number; position?: number },
  ) {
    const op = "mtaDeliveryScheduleQuery"
    const filter = jsonFlagRead(op, "filterJson", flags.filterJson)
    const sort = jsonFlagRead(op, "sortJson", flags.sortJson)
    await cliRunApi(this, flags, (config) =>
      mtaDeliveryScheduleQuery({
        config,
        filter: filter as Record<string, string | number | boolean | null> | undefined,
        sort: sort as unknown as { property: string; isAscending?: boolean }[] | undefined,
        limit: flags.limit,
        position: flags.position,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      filterJson: cliScalarFlagParams.optionalString('Filter as JSON, e.g. {"name":"example.com"}'),
      sortJson: cliScalarFlagParams.optionalString('Sort as JSON array, e.g. [{"property":"name"}]'),
      limit: cliScalarFlagParams.optionalNumber("Max ids to return"),
      position: cliScalarFlagParams.optionalNumber("Zero-based start position"),
    },
  },
  docs: { brief: "x:MtaDeliverySchedule/query — list MTA delivery schedules ids" },
})

const mtaDeliveryScheduleSetCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { createJson?: string; updateJson?: string; destroy?: string[] },
  ) {
    const op = "mtaDeliveryScheduleSet"
    const create = jsonFlagRead(op, "createJson", flags.createJson)
    const update = jsonFlagRead(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      mtaDeliveryScheduleSet({
        config,
        create: create as Record<string, Record<string, unknown>> | undefined,
        update: update as Record<string, Record<string, unknown>> | undefined,
        destroy: flags.destroy,
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
  docs: { brief: "x:MtaDeliverySchedule/set — create, update and/or destroy MTA delivery schedules" },
})

const mtaHookGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { ids?: string[]; properties?: string[] }) {
    await cliRunApi(this, flags, (config) => mtaHookGet({ config, ids: flags.ids, properties: flags.properties }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      ids: cliScalarFlagParams.optionalStringList("Comma-separated ids (default: all)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:MtaHook/get — fetch MTA hooks" },
})

const mtaHookQueryCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { filterJson?: string; sortJson?: string; limit?: number; position?: number },
  ) {
    const op = "mtaHookQuery"
    const filter = jsonFlagRead(op, "filterJson", flags.filterJson)
    const sort = jsonFlagRead(op, "sortJson", flags.sortJson)
    await cliRunApi(this, flags, (config) =>
      mtaHookQuery({
        config,
        filter: filter as Record<string, string | number | boolean | null> | undefined,
        sort: sort as unknown as { property: string; isAscending?: boolean }[] | undefined,
        limit: flags.limit,
        position: flags.position,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      filterJson: cliScalarFlagParams.optionalString('Filter as JSON, e.g. {"name":"example.com"}'),
      sortJson: cliScalarFlagParams.optionalString('Sort as JSON array, e.g. [{"property":"name"}]'),
      limit: cliScalarFlagParams.optionalNumber("Max ids to return"),
      position: cliScalarFlagParams.optionalNumber("Zero-based start position"),
    },
  },
  docs: { brief: "x:MtaHook/query — list MTA hooks ids" },
})

const mtaHookSetCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { createJson?: string; updateJson?: string; destroy?: string[] },
  ) {
    const op = "mtaHookSet"
    const create = jsonFlagRead(op, "createJson", flags.createJson)
    const update = jsonFlagRead(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      mtaHookSet({
        config,
        create: create as Record<string, Record<string, unknown>> | undefined,
        update: update as Record<string, Record<string, unknown>> | undefined,
        destroy: flags.destroy,
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
  docs: { brief: "x:MtaHook/set — create, update and/or destroy MTA hooks" },
})

const mtaInboundThrottleGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { ids?: string[]; properties?: string[] }) {
    await cliRunApi(this, flags, (config) =>
      mtaInboundThrottleGet({ config, ids: flags.ids, properties: flags.properties }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      ids: cliScalarFlagParams.optionalStringList("Comma-separated ids (default: all)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:MtaInboundThrottle/get — fetch MTA inbound throttles" },
})

const mtaInboundThrottleQueryCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { filterJson?: string; sortJson?: string; limit?: number; position?: number },
  ) {
    const op = "mtaInboundThrottleQuery"
    const filter = jsonFlagRead(op, "filterJson", flags.filterJson)
    const sort = jsonFlagRead(op, "sortJson", flags.sortJson)
    await cliRunApi(this, flags, (config) =>
      mtaInboundThrottleQuery({
        config,
        filter: filter as Record<string, string | number | boolean | null> | undefined,
        sort: sort as unknown as { property: string; isAscending?: boolean }[] | undefined,
        limit: flags.limit,
        position: flags.position,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      filterJson: cliScalarFlagParams.optionalString('Filter as JSON, e.g. {"name":"example.com"}'),
      sortJson: cliScalarFlagParams.optionalString('Sort as JSON array, e.g. [{"property":"name"}]'),
      limit: cliScalarFlagParams.optionalNumber("Max ids to return"),
      position: cliScalarFlagParams.optionalNumber("Zero-based start position"),
    },
  },
  docs: { brief: "x:MtaInboundThrottle/query — list MTA inbound throttles ids" },
})

const mtaInboundThrottleSetCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { createJson?: string; updateJson?: string; destroy?: string[] },
  ) {
    const op = "mtaInboundThrottleSet"
    const create = jsonFlagRead(op, "createJson", flags.createJson)
    const update = jsonFlagRead(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      mtaInboundThrottleSet({
        config,
        create: create as Record<string, Record<string, unknown>> | undefined,
        update: update as Record<string, Record<string, unknown>> | undefined,
        destroy: flags.destroy,
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
  docs: { brief: "x:MtaInboundThrottle/set — create, update and/or destroy MTA inbound throttles" },
})

const mtaMilterGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { ids?: string[]; properties?: string[] }) {
    await cliRunApi(this, flags, (config) => mtaMilterGet({ config, ids: flags.ids, properties: flags.properties }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      ids: cliScalarFlagParams.optionalStringList("Comma-separated ids (default: all)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:MtaMilter/get — fetch MTA milters" },
})

const mtaMilterQueryCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { filterJson?: string; sortJson?: string; limit?: number; position?: number },
  ) {
    const op = "mtaMilterQuery"
    const filter = jsonFlagRead(op, "filterJson", flags.filterJson)
    const sort = jsonFlagRead(op, "sortJson", flags.sortJson)
    await cliRunApi(this, flags, (config) =>
      mtaMilterQuery({
        config,
        filter: filter as Record<string, string | number | boolean | null> | undefined,
        sort: sort as unknown as { property: string; isAscending?: boolean }[] | undefined,
        limit: flags.limit,
        position: flags.position,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      filterJson: cliScalarFlagParams.optionalString('Filter as JSON, e.g. {"name":"example.com"}'),
      sortJson: cliScalarFlagParams.optionalString('Sort as JSON array, e.g. [{"property":"name"}]'),
      limit: cliScalarFlagParams.optionalNumber("Max ids to return"),
      position: cliScalarFlagParams.optionalNumber("Zero-based start position"),
    },
  },
  docs: { brief: "x:MtaMilter/query — list MTA milters ids" },
})

const mtaMilterSetCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { createJson?: string; updateJson?: string; destroy?: string[] },
  ) {
    const op = "mtaMilterSet"
    const create = jsonFlagRead(op, "createJson", flags.createJson)
    const update = jsonFlagRead(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      mtaMilterSet({
        config,
        create: create as Record<string, Record<string, unknown>> | undefined,
        update: update as Record<string, Record<string, unknown>> | undefined,
        destroy: flags.destroy,
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
  docs: { brief: "x:MtaMilter/set — create, update and/or destroy MTA milters" },
})

const mtaOutboundThrottleGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { ids?: string[]; properties?: string[] }) {
    await cliRunApi(this, flags, (config) =>
      mtaOutboundThrottleGet({ config, ids: flags.ids, properties: flags.properties }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      ids: cliScalarFlagParams.optionalStringList("Comma-separated ids (default: all)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:MtaOutboundThrottle/get — fetch MTA outbound throttles" },
})

const mtaOutboundThrottleQueryCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { filterJson?: string; sortJson?: string; limit?: number; position?: number },
  ) {
    const op = "mtaOutboundThrottleQuery"
    const filter = jsonFlagRead(op, "filterJson", flags.filterJson)
    const sort = jsonFlagRead(op, "sortJson", flags.sortJson)
    await cliRunApi(this, flags, (config) =>
      mtaOutboundThrottleQuery({
        config,
        filter: filter as Record<string, string | number | boolean | null> | undefined,
        sort: sort as unknown as { property: string; isAscending?: boolean }[] | undefined,
        limit: flags.limit,
        position: flags.position,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      filterJson: cliScalarFlagParams.optionalString('Filter as JSON, e.g. {"name":"example.com"}'),
      sortJson: cliScalarFlagParams.optionalString('Sort as JSON array, e.g. [{"property":"name"}]'),
      limit: cliScalarFlagParams.optionalNumber("Max ids to return"),
      position: cliScalarFlagParams.optionalNumber("Zero-based start position"),
    },
  },
  docs: { brief: "x:MtaOutboundThrottle/query — list MTA outbound throttles ids" },
})

const mtaOutboundThrottleSetCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { createJson?: string; updateJson?: string; destroy?: string[] },
  ) {
    const op = "mtaOutboundThrottleSet"
    const create = jsonFlagRead(op, "createJson", flags.createJson)
    const update = jsonFlagRead(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      mtaOutboundThrottleSet({
        config,
        create: create as Record<string, Record<string, unknown>> | undefined,
        update: update as Record<string, Record<string, unknown>> | undefined,
        destroy: flags.destroy,
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
  docs: { brief: "x:MtaOutboundThrottle/set — create, update and/or destroy MTA outbound throttles" },
})

const mtaQueueQuotaGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { ids?: string[]; properties?: string[] }) {
    await cliRunApi(this, flags, (config) => mtaQueueQuotaGet({ config, ids: flags.ids, properties: flags.properties }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      ids: cliScalarFlagParams.optionalStringList("Comma-separated ids (default: all)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:MtaQueueQuota/get — fetch MTA queue quotas" },
})

const mtaQueueQuotaQueryCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { filterJson?: string; sortJson?: string; limit?: number; position?: number },
  ) {
    const op = "mtaQueueQuotaQuery"
    const filter = jsonFlagRead(op, "filterJson", flags.filterJson)
    const sort = jsonFlagRead(op, "sortJson", flags.sortJson)
    await cliRunApi(this, flags, (config) =>
      mtaQueueQuotaQuery({
        config,
        filter: filter as Record<string, string | number | boolean | null> | undefined,
        sort: sort as unknown as { property: string; isAscending?: boolean }[] | undefined,
        limit: flags.limit,
        position: flags.position,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      filterJson: cliScalarFlagParams.optionalString('Filter as JSON, e.g. {"name":"example.com"}'),
      sortJson: cliScalarFlagParams.optionalString('Sort as JSON array, e.g. [{"property":"name"}]'),
      limit: cliScalarFlagParams.optionalNumber("Max ids to return"),
      position: cliScalarFlagParams.optionalNumber("Zero-based start position"),
    },
  },
  docs: { brief: "x:MtaQueueQuota/query — list MTA queue quotas ids" },
})

const mtaQueueQuotaSetCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { createJson?: string; updateJson?: string; destroy?: string[] },
  ) {
    const op = "mtaQueueQuotaSet"
    const create = jsonFlagRead(op, "createJson", flags.createJson)
    const update = jsonFlagRead(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      mtaQueueQuotaSet({
        config,
        create: create as Record<string, Record<string, unknown>> | undefined,
        update: update as Record<string, Record<string, unknown>> | undefined,
        destroy: flags.destroy,
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
  docs: { brief: "x:MtaQueueQuota/set — create, update and/or destroy MTA queue quotas" },
})

const mtaRouteGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { ids?: string[]; properties?: string[] }) {
    await cliRunApi(this, flags, (config) => mtaRouteGet({ config, ids: flags.ids, properties: flags.properties }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      ids: cliScalarFlagParams.optionalStringList("Comma-separated ids (default: all)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:MtaRoute/get — fetch MTA routes" },
})

const mtaRouteQueryCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { filterJson?: string; sortJson?: string; limit?: number; position?: number },
  ) {
    const op = "mtaRouteQuery"
    const filter = jsonFlagRead(op, "filterJson", flags.filterJson)
    const sort = jsonFlagRead(op, "sortJson", flags.sortJson)
    await cliRunApi(this, flags, (config) =>
      mtaRouteQuery({
        config,
        filter: filter as Record<string, string | number | boolean | null> | undefined,
        sort: sort as unknown as { property: string; isAscending?: boolean }[] | undefined,
        limit: flags.limit,
        position: flags.position,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      filterJson: cliScalarFlagParams.optionalString('Filter as JSON, e.g. {"name":"example.com"}'),
      sortJson: cliScalarFlagParams.optionalString('Sort as JSON array, e.g. [{"property":"name"}]'),
      limit: cliScalarFlagParams.optionalNumber("Max ids to return"),
      position: cliScalarFlagParams.optionalNumber("Zero-based start position"),
    },
  },
  docs: { brief: "x:MtaRoute/query — list MTA routes ids" },
})

const mtaRouteSetCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { createJson?: string; updateJson?: string; destroy?: string[] },
  ) {
    const op = "mtaRouteSet"
    const create = jsonFlagRead(op, "createJson", flags.createJson)
    const update = jsonFlagRead(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      mtaRouteSet({
        config,
        create: create as Record<string, Record<string, unknown>> | undefined,
        update: update as Record<string, Record<string, unknown>> | undefined,
        destroy: flags.destroy,
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
  docs: { brief: "x:MtaRoute/set — create, update and/or destroy MTA routes" },
})

const mtaTlsStrategyGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { ids?: string[]; properties?: string[] }) {
    await cliRunApi(this, flags, (config) =>
      mtaTlsStrategyGet({ config, ids: flags.ids, properties: flags.properties }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      ids: cliScalarFlagParams.optionalStringList("Comma-separated ids (default: all)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:MtaTlsStrategy/get — fetch MTA TLS strategies" },
})

const mtaTlsStrategyQueryCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { filterJson?: string; sortJson?: string; limit?: number; position?: number },
  ) {
    const op = "mtaTlsStrategyQuery"
    const filter = jsonFlagRead(op, "filterJson", flags.filterJson)
    const sort = jsonFlagRead(op, "sortJson", flags.sortJson)
    await cliRunApi(this, flags, (config) =>
      mtaTlsStrategyQuery({
        config,
        filter: filter as Record<string, string | number | boolean | null> | undefined,
        sort: sort as unknown as { property: string; isAscending?: boolean }[] | undefined,
        limit: flags.limit,
        position: flags.position,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      filterJson: cliScalarFlagParams.optionalString('Filter as JSON, e.g. {"name":"example.com"}'),
      sortJson: cliScalarFlagParams.optionalString('Sort as JSON array, e.g. [{"property":"name"}]'),
      limit: cliScalarFlagParams.optionalNumber("Max ids to return"),
      position: cliScalarFlagParams.optionalNumber("Zero-based start position"),
    },
  },
  docs: { brief: "x:MtaTlsStrategy/query — list MTA TLS strategies ids" },
})

const mtaTlsStrategySetCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { createJson?: string; updateJson?: string; destroy?: string[] },
  ) {
    const op = "mtaTlsStrategySet"
    const create = jsonFlagRead(op, "createJson", flags.createJson)
    const update = jsonFlagRead(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      mtaTlsStrategySet({
        config,
        create: create as Record<string, Record<string, unknown>> | undefined,
        update: update as Record<string, Record<string, unknown>> | undefined,
        destroy: flags.destroy,
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
  docs: { brief: "x:MtaTlsStrategy/set — create, update and/or destroy MTA TLS strategies" },
})

const mtaVirtualQueueGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { ids?: string[]; properties?: string[] }) {
    await cliRunApi(this, flags, (config) =>
      mtaVirtualQueueGet({ config, ids: flags.ids, properties: flags.properties }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      ids: cliScalarFlagParams.optionalStringList("Comma-separated ids (default: all)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:MtaVirtualQueue/get — fetch MTA virtual queues" },
})

const mtaVirtualQueueQueryCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { filterJson?: string; sortJson?: string; limit?: number; position?: number },
  ) {
    const op = "mtaVirtualQueueQuery"
    const filter = jsonFlagRead(op, "filterJson", flags.filterJson)
    const sort = jsonFlagRead(op, "sortJson", flags.sortJson)
    await cliRunApi(this, flags, (config) =>
      mtaVirtualQueueQuery({
        config,
        filter: filter as Record<string, string | number | boolean | null> | undefined,
        sort: sort as unknown as { property: string; isAscending?: boolean }[] | undefined,
        limit: flags.limit,
        position: flags.position,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      filterJson: cliScalarFlagParams.optionalString('Filter as JSON, e.g. {"name":"example.com"}'),
      sortJson: cliScalarFlagParams.optionalString('Sort as JSON array, e.g. [{"property":"name"}]'),
      limit: cliScalarFlagParams.optionalNumber("Max ids to return"),
      position: cliScalarFlagParams.optionalNumber("Zero-based start position"),
    },
  },
  docs: { brief: "x:MtaVirtualQueue/query — list MTA virtual queues ids" },
})

const mtaVirtualQueueSetCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { createJson?: string; updateJson?: string; destroy?: string[] },
  ) {
    const op = "mtaVirtualQueueSet"
    const create = jsonFlagRead(op, "createJson", flags.createJson)
    const update = jsonFlagRead(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      mtaVirtualQueueSet({
        config,
        create: create as Record<string, Record<string, unknown>> | undefined,
        update: update as Record<string, Record<string, unknown>> | undefined,
        destroy: flags.destroy,
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
  docs: { brief: "x:MtaVirtualQueue/set — create, update and/or destroy MTA virtual queues" },
})

const networkListenerGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { ids?: string[]; properties?: string[] }) {
    await cliRunApi(this, flags, (config) =>
      networkListenerGet({ config, ids: flags.ids, properties: flags.properties }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      ids: cliScalarFlagParams.optionalStringList("Comma-separated ids (default: all)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:NetworkListener/get — fetch network listeners" },
})

const networkListenerQueryCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { filterJson?: string; sortJson?: string; limit?: number; position?: number },
  ) {
    const op = "networkListenerQuery"
    const filter = jsonFlagRead(op, "filterJson", flags.filterJson)
    const sort = jsonFlagRead(op, "sortJson", flags.sortJson)
    await cliRunApi(this, flags, (config) =>
      networkListenerQuery({
        config,
        filter: filter as Record<string, string | number | boolean | null> | undefined,
        sort: sort as unknown as { property: string; isAscending?: boolean }[] | undefined,
        limit: flags.limit,
        position: flags.position,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      filterJson: cliScalarFlagParams.optionalString('Filter as JSON, e.g. {"name":"example.com"}'),
      sortJson: cliScalarFlagParams.optionalString('Sort as JSON array, e.g. [{"property":"name"}]'),
      limit: cliScalarFlagParams.optionalNumber("Max ids to return"),
      position: cliScalarFlagParams.optionalNumber("Zero-based start position"),
    },
  },
  docs: { brief: "x:NetworkListener/query — list network listeners ids" },
})

const networkListenerSetCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { createJson?: string; updateJson?: string; destroy?: string[] },
  ) {
    const op = "networkListenerSet"
    const create = jsonFlagRead(op, "createJson", flags.createJson)
    const update = jsonFlagRead(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      networkListenerSet({
        config,
        create: create as Record<string, Record<string, unknown>> | undefined,
        update: update as Record<string, Record<string, unknown>> | undefined,
        destroy: flags.destroy,
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
  docs: { brief: "x:NetworkListener/set — create, update and/or destroy network listeners" },
})

const queuedMessageGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { ids?: string[]; properties?: string[] }) {
    await cliRunApi(this, flags, (config) => queuedMessageGet({ config, ids: flags.ids, properties: flags.properties }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      ids: cliScalarFlagParams.optionalStringList("Comma-separated ids (default: all)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:QueuedMessage/get — fetch queued messages" },
})

const queuedMessageQueryCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { filterJson?: string; sortJson?: string; limit?: number; position?: number },
  ) {
    const op = "queuedMessageQuery"
    const filter = jsonFlagRead(op, "filterJson", flags.filterJson)
    const sort = jsonFlagRead(op, "sortJson", flags.sortJson)
    await cliRunApi(this, flags, (config) =>
      queuedMessageQuery({
        config,
        filter: filter as Record<string, string | number | boolean | null> | undefined,
        sort: sort as unknown as { property: string; isAscending?: boolean }[] | undefined,
        limit: flags.limit,
        position: flags.position,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      filterJson: cliScalarFlagParams.optionalString('Filter as JSON, e.g. {"name":"example.com"}'),
      sortJson: cliScalarFlagParams.optionalString('Sort as JSON array, e.g. [{"property":"name"}]'),
      limit: cliScalarFlagParams.optionalNumber("Max ids to return"),
      position: cliScalarFlagParams.optionalNumber("Zero-based start position"),
    },
  },
  docs: { brief: "x:QueuedMessage/query — list queued messages ids" },
})

const queuedMessageSetCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { createJson?: string; updateJson?: string; destroy?: string[] },
  ) {
    const op = "queuedMessageSet"
    const create = jsonFlagRead(op, "createJson", flags.createJson)
    const update = jsonFlagRead(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      queuedMessageSet({
        config,
        create: create as Record<string, Record<string, unknown>> | undefined,
        update: update as Record<string, Record<string, unknown>> | undefined,
        destroy: flags.destroy,
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
  docs: { brief: "x:QueuedMessage/set — create, update and/or destroy queued messages" },
})

const queuedMessageRetryCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: string; nextRetry?: string }) {
    await cliRunApi(this, flags, (config) => queuedMessageRetry({ config, id: flags.id, nextRetry: flags.nextRetry }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("Queued message id to reschedule"),
      nextRetry: cliScalarFlagParams.optionalString("Next attempt timestamp (default: now)"),
    },
  },
  docs: { brief: "Reschedule a queued message by patching nextRetry" },
})

const queuedMessageCancelCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: string }) {
    await cliRunApi(this, flags, (config) => queuedMessageCancel({ config, id: flags.id }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("Queued message id to remove from the queue"),
    },
  },
  docs: { brief: "Cancel a queued message (removes it from the queue)" },
})

const queuedMessageContentsCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: string }) {
    await cliRunApi(this, flags, (config) => queuedMessageContents({ config, id: flags.id }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("Queued message id to download the raw content for"),
    },
  },
  docs: { brief: "Download the raw content of a queued message (MessageContents view)" },
})

const mtaExtensionsGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { ids?: string[]; properties?: string[] }) {
    await cliRunApi(this, flags, (config) => mtaExtensionsGet({ config, ids: flags.ids, properties: flags.properties }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      ids: cliScalarFlagParams.optionalStringList("Comma-separated ids (default: all)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:MtaExtensions/get — fetch MTA extensions" },
})

const mtaExtensionsSetCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { createJson?: string; updateJson?: string; destroy?: string[] },
  ) {
    const op = "mtaExtensionsSet"
    const create = jsonFlagRead(op, "createJson", flags.createJson)
    const update = jsonFlagRead(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      mtaExtensionsSet({
        config,
        create: create as Record<string, Record<string, unknown>> | undefined,
        update: update as Record<string, Record<string, unknown>> | undefined,
        destroy: flags.destroy,
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
  docs: { brief: "x:MtaExtensions/set — create, update and/or destroy MTA extensions" },
})

const mtaInboundSessionGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { ids?: string[]; properties?: string[] }) {
    await cliRunApi(this, flags, (config) =>
      mtaInboundSessionGet({ config, ids: flags.ids, properties: flags.properties }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      ids: cliScalarFlagParams.optionalStringList("Comma-separated ids (default: all)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:MtaInboundSession/get — fetch MTA inbound session limits" },
})

const mtaInboundSessionSetCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { createJson?: string; updateJson?: string; destroy?: string[] },
  ) {
    const op = "mtaInboundSessionSet"
    const create = jsonFlagRead(op, "createJson", flags.createJson)
    const update = jsonFlagRead(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      mtaInboundSessionSet({
        config,
        create: create as Record<string, Record<string, unknown>> | undefined,
        update: update as Record<string, Record<string, unknown>> | undefined,
        destroy: flags.destroy,
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
  docs: { brief: "x:MtaInboundSession/set — create, update and/or destroy MTA inbound session limits" },
})

const mtaOutboundStrategyGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { ids?: string[]; properties?: string[] }) {
    await cliRunApi(this, flags, (config) =>
      mtaOutboundStrategyGet({ config, ids: flags.ids, properties: flags.properties }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      ids: cliScalarFlagParams.optionalStringList("Comma-separated ids (default: all)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:MtaOutboundStrategy/get — fetch MTA outbound strategy" },
})

const mtaOutboundStrategySetCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { createJson?: string; updateJson?: string; destroy?: string[] },
  ) {
    const op = "mtaOutboundStrategySet"
    const create = jsonFlagRead(op, "createJson", flags.createJson)
    const update = jsonFlagRead(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      mtaOutboundStrategySet({
        config,
        create: create as Record<string, Record<string, unknown>> | undefined,
        update: update as Record<string, Record<string, unknown>> | undefined,
        destroy: flags.destroy,
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
  docs: { brief: "x:MtaOutboundStrategy/set — create, update and/or destroy MTA outbound strategy" },
})

const mtaStageAuthGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { ids?: string[]; properties?: string[] }) {
    await cliRunApi(this, flags, (config) => mtaStageAuthGet({ config, ids: flags.ids, properties: flags.properties }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      ids: cliScalarFlagParams.optionalStringList("Comma-separated ids (default: all)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:MtaStageAuth/get — fetch MTA auth stage" },
})

const mtaStageAuthSetCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { createJson?: string; updateJson?: string; destroy?: string[] },
  ) {
    const op = "mtaStageAuthSet"
    const create = jsonFlagRead(op, "createJson", flags.createJson)
    const update = jsonFlagRead(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      mtaStageAuthSet({
        config,
        create: create as Record<string, Record<string, unknown>> | undefined,
        update: update as Record<string, Record<string, unknown>> | undefined,
        destroy: flags.destroy,
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
  docs: { brief: "x:MtaStageAuth/set — create, update and/or destroy MTA auth stage" },
})

const mtaStageConnectGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { ids?: string[]; properties?: string[] }) {
    await cliRunApi(this, flags, (config) =>
      mtaStageConnectGet({ config, ids: flags.ids, properties: flags.properties }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      ids: cliScalarFlagParams.optionalStringList("Comma-separated ids (default: all)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:MtaStageConnect/get — fetch MTA connect stage" },
})

const mtaStageConnectSetCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { createJson?: string; updateJson?: string; destroy?: string[] },
  ) {
    const op = "mtaStageConnectSet"
    const create = jsonFlagRead(op, "createJson", flags.createJson)
    const update = jsonFlagRead(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      mtaStageConnectSet({
        config,
        create: create as Record<string, Record<string, unknown>> | undefined,
        update: update as Record<string, Record<string, unknown>> | undefined,
        destroy: flags.destroy,
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
  docs: { brief: "x:MtaStageConnect/set — create, update and/or destroy MTA connect stage" },
})

const mtaStageDataGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { ids?: string[]; properties?: string[] }) {
    await cliRunApi(this, flags, (config) => mtaStageDataGet({ config, ids: flags.ids, properties: flags.properties }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      ids: cliScalarFlagParams.optionalStringList("Comma-separated ids (default: all)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:MtaStageData/get — fetch MTA data stage" },
})

const mtaStageDataSetCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { createJson?: string; updateJson?: string; destroy?: string[] },
  ) {
    const op = "mtaStageDataSet"
    const create = jsonFlagRead(op, "createJson", flags.createJson)
    const update = jsonFlagRead(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      mtaStageDataSet({
        config,
        create: create as Record<string, Record<string, unknown>> | undefined,
        update: update as Record<string, Record<string, unknown>> | undefined,
        destroy: flags.destroy,
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
  docs: { brief: "x:MtaStageData/set — create, update and/or destroy MTA data stage" },
})

const mtaStageEhloGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { ids?: string[]; properties?: string[] }) {
    await cliRunApi(this, flags, (config) => mtaStageEhloGet({ config, ids: flags.ids, properties: flags.properties }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      ids: cliScalarFlagParams.optionalStringList("Comma-separated ids (default: all)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:MtaStageEhlo/get — fetch MTA EHLO stage" },
})

const mtaStageEhloSetCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { createJson?: string; updateJson?: string; destroy?: string[] },
  ) {
    const op = "mtaStageEhloSet"
    const create = jsonFlagRead(op, "createJson", flags.createJson)
    const update = jsonFlagRead(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      mtaStageEhloSet({
        config,
        create: create as Record<string, Record<string, unknown>> | undefined,
        update: update as Record<string, Record<string, unknown>> | undefined,
        destroy: flags.destroy,
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
  docs: { brief: "x:MtaStageEhlo/set — create, update and/or destroy MTA EHLO stage" },
})

const mtaStageMailGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { ids?: string[]; properties?: string[] }) {
    await cliRunApi(this, flags, (config) => mtaStageMailGet({ config, ids: flags.ids, properties: flags.properties }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      ids: cliScalarFlagParams.optionalStringList("Comma-separated ids (default: all)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:MtaStageMail/get — fetch MTA MAIL stage" },
})

const mtaStageMailSetCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { createJson?: string; updateJson?: string; destroy?: string[] },
  ) {
    const op = "mtaStageMailSet"
    const create = jsonFlagRead(op, "createJson", flags.createJson)
    const update = jsonFlagRead(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      mtaStageMailSet({
        config,
        create: create as Record<string, Record<string, unknown>> | undefined,
        update: update as Record<string, Record<string, unknown>> | undefined,
        destroy: flags.destroy,
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
  docs: { brief: "x:MtaStageMail/set — create, update and/or destroy MTA MAIL stage" },
})

const mtaStageRcptGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { ids?: string[]; properties?: string[] }) {
    await cliRunApi(this, flags, (config) => mtaStageRcptGet({ config, ids: flags.ids, properties: flags.properties }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      ids: cliScalarFlagParams.optionalStringList("Comma-separated ids (default: all)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:MtaStageRcpt/get — fetch MTA RCPT stage" },
})

const mtaStageRcptSetCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { createJson?: string; updateJson?: string; destroy?: string[] },
  ) {
    const op = "mtaStageRcptSet"
    const create = jsonFlagRead(op, "createJson", flags.createJson)
    const update = jsonFlagRead(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      mtaStageRcptSet({
        config,
        create: create as Record<string, Record<string, unknown>> | undefined,
        update: update as Record<string, Record<string, unknown>> | undefined,
        destroy: flags.destroy,
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
  docs: { brief: "x:MtaStageRcpt/set — create, update and/or destroy MTA RCPT stage" },
})

const mtaStsGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { ids?: string[]; properties?: string[] }) {
    await cliRunApi(this, flags, (config) => mtaStsGet({ config, ids: flags.ids, properties: flags.properties }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      ids: cliScalarFlagParams.optionalStringList("Comma-separated ids (default: all)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:MtaSts/get — fetch MTA-STS policy" },
})

const mtaStsSetCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { createJson?: string; updateJson?: string; destroy?: string[] },
  ) {
    const op = "mtaStsSet"
    const create = jsonFlagRead(op, "createJson", flags.createJson)
    const update = jsonFlagRead(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      mtaStsSet({
        config,
        create: create as Record<string, Record<string, unknown>> | undefined,
        update: update as Record<string, Record<string, unknown>> | undefined,
        destroy: flags.destroy,
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
  docs: { brief: "x:MtaSts/set — create, update and/or destroy MTA-STS policy" },
})

const mtaConnectionStrategyCommands = buildRouteMap({
  routes: {
    get: mtaConnectionStrategyGetCommand,
    query: mtaConnectionStrategyQueryCommand,
    set: mtaConnectionStrategySetCommand,
  },
  docs: { brief: "Manage MTA connection strategies" },
})

const mtaDeliveryScheduleCommands = buildRouteMap({
  routes: {
    get: mtaDeliveryScheduleGetCommand,
    query: mtaDeliveryScheduleQueryCommand,
    set: mtaDeliveryScheduleSetCommand,
  },
  docs: { brief: "Manage MTA delivery schedules" },
})

const mtaHookCommands = buildRouteMap({
  routes: {
    get: mtaHookGetCommand,
    query: mtaHookQueryCommand,
    set: mtaHookSetCommand,
  },
  docs: { brief: "Manage MTA hooks" },
})

const mtaInboundThrottleCommands = buildRouteMap({
  routes: {
    get: mtaInboundThrottleGetCommand,
    query: mtaInboundThrottleQueryCommand,
    set: mtaInboundThrottleSetCommand,
  },
  docs: { brief: "Manage MTA inbound throttles" },
})

const mtaMilterCommands = buildRouteMap({
  routes: {
    get: mtaMilterGetCommand,
    query: mtaMilterQueryCommand,
    set: mtaMilterSetCommand,
  },
  docs: { brief: "Manage MTA milters" },
})

const mtaOutboundThrottleCommands = buildRouteMap({
  routes: {
    get: mtaOutboundThrottleGetCommand,
    query: mtaOutboundThrottleQueryCommand,
    set: mtaOutboundThrottleSetCommand,
  },
  docs: { brief: "Manage MTA outbound throttles" },
})

const mtaQueueQuotaCommands = buildRouteMap({
  routes: {
    get: mtaQueueQuotaGetCommand,
    query: mtaQueueQuotaQueryCommand,
    set: mtaQueueQuotaSetCommand,
  },
  docs: { brief: "Manage MTA queue quotas" },
})

const mtaRouteCommands = buildRouteMap({
  routes: {
    get: mtaRouteGetCommand,
    query: mtaRouteQueryCommand,
    set: mtaRouteSetCommand,
  },
  docs: { brief: "Manage MTA routes" },
})

const mtaTlsStrategyCommands = buildRouteMap({
  routes: {
    get: mtaTlsStrategyGetCommand,
    query: mtaTlsStrategyQueryCommand,
    set: mtaTlsStrategySetCommand,
  },
  docs: { brief: "Manage MTA TLS strategies" },
})

const mtaVirtualQueueCommands = buildRouteMap({
  routes: {
    get: mtaVirtualQueueGetCommand,
    query: mtaVirtualQueueQueryCommand,
    set: mtaVirtualQueueSetCommand,
  },
  docs: { brief: "Manage MTA virtual queues" },
})

const networkListenerCommands = buildRouteMap({
  routes: {
    get: networkListenerGetCommand,
    query: networkListenerQueryCommand,
    set: networkListenerSetCommand,
  },
  docs: { brief: "Manage network listeners" },
})

const queuedMessageCommands = buildRouteMap({
  routes: {
    get: queuedMessageGetCommand,
    query: queuedMessageQueryCommand,
    set: queuedMessageSetCommand,
    retry: queuedMessageRetryCommand,
    cancel: queuedMessageCancelCommand,
    contents: queuedMessageContentsCommand,
  },
  docs: { brief: "Manage queued messages" },
})

const mtaExtensionsCommands = buildRouteMap({
  routes: {
    get: mtaExtensionsGetCommand,
    set: mtaExtensionsSetCommand,
  },
  docs: { brief: "Manage MTA extensions" },
})

const mtaInboundSessionCommands = buildRouteMap({
  routes: {
    get: mtaInboundSessionGetCommand,
    set: mtaInboundSessionSetCommand,
  },
  docs: { brief: "Manage MTA inbound session limits" },
})

const mtaOutboundStrategyCommands = buildRouteMap({
  routes: {
    get: mtaOutboundStrategyGetCommand,
    set: mtaOutboundStrategySetCommand,
  },
  docs: { brief: "Manage MTA outbound strategy" },
})

const mtaStageAuthCommands = buildRouteMap({
  routes: {
    get: mtaStageAuthGetCommand,
    set: mtaStageAuthSetCommand,
  },
  docs: { brief: "Manage MTA auth stage" },
})

const mtaStageConnectCommands = buildRouteMap({
  routes: {
    get: mtaStageConnectGetCommand,
    set: mtaStageConnectSetCommand,
  },
  docs: { brief: "Manage MTA connect stage" },
})

const mtaStageDataCommands = buildRouteMap({
  routes: {
    get: mtaStageDataGetCommand,
    set: mtaStageDataSetCommand,
  },
  docs: { brief: "Manage MTA data stage" },
})

const mtaStageEhloCommands = buildRouteMap({
  routes: {
    get: mtaStageEhloGetCommand,
    set: mtaStageEhloSetCommand,
  },
  docs: { brief: "Manage MTA EHLO stage" },
})

const mtaStageMailCommands = buildRouteMap({
  routes: {
    get: mtaStageMailGetCommand,
    set: mtaStageMailSetCommand,
  },
  docs: { brief: "Manage MTA MAIL stage" },
})

const mtaStageRcptCommands = buildRouteMap({
  routes: {
    get: mtaStageRcptGetCommand,
    set: mtaStageRcptSetCommand,
  },
  docs: { brief: "Manage MTA RCPT stage" },
})

const mtaStsCommands = buildRouteMap({
  routes: {
    get: mtaStsGetCommand,
    set: mtaStsSetCommand,
  },
  docs: { brief: "Manage MTA-STS policy" },
})

export const mtaCommands = buildRouteMap({
  routes: {
    "mta-connection-strategy": mtaConnectionStrategyCommands,
    "mta-delivery-schedule": mtaDeliveryScheduleCommands,
    "mta-hook": mtaHookCommands,
    "mta-inbound-throttle": mtaInboundThrottleCommands,
    "mta-milter": mtaMilterCommands,
    "mta-outbound-throttle": mtaOutboundThrottleCommands,
    "mta-queue-quota": mtaQueueQuotaCommands,
    "mta-route": mtaRouteCommands,
    "mta-tls-strategy": mtaTlsStrategyCommands,
    "mta-virtual-queue": mtaVirtualQueueCommands,
    "network-listener": networkListenerCommands,
    "queued-message": queuedMessageCommands,
    "mta-extensions": mtaExtensionsCommands,
    "mta-inbound-session": mtaInboundSessionCommands,
    "mta-outbound-strategy": mtaOutboundStrategyCommands,
    "mta-stage-auth": mtaStageAuthCommands,
    "mta-stage-connect": mtaStageConnectCommands,
    "mta-stage-data": mtaStageDataCommands,
    "mta-stage-ehlo": mtaStageEhloCommands,
    "mta-stage-mail": mtaStageMailCommands,
    "mta-stage-rcpt": mtaStageRcptCommands,
    "mta-sts": mtaStsCommands,
  },
  docs: { brief: "MTA stages, routes, throttles, queue and listeners" },
})
