import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { cliConfigFlagParams } from "../../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../../cli/cliConfigFlags.js"
import { cliFail } from "../../../cli/cliFail.js"
import { cliJsonParse } from "../../../cli/cliJsonParse.js"
import { cliRunApi } from "../../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../../cli/cliScalarFlagParams.js"
import { spamClassifierGet } from "../spamClassifierGet.js"
import { spamClassifierSet } from "../spamClassifierSet.js"
import { spamDnsblServerGet } from "../spamDnsblServerGet.js"
import { spamDnsblServerSet } from "../spamDnsblServerSet.js"
import { spamDnsblSettingsGet } from "../spamDnsblSettingsGet.js"
import { spamDnsblSettingsSet } from "../spamDnsblSettingsSet.js"
import { spamFileExtensionGet } from "../spamFileExtensionGet.js"
import { spamFileExtensionSet } from "../spamFileExtensionSet.js"
import { spamLlmGet } from "../spamLlmGet.js"
import { spamLlmSet } from "../spamLlmSet.js"
import { spamPyzorGet } from "../spamPyzorGet.js"
import { spamPyzorSet } from "../spamPyzorSet.js"
import { spamRuleGet } from "../spamRuleGet.js"
import { spamRuleSet } from "../spamRuleSet.js"
import { spamSettingsGet } from "../spamSettingsGet.js"
import { spamSettingsSet } from "../spamSettingsSet.js"
import { spamTagGet } from "../spamTagGet.js"
import { spamTagSet } from "../spamTagSet.js"
import { spamTrainingSampleGet } from "../spamTrainingSampleGet.js"
import { spamTrainingSampleSet } from "../spamTrainingSampleSet.js"
import { spamDnsblServerQuery } from "../spamDnsblServerQuery.js"
import { spamFileExtensionQuery } from "../spamFileExtensionQuery.js"
import { spamRuleQuery } from "../spamRuleQuery.js"
import { spamTagQuery } from "../spamTagQuery.js"
import { spamTrainingSampleQuery } from "../spamTrainingSampleQuery.js"
import { spamBlockedDomainQuery } from "../spamBlockedDomainQuery.js"
import { spamTrapQuery } from "../spamTrapQuery.js"
import { spamTrustedDomainQuery } from "../spamTrustedDomainQuery.js"
import { spamUrlRedirectorQuery } from "../spamUrlRedirectorQuery.js"

function flagJson(op: string, flag: string, value: string | undefined): unknown {
  if (value === undefined) return undefined
  const parsed = cliJsonParse(value, op, flag)
  if (!parsed.success) cliFail(parsed)
  return parsed.data
}

const spamClassifierGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { properties?: string[] }) {
    await cliRunApi(this, flags, (config) => spamClassifierGet({ config, properties: flags.properties }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:SpamClassifier/get — fetch SpamClassifier (singletons: the singleton)" },
})

const spamClassifierSetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { updateJson: string }) {
    const op = "spamClassifierSet"
    const update = flagJson(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      spamClassifierSet({
        config,
        update: update as Record<string, Record<string, unknown>>,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      updateJson: cliScalarFlagParams.requiredString('Update as JSON: {"singleton": {"prop": value}}'),
    },
  },
  docs: { brief: "x:SpamClassifier/set — update the SpamClassifier singleton" },
})

const spamDnsblServerGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { ids?: string[]; properties?: string[] }) {
    await cliRunApi(this, flags, (config) =>
      spamDnsblServerGet({ config, ids: flags.ids, properties: flags.properties }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      ids: cliScalarFlagParams.optionalStringList("Comma-separated ids to fetch (default: all)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:SpamDnsblServer/get — fetch SpamDnsblServer objects" },
})

const spamDnsblServerQueryCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { filterJson?: string; sortJson?: string; limit?: number; position?: number },
  ) {
    const op = "spamDnsblServerQuery"
    const filter = flagJson(op, "filterJson", flags.filterJson)
    const sort = flagJson(op, "sortJson", flags.sortJson)
    await cliRunApi(this, flags, (config) =>
      spamDnsblServerQuery({
        config,
        filter: filter as Record<string, string | number | boolean | null> | undefined,
        sort: sort as { property: string; isAscending?: boolean }[] | undefined,
        limit: flags.limit,
        position: flags.position,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      filterJson: cliScalarFlagParams.optionalString("Filter as JSON (AND of property matches)"),
      sortJson: cliScalarFlagParams.optionalString('Sort as JSON array, e.g. [{"property":"name"}]'),
      limit: cliScalarFlagParams.optionalNumber("Max ids to return"),
      position: cliScalarFlagParams.optionalNumber("Zero-based start position"),
    },
  },
  docs: { brief: "x:SpamDnsblServer/query — list SpamDnsblServer ids" },
})

const spamDnsblServerSetCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { createJson?: string; updateJson?: string; destroy?: string[] },
  ) {
    const op = "spamDnsblServerSet"
    const create = flagJson(op, "createJson", flags.createJson)
    const update = flagJson(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      spamDnsblServerSet({
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
      createJson: cliScalarFlagParams.optionalString('Creations as JSON: {"<creationId>": {...object...}}'),
      updateJson: cliScalarFlagParams.optionalString('Updates as JSON: {"<id>": {...patch...}}'),
      destroy: cliScalarFlagParams.optionalStringList("Comma-separated ids to destroy"),
    },
  },
  docs: { brief: "x:SpamDnsblServer/set — create, update and/or destroy SpamDnsblServer objects" },
})

const spamDnsblSettingsGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { properties?: string[] }) {
    await cliRunApi(this, flags, (config) => spamDnsblSettingsGet({ config, properties: flags.properties }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:SpamDnsblSettings/get — fetch SpamDnsblSettings (singletons: the singleton)" },
})

const spamDnsblSettingsSetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { updateJson: string }) {
    const op = "spamDnsblSettingsSet"
    const update = flagJson(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      spamDnsblSettingsSet({
        config,
        update: update as Record<string, Record<string, unknown>>,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      updateJson: cliScalarFlagParams.requiredString('Update as JSON: {"singleton": {"prop": value}}'),
    },
  },
  docs: { brief: "x:SpamDnsblSettings/set — update the SpamDnsblSettings singleton" },
})

const spamFileExtensionGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { ids?: string[]; properties?: string[] }) {
    await cliRunApi(this, flags, (config) =>
      spamFileExtensionGet({ config, ids: flags.ids, properties: flags.properties }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      ids: cliScalarFlagParams.optionalStringList("Comma-separated ids to fetch (default: all)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:SpamFileExtension/get — fetch SpamFileExtension objects" },
})

const spamFileExtensionQueryCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { filterJson?: string; sortJson?: string; limit?: number; position?: number },
  ) {
    const op = "spamFileExtensionQuery"
    const filter = flagJson(op, "filterJson", flags.filterJson)
    const sort = flagJson(op, "sortJson", flags.sortJson)
    await cliRunApi(this, flags, (config) =>
      spamFileExtensionQuery({
        config,
        filter: filter as Record<string, string | number | boolean | null> | undefined,
        sort: sort as { property: string; isAscending?: boolean }[] | undefined,
        limit: flags.limit,
        position: flags.position,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      filterJson: cliScalarFlagParams.optionalString("Filter as JSON (AND of property matches)"),
      sortJson: cliScalarFlagParams.optionalString('Sort as JSON array, e.g. [{"property":"name"}]'),
      limit: cliScalarFlagParams.optionalNumber("Max ids to return"),
      position: cliScalarFlagParams.optionalNumber("Zero-based start position"),
    },
  },
  docs: { brief: "x:SpamFileExtension/query — list SpamFileExtension ids" },
})

const spamFileExtensionSetCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { createJson?: string; updateJson?: string; destroy?: string[] },
  ) {
    const op = "spamFileExtensionSet"
    const create = flagJson(op, "createJson", flags.createJson)
    const update = flagJson(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      spamFileExtensionSet({
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
      createJson: cliScalarFlagParams.optionalString('Creations as JSON: {"<creationId>": {...object...}}'),
      updateJson: cliScalarFlagParams.optionalString('Updates as JSON: {"<id>": {...patch...}}'),
      destroy: cliScalarFlagParams.optionalStringList("Comma-separated ids to destroy"),
    },
  },
  docs: { brief: "x:SpamFileExtension/set — create, update and/or destroy SpamFileExtension objects" },
})

const spamLlmGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { properties?: string[] }) {
    await cliRunApi(this, flags, (config) => spamLlmGet({ config, properties: flags.properties }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:SpamLlm/get — fetch SpamLlm (singletons: the singleton)" },
})

const spamLlmSetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { updateJson: string }) {
    const op = "spamLlmSet"
    const update = flagJson(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      spamLlmSet({
        config,
        update: update as Record<string, Record<string, unknown>>,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      updateJson: cliScalarFlagParams.requiredString('Update as JSON: {"singleton": {"prop": value}}'),
    },
  },
  docs: { brief: "x:SpamLlm/set — update the SpamLlm singleton" },
})

const spamPyzorGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { properties?: string[] }) {
    await cliRunApi(this, flags, (config) => spamPyzorGet({ config, properties: flags.properties }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:SpamPyzor/get — fetch SpamPyzor (singletons: the singleton)" },
})

const spamPyzorSetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { updateJson: string }) {
    const op = "spamPyzorSet"
    const update = flagJson(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      spamPyzorSet({
        config,
        update: update as Record<string, Record<string, unknown>>,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      updateJson: cliScalarFlagParams.requiredString('Update as JSON: {"singleton": {"prop": value}}'),
    },
  },
  docs: { brief: "x:SpamPyzor/set — update the SpamPyzor singleton" },
})

const spamRuleGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { ids?: string[]; properties?: string[] }) {
    await cliRunApi(this, flags, (config) => spamRuleGet({ config, ids: flags.ids, properties: flags.properties }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      ids: cliScalarFlagParams.optionalStringList("Comma-separated ids to fetch (default: all)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:SpamRule/get — fetch SpamRule objects" },
})

const spamRuleQueryCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { filterJson?: string; sortJson?: string; limit?: number; position?: number },
  ) {
    const op = "spamRuleQuery"
    const filter = flagJson(op, "filterJson", flags.filterJson)
    const sort = flagJson(op, "sortJson", flags.sortJson)
    await cliRunApi(this, flags, (config) =>
      spamRuleQuery({
        config,
        filter: filter as Record<string, string | number | boolean | null> | undefined,
        sort: sort as { property: string; isAscending?: boolean }[] | undefined,
        limit: flags.limit,
        position: flags.position,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      filterJson: cliScalarFlagParams.optionalString("Filter as JSON (AND of property matches)"),
      sortJson: cliScalarFlagParams.optionalString('Sort as JSON array, e.g. [{"property":"name"}]'),
      limit: cliScalarFlagParams.optionalNumber("Max ids to return"),
      position: cliScalarFlagParams.optionalNumber("Zero-based start position"),
    },
  },
  docs: { brief: "x:SpamRule/query — list SpamRule ids" },
})

const spamRuleSetCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { createJson?: string; updateJson?: string; destroy?: string[] },
  ) {
    const op = "spamRuleSet"
    const create = flagJson(op, "createJson", flags.createJson)
    const update = flagJson(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      spamRuleSet({
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
      createJson: cliScalarFlagParams.optionalString('Creations as JSON: {"<creationId>": {...object...}}'),
      updateJson: cliScalarFlagParams.optionalString('Updates as JSON: {"<id>": {...patch...}}'),
      destroy: cliScalarFlagParams.optionalStringList("Comma-separated ids to destroy"),
    },
  },
  docs: { brief: "x:SpamRule/set — create, update and/or destroy SpamRule objects" },
})

const spamSettingsGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { properties?: string[] }) {
    await cliRunApi(this, flags, (config) => spamSettingsGet({ config, properties: flags.properties }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:SpamSettings/get — fetch SpamSettings (singletons: the singleton)" },
})

const spamSettingsSetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { updateJson: string }) {
    const op = "spamSettingsSet"
    const update = flagJson(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      spamSettingsSet({
        config,
        update: update as Record<string, Record<string, unknown>>,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      updateJson: cliScalarFlagParams.requiredString('Update as JSON: {"singleton": {"prop": value}}'),
    },
  },
  docs: { brief: "x:SpamSettings/set — update the SpamSettings singleton" },
})

const spamTagGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { ids?: string[]; properties?: string[] }) {
    await cliRunApi(this, flags, (config) => spamTagGet({ config, ids: flags.ids, properties: flags.properties }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      ids: cliScalarFlagParams.optionalStringList("Comma-separated ids to fetch (default: all)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:SpamTag/get — fetch SpamTag objects" },
})

const spamTagQueryCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { filterJson?: string; sortJson?: string; limit?: number; position?: number },
  ) {
    const op = "spamTagQuery"
    const filter = flagJson(op, "filterJson", flags.filterJson)
    const sort = flagJson(op, "sortJson", flags.sortJson)
    await cliRunApi(this, flags, (config) =>
      spamTagQuery({
        config,
        filter: filter as Record<string, string | number | boolean | null> | undefined,
        sort: sort as { property: string; isAscending?: boolean }[] | undefined,
        limit: flags.limit,
        position: flags.position,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      filterJson: cliScalarFlagParams.optionalString("Filter as JSON (AND of property matches)"),
      sortJson: cliScalarFlagParams.optionalString('Sort as JSON array, e.g. [{"property":"name"}]'),
      limit: cliScalarFlagParams.optionalNumber("Max ids to return"),
      position: cliScalarFlagParams.optionalNumber("Zero-based start position"),
    },
  },
  docs: { brief: "x:SpamTag/query — list SpamTag ids" },
})

const spamTagSetCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { createJson?: string; updateJson?: string; destroy?: string[] },
  ) {
    const op = "spamTagSet"
    const create = flagJson(op, "createJson", flags.createJson)
    const update = flagJson(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      spamTagSet({
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
      createJson: cliScalarFlagParams.optionalString('Creations as JSON: {"<creationId>": {...object...}}'),
      updateJson: cliScalarFlagParams.optionalString('Updates as JSON: {"<id>": {...patch...}}'),
      destroy: cliScalarFlagParams.optionalStringList("Comma-separated ids to destroy"),
    },
  },
  docs: { brief: "x:SpamTag/set — create, update and/or destroy SpamTag objects" },
})

const spamTrainingSampleGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { ids?: string[]; properties?: string[] }) {
    await cliRunApi(this, flags, (config) =>
      spamTrainingSampleGet({ config, ids: flags.ids, properties: flags.properties }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      ids: cliScalarFlagParams.optionalStringList("Comma-separated ids to fetch (default: all)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:SpamTrainingSample/get — fetch SpamTrainingSample objects" },
})

const spamTrainingSampleQueryCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { filterJson?: string; sortJson?: string; limit?: number; position?: number },
  ) {
    const op = "spamTrainingSampleQuery"
    const filter = flagJson(op, "filterJson", flags.filterJson)
    const sort = flagJson(op, "sortJson", flags.sortJson)
    await cliRunApi(this, flags, (config) =>
      spamTrainingSampleQuery({
        config,
        filter: filter as Record<string, string | number | boolean | null> | undefined,
        sort: sort as { property: string; isAscending?: boolean }[] | undefined,
        limit: flags.limit,
        position: flags.position,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      filterJson: cliScalarFlagParams.optionalString("Filter as JSON (AND of property matches)"),
      sortJson: cliScalarFlagParams.optionalString('Sort as JSON array, e.g. [{"property":"name"}]'),
      limit: cliScalarFlagParams.optionalNumber("Max ids to return"),
      position: cliScalarFlagParams.optionalNumber("Zero-based start position"),
    },
  },
  docs: { brief: "x:SpamTrainingSample/query — list SpamTrainingSample ids" },
})

const spamTrainingSampleSetCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { createJson?: string; updateJson?: string; destroy?: string[] },
  ) {
    const op = "spamTrainingSampleSet"
    const create = flagJson(op, "createJson", flags.createJson)
    const update = flagJson(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      spamTrainingSampleSet({
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
      createJson: cliScalarFlagParams.optionalString('Creations as JSON: {"<creationId>": {...object...}}'),
      updateJson: cliScalarFlagParams.optionalString('Updates as JSON: {"<id>": {...patch...}}'),
      destroy: cliScalarFlagParams.optionalStringList("Comma-separated ids to destroy"),
    },
  },
  docs: { brief: "x:SpamTrainingSample/set — create, update and/or destroy SpamTrainingSample objects" },
})

const spamBlockedDomainQueryCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { filterJson?: string; sortJson?: string; limit?: number; position?: number },
  ) {
    const op = "spamBlockedDomainQuery"
    const filter = flagJson(op, "filterJson", flags.filterJson)
    const sort = flagJson(op, "sortJson", flags.sortJson)
    await cliRunApi(this, flags, (config) =>
      spamBlockedDomainQuery({
        config,
        filter: filter as Record<string, string | number | boolean | null> | undefined,
        sort: sort as { property: string; isAscending?: boolean }[] | undefined,
        limit: flags.limit,
        position: flags.position,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      filterJson: cliScalarFlagParams.optionalString("Filter as JSON (AND of property matches)"),
      sortJson: cliScalarFlagParams.optionalString('Sort as JSON array, e.g. [{"property":"name"}]'),
      limit: cliScalarFlagParams.optionalNumber("Max ids to return"),
      position: cliScalarFlagParams.optionalNumber("Zero-based start position"),
    },
  },
  docs: { brief: "x:MemoryLookupKey/query (namespace blocked-domains) — list MemoryLookupKey ids" },
})

const spamTrapQueryCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { filterJson?: string; sortJson?: string; limit?: number; position?: number },
  ) {
    const op = "spamTrapQuery"
    const filter = flagJson(op, "filterJson", flags.filterJson)
    const sort = flagJson(op, "sortJson", flags.sortJson)
    await cliRunApi(this, flags, (config) =>
      spamTrapQuery({
        config,
        filter: filter as Record<string, string | number | boolean | null> | undefined,
        sort: sort as { property: string; isAscending?: boolean }[] | undefined,
        limit: flags.limit,
        position: flags.position,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      filterJson: cliScalarFlagParams.optionalString("Filter as JSON (AND of property matches)"),
      sortJson: cliScalarFlagParams.optionalString('Sort as JSON array, e.g. [{"property":"name"}]'),
      limit: cliScalarFlagParams.optionalNumber("Max ids to return"),
      position: cliScalarFlagParams.optionalNumber("Zero-based start position"),
    },
  },
  docs: { brief: "x:MemoryLookupKey/query (namespace spam-traps) — list MemoryLookupKey ids" },
})

const spamTrustedDomainQueryCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { filterJson?: string; sortJson?: string; limit?: number; position?: number },
  ) {
    const op = "spamTrustedDomainQuery"
    const filter = flagJson(op, "filterJson", flags.filterJson)
    const sort = flagJson(op, "sortJson", flags.sortJson)
    await cliRunApi(this, flags, (config) =>
      spamTrustedDomainQuery({
        config,
        filter: filter as Record<string, string | number | boolean | null> | undefined,
        sort: sort as { property: string; isAscending?: boolean }[] | undefined,
        limit: flags.limit,
        position: flags.position,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      filterJson: cliScalarFlagParams.optionalString("Filter as JSON (AND of property matches)"),
      sortJson: cliScalarFlagParams.optionalString('Sort as JSON array, e.g. [{"property":"name"}]'),
      limit: cliScalarFlagParams.optionalNumber("Max ids to return"),
      position: cliScalarFlagParams.optionalNumber("Zero-based start position"),
    },
  },
  docs: { brief: "x:MemoryLookupKey/query (namespace trusted-domains) — list MemoryLookupKey ids" },
})

const spamUrlRedirectorQueryCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { filterJson?: string; sortJson?: string; limit?: number; position?: number },
  ) {
    const op = "spamUrlRedirectorQuery"
    const filter = flagJson(op, "filterJson", flags.filterJson)
    const sort = flagJson(op, "sortJson", flags.sortJson)
    await cliRunApi(this, flags, (config) =>
      spamUrlRedirectorQuery({
        config,
        filter: filter as Record<string, string | number | boolean | null> | undefined,
        sort: sort as { property: string; isAscending?: boolean }[] | undefined,
        limit: flags.limit,
        position: flags.position,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      filterJson: cliScalarFlagParams.optionalString("Filter as JSON (AND of property matches)"),
      sortJson: cliScalarFlagParams.optionalString('Sort as JSON array, e.g. [{"property":"name"}]'),
      limit: cliScalarFlagParams.optionalNumber("Max ids to return"),
      position: cliScalarFlagParams.optionalNumber("Zero-based start position"),
    },
  },
  docs: { brief: "x:MemoryLookupKey/query (namespace url-redirectors) — list MemoryLookupKey ids" },
})

const spamClassifierSubCommands = buildRouteMap({
  routes: { get: spamClassifierGetCommand, set: spamClassifierSetCommand },
  docs: { brief: "SpamClassifier objects" },
})

const spamDnsblServerSubCommands = buildRouteMap({
  routes: { get: spamDnsblServerGetCommand, query: spamDnsblServerQueryCommand, set: spamDnsblServerSetCommand },
  docs: { brief: "SpamDnsblServer objects" },
})

const spamDnsblSettingsSubCommands = buildRouteMap({
  routes: { get: spamDnsblSettingsGetCommand, set: spamDnsblSettingsSetCommand },
  docs: { brief: "SpamDnsblSettings objects" },
})

const spamFileExtensionSubCommands = buildRouteMap({
  routes: { get: spamFileExtensionGetCommand, query: spamFileExtensionQueryCommand, set: spamFileExtensionSetCommand },
  docs: { brief: "SpamFileExtension objects" },
})

const spamLlmSubCommands = buildRouteMap({
  routes: { get: spamLlmGetCommand, set: spamLlmSetCommand },
  docs: { brief: "SpamLlm objects" },
})

const spamPyzorSubCommands = buildRouteMap({
  routes: { get: spamPyzorGetCommand, set: spamPyzorSetCommand },
  docs: { brief: "SpamPyzor objects" },
})

const spamRuleSubCommands = buildRouteMap({
  routes: { get: spamRuleGetCommand, query: spamRuleQueryCommand, set: spamRuleSetCommand },
  docs: { brief: "SpamRule objects" },
})

const spamSettingsSubCommands = buildRouteMap({
  routes: { get: spamSettingsGetCommand, set: spamSettingsSetCommand },
  docs: { brief: "SpamSettings objects" },
})

const spamTagSubCommands = buildRouteMap({
  routes: { get: spamTagGetCommand, query: spamTagQueryCommand, set: spamTagSetCommand },
  docs: { brief: "SpamTag objects" },
})

const spamTrainingSampleSubCommands = buildRouteMap({
  routes: {
    get: spamTrainingSampleGetCommand,
    query: spamTrainingSampleQueryCommand,
    set: spamTrainingSampleSetCommand,
  },
  docs: { brief: "SpamTrainingSample objects" },
})

const spamBlockedDomainQuerySubCommands = buildRouteMap({
  routes: { query: spamBlockedDomainQueryCommand },
  docs: { brief: "Blocked domain names" },
})

const spamTrapQuerySubCommands = buildRouteMap({
  routes: { query: spamTrapQueryCommand },
  docs: { brief: "Spam trap addresses" },
})

const spamTrustedDomainQuerySubCommands = buildRouteMap({
  routes: { query: spamTrustedDomainQueryCommand },
  docs: { brief: "Trusted domain names" },
})

const spamUrlRedirectorQuerySubCommands = buildRouteMap({
  routes: { query: spamUrlRedirectorQueryCommand },
  docs: { brief: "URL redirector domains" },
})

export const spamCommands = buildRouteMap({
  routes: {
    classifier: spamClassifierSubCommands,
    "dnsbl-server": spamDnsblServerSubCommands,
    "dnsbl-settings": spamDnsblSettingsSubCommands,
    "file-extension": spamFileExtensionSubCommands,
    llm: spamLlmSubCommands,
    pyzor: spamPyzorSubCommands,
    rule: spamRuleSubCommands,
    settings: spamSettingsSubCommands,
    tag: spamTagSubCommands,
    "training-sample": spamTrainingSampleSubCommands,
    "blocked-domain": spamBlockedDomainQuerySubCommands,
    trap: spamTrapQuerySubCommands,
    "trusted-domain": spamTrustedDomainQuerySubCommands,
    "url-redirector": spamUrlRedirectorQuerySubCommands,
  },
  docs: { brief: "Spam filtering management (classifier, DNSBL, rules, tags, samples)" },
})
