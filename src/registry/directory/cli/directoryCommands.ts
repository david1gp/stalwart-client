import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { cliConfigFlagParams } from "../../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../../cli/cliConfigFlags.js"
import { cliFail } from "../../../cli/cliFail.js"
import { cliJsonParse } from "../../../cli/cliJsonParse.js"
import { cliRunApi } from "../../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../../cli/cliScalarFlagParams.js"
import { accountGet } from "../accountGet.js"
import { accountQuery } from "../accountQuery.js"
import { accountSet } from "../accountSet.js"
import { accountCreate } from "../accountCreate.js"
import { accountUpdate } from "../accountUpdate.js"
import { accountDestroy } from "../accountDestroy.js"
import { roleGet } from "../roleGet.js"
import { roleQuery } from "../roleQuery.js"
import { roleSet } from "../roleSet.js"
import { roleCreate } from "../roleCreate.js"
import { roleUpdate } from "../roleUpdate.js"
import { roleDestroy } from "../roleDestroy.js"
import { tenantGet } from "../tenantGet.js"
import { tenantQuery } from "../tenantQuery.js"
import { tenantSet } from "../tenantSet.js"
import { tenantCreate } from "../tenantCreate.js"
import { tenantUpdate } from "../tenantUpdate.js"
import { tenantDestroy } from "../tenantDestroy.js"
import { mailingListGet } from "../mailingListGet.js"
import { mailingListQuery } from "../mailingListQuery.js"
import { mailingListSet } from "../mailingListSet.js"
import { mailingListCreate } from "../mailingListCreate.js"
import { mailingListUpdate } from "../mailingListUpdate.js"
import { mailingListDestroy } from "../mailingListDestroy.js"
import { oauthClientGet } from "../oauthClientGet.js"
import { oauthClientQuery } from "../oauthClientQuery.js"
import { oauthClientSet } from "../oauthClientSet.js"
import { oauthClientCreate } from "../oauthClientCreate.js"
import { oauthClientUpdate } from "../oauthClientUpdate.js"
import { oauthClientDestroy } from "../oauthClientDestroy.js"
import { apiKeyGet } from "../apiKeyGet.js"
import { apiKeyQuery } from "../apiKeyQuery.js"
import { apiKeySet } from "../apiKeySet.js"
import { apiKeyCreate } from "../apiKeyCreate.js"
import { apiKeyUpdate } from "../apiKeyUpdate.js"
import { apiKeyDestroy } from "../apiKeyDestroy.js"
import { appPasswordGet } from "../appPasswordGet.js"
import { appPasswordQuery } from "../appPasswordQuery.js"
import { appPasswordSet } from "../appPasswordSet.js"
import { appPasswordCreate } from "../appPasswordCreate.js"
import { appPasswordUpdate } from "../appPasswordUpdate.js"
import { appPasswordDestroy } from "../appPasswordDestroy.js"
import { maskedEmailGet } from "../maskedEmailGet.js"
import { maskedEmailQuery } from "../maskedEmailQuery.js"
import { maskedEmailSet } from "../maskedEmailSet.js"
import { maskedEmailCreate } from "../maskedEmailCreate.js"
import { maskedEmailUpdate } from "../maskedEmailUpdate.js"
import { maskedEmailDestroy } from "../maskedEmailDestroy.js"
import { publicKeyGet } from "../publicKeyGet.js"
import { publicKeyQuery } from "../publicKeyQuery.js"
import { publicKeySet } from "../publicKeySet.js"
import { publicKeyCreate } from "../publicKeyCreate.js"
import { publicKeyUpdate } from "../publicKeyUpdate.js"
import { publicKeyDestroy } from "../publicKeyDestroy.js"
import { directoryGet } from "../directoryGet.js"
import { directoryQuery } from "../directoryQuery.js"
import { directorySet } from "../directorySet.js"
import { directoryCreate } from "../directoryCreate.js"
import { directoryUpdate } from "../directoryUpdate.js"
import { directoryDestroy } from "../directoryDestroy.js"
import { accountPasswordGet } from "../accountPasswordGet.js"
import { accountPasswordUpdate } from "../accountPasswordUpdate.js"
import { accountSettingsGet } from "../accountSettingsGet.js"
import { accountSettingsUpdate } from "../accountSettingsUpdate.js"
import { authenticationGet } from "../authenticationGet.js"
import { authenticationUpdate } from "../authenticationUpdate.js"
import { oidcProviderGet } from "../oidcProviderGet.js"
import { oidcProviderUpdate } from "../oidcProviderUpdate.js"
import { userQuery } from "../userQuery.js"
import { groupQuery } from "../groupQuery.js"
import { userCreate } from "../userCreate.js"
import { groupCreate } from "../groupCreate.js"
import { accountByEmail } from "../accountByEmail.js"
import { accountPasswordChange } from "../accountPasswordChange.js"

function jsonFlagRead(op: string, flag: string, value: string | undefined): Record<string, unknown> | undefined {
  if (value === undefined) return undefined
  const parsed = cliJsonParse(value, op, flag)
  if (!parsed.success) cliFail(parsed)
  return parsed.data as Record<string, unknown>
}

const accountGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { ids?: string[]; properties?: string[] }) {
    await cliRunApi(this, flags, (config) => accountGet({ config, ids: flags.ids, properties: flags.properties }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      ids: cliScalarFlagParams.optionalStringList("Comma-separated ids (default: all)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:Account/get — fetch Account entries" },
})

const accountQueryCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { filterJson?: string; sortJson?: string; limit?: number; position?: number },
  ) {
    const op = "accountQuery"
    const filter = jsonFlagRead(op, "filterJson", flags.filterJson)
    const sort = jsonFlagRead(op, "sortJson", flags.sortJson)
    await cliRunApi(this, flags, (config) =>
      accountQuery({
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
  docs: { brief: "x:Account/query — list Account ids" },
})

const accountSetCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { createJson?: string; updateJson?: string; destroy?: string[] },
  ) {
    const op = "accountSet"
    const create = jsonFlagRead(op, "createJson", flags.createJson)
    const update = jsonFlagRead(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      accountSet({
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
  docs: { brief: "x:Account/set — create, update and/or destroy Account entries" },
})

const accountCreateCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { createJson: string }) {
    const op = "accountCreate"
    const payload = jsonFlagRead(op, "createJson", flags.createJson)
    if (payload === undefined) cliFail({ op: "accountCreate", errorMessage: "--createJson is required" })
    await cliRunApi(this, flags, (config) => accountCreate({ config, account: payload as Record<string, unknown> }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      createJson: cliScalarFlagParams.requiredString("New Account object as JSON"),
    },
  },
  docs: { brief: "x:Account/set — create one Account entry" },
})

const accountUpdateCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: string; patchJson: string }) {
    const op = "accountUpdate"
    const patch = jsonFlagRead(op, "patchJson", flags.patchJson)
    if (patch === undefined) cliFail({ op: "accountUpdate", errorMessage: "--patchJson is required" })
    await cliRunApi(this, flags, (config) =>
      accountUpdate({ config, id: flags.id, patch: patch as Record<string, unknown> }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("Account entry id"),
      patchJson: cliScalarFlagParams.requiredString("Patch as JSON"),
    },
  },
  docs: { brief: "x:Account/set — update one Account entry" },
})

const accountDestroyCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: string }) {
    await cliRunApi(this, flags, (config) => accountDestroy({ config, id: flags.id }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("Account entry id"),
    },
  },
  docs: { brief: "x:Account/set — destroy one Account entry" },
})

const roleGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { ids?: string[]; properties?: string[] }) {
    await cliRunApi(this, flags, (config) => roleGet({ config, ids: flags.ids, properties: flags.properties }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      ids: cliScalarFlagParams.optionalStringList("Comma-separated ids (default: all)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:Role/get — fetch Role entries" },
})

const roleQueryCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { filterJson?: string; sortJson?: string; limit?: number; position?: number },
  ) {
    const op = "roleQuery"
    const filter = jsonFlagRead(op, "filterJson", flags.filterJson)
    const sort = jsonFlagRead(op, "sortJson", flags.sortJson)
    await cliRunApi(this, flags, (config) =>
      roleQuery({
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
  docs: { brief: "x:Role/query — list Role ids" },
})

const roleSetCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { createJson?: string; updateJson?: string; destroy?: string[] },
  ) {
    const op = "roleSet"
    const create = jsonFlagRead(op, "createJson", flags.createJson)
    const update = jsonFlagRead(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      roleSet({
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
  docs: { brief: "x:Role/set — create, update and/or destroy Role entries" },
})

const roleCreateCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { createJson: string }) {
    const op = "roleCreate"
    const payload = jsonFlagRead(op, "createJson", flags.createJson)
    if (payload === undefined) cliFail({ op: "roleCreate", errorMessage: "--createJson is required" })
    await cliRunApi(this, flags, (config) => roleCreate({ config, role: payload as Record<string, unknown> }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      createJson: cliScalarFlagParams.requiredString("New Role object as JSON"),
    },
  },
  docs: { brief: "x:Role/set — create one Role entry" },
})

const roleUpdateCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: string; patchJson: string }) {
    const op = "roleUpdate"
    const patch = jsonFlagRead(op, "patchJson", flags.patchJson)
    if (patch === undefined) cliFail({ op: "roleUpdate", errorMessage: "--patchJson is required" })
    await cliRunApi(this, flags, (config) =>
      roleUpdate({ config, id: flags.id, patch: patch as Record<string, unknown> }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("Role entry id"),
      patchJson: cliScalarFlagParams.requiredString("Patch as JSON"),
    },
  },
  docs: { brief: "x:Role/set — update one Role entry" },
})

const roleDestroyCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: string }) {
    await cliRunApi(this, flags, (config) => roleDestroy({ config, id: flags.id }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("Role entry id"),
    },
  },
  docs: { brief: "x:Role/set — destroy one Role entry" },
})

const tenantGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { ids?: string[]; properties?: string[] }) {
    await cliRunApi(this, flags, (config) => tenantGet({ config, ids: flags.ids, properties: flags.properties }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      ids: cliScalarFlagParams.optionalStringList("Comma-separated ids (default: all)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:Tenant/get — fetch Tenant entries" },
})

const tenantQueryCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { filterJson?: string; sortJson?: string; limit?: number; position?: number },
  ) {
    const op = "tenantQuery"
    const filter = jsonFlagRead(op, "filterJson", flags.filterJson)
    const sort = jsonFlagRead(op, "sortJson", flags.sortJson)
    await cliRunApi(this, flags, (config) =>
      tenantQuery({
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
  docs: { brief: "x:Tenant/query — list Tenant ids" },
})

const tenantSetCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { createJson?: string; updateJson?: string; destroy?: string[] },
  ) {
    const op = "tenantSet"
    const create = jsonFlagRead(op, "createJson", flags.createJson)
    const update = jsonFlagRead(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      tenantSet({
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
  docs: { brief: "x:Tenant/set — create, update and/or destroy Tenant entries" },
})

const tenantCreateCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { createJson: string }) {
    const op = "tenantCreate"
    const payload = jsonFlagRead(op, "createJson", flags.createJson)
    if (payload === undefined) cliFail({ op: "tenantCreate", errorMessage: "--createJson is required" })
    await cliRunApi(this, flags, (config) => tenantCreate({ config, tenant: payload as Record<string, unknown> }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      createJson: cliScalarFlagParams.requiredString("New Tenant object as JSON"),
    },
  },
  docs: { brief: "x:Tenant/set — create one Tenant entry" },
})

const tenantUpdateCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: string; patchJson: string }) {
    const op = "tenantUpdate"
    const patch = jsonFlagRead(op, "patchJson", flags.patchJson)
    if (patch === undefined) cliFail({ op: "tenantUpdate", errorMessage: "--patchJson is required" })
    await cliRunApi(this, flags, (config) =>
      tenantUpdate({ config, id: flags.id, patch: patch as Record<string, unknown> }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("Tenant entry id"),
      patchJson: cliScalarFlagParams.requiredString("Patch as JSON"),
    },
  },
  docs: { brief: "x:Tenant/set — update one Tenant entry" },
})

const tenantDestroyCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: string }) {
    await cliRunApi(this, flags, (config) => tenantDestroy({ config, id: flags.id }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("Tenant entry id"),
    },
  },
  docs: { brief: "x:Tenant/set — destroy one Tenant entry" },
})

const mailingListGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { ids?: string[]; properties?: string[] }) {
    await cliRunApi(this, flags, (config) => mailingListGet({ config, ids: flags.ids, properties: flags.properties }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      ids: cliScalarFlagParams.optionalStringList("Comma-separated ids (default: all)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:MailingList/get — fetch MailingList entries" },
})

const mailingListQueryCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { filterJson?: string; sortJson?: string; limit?: number; position?: number },
  ) {
    const op = "mailingListQuery"
    const filter = jsonFlagRead(op, "filterJson", flags.filterJson)
    const sort = jsonFlagRead(op, "sortJson", flags.sortJson)
    await cliRunApi(this, flags, (config) =>
      mailingListQuery({
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
  docs: { brief: "x:MailingList/query — list MailingList ids" },
})

const mailingListSetCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { createJson?: string; updateJson?: string; destroy?: string[] },
  ) {
    const op = "mailingListSet"
    const create = jsonFlagRead(op, "createJson", flags.createJson)
    const update = jsonFlagRead(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      mailingListSet({
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
  docs: { brief: "x:MailingList/set — create, update and/or destroy MailingList entries" },
})

const mailingListCreateCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { createJson: string }) {
    const op = "mailingListCreate"
    const payload = jsonFlagRead(op, "createJson", flags.createJson)
    if (payload === undefined) cliFail({ op: "mailingListCreate", errorMessage: "--createJson is required" })
    await cliRunApi(this, flags, (config) =>
      mailingListCreate({ config, mailingList: payload as Record<string, unknown> }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      createJson: cliScalarFlagParams.requiredString("New MailingList object as JSON"),
    },
  },
  docs: { brief: "x:MailingList/set — create one MailingList entry" },
})

const mailingListUpdateCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: string; patchJson: string }) {
    const op = "mailingListUpdate"
    const patch = jsonFlagRead(op, "patchJson", flags.patchJson)
    if (patch === undefined) cliFail({ op: "mailingListUpdate", errorMessage: "--patchJson is required" })
    await cliRunApi(this, flags, (config) =>
      mailingListUpdate({ config, id: flags.id, patch: patch as Record<string, unknown> }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("MailingList entry id"),
      patchJson: cliScalarFlagParams.requiredString("Patch as JSON"),
    },
  },
  docs: { brief: "x:MailingList/set — update one MailingList entry" },
})

const mailingListDestroyCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: string }) {
    await cliRunApi(this, flags, (config) => mailingListDestroy({ config, id: flags.id }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("MailingList entry id"),
    },
  },
  docs: { brief: "x:MailingList/set — destroy one MailingList entry" },
})

const oauthClientGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { ids?: string[]; properties?: string[] }) {
    await cliRunApi(this, flags, (config) => oauthClientGet({ config, ids: flags.ids, properties: flags.properties }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      ids: cliScalarFlagParams.optionalStringList("Comma-separated ids (default: all)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:OAuthClient/get — fetch OAuthClient entries" },
})

const oauthClientQueryCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { filterJson?: string; sortJson?: string; limit?: number; position?: number },
  ) {
    const op = "oauthClientQuery"
    const filter = jsonFlagRead(op, "filterJson", flags.filterJson)
    const sort = jsonFlagRead(op, "sortJson", flags.sortJson)
    await cliRunApi(this, flags, (config) =>
      oauthClientQuery({
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
  docs: { brief: "x:OAuthClient/query — list OAuthClient ids" },
})

const oauthClientSetCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { createJson?: string; updateJson?: string; destroy?: string[] },
  ) {
    const op = "oauthClientSet"
    const create = jsonFlagRead(op, "createJson", flags.createJson)
    const update = jsonFlagRead(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      oauthClientSet({
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
  docs: { brief: "x:OAuthClient/set — create, update and/or destroy OAuthClient entries" },
})

const oauthClientCreateCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { createJson: string }) {
    const op = "oauthClientCreate"
    const payload = jsonFlagRead(op, "createJson", flags.createJson)
    if (payload === undefined) cliFail({ op: "oauthClientCreate", errorMessage: "--createJson is required" })
    await cliRunApi(this, flags, (config) =>
      oauthClientCreate({ config, oauthClient: payload as Record<string, unknown> }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      createJson: cliScalarFlagParams.requiredString("New OAuthClient object as JSON"),
    },
  },
  docs: { brief: "x:OAuthClient/set — create one OAuthClient entry" },
})

const oauthClientUpdateCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: string; patchJson: string }) {
    const op = "oauthClientUpdate"
    const patch = jsonFlagRead(op, "patchJson", flags.patchJson)
    if (patch === undefined) cliFail({ op: "oauthClientUpdate", errorMessage: "--patchJson is required" })
    await cliRunApi(this, flags, (config) =>
      oauthClientUpdate({ config, id: flags.id, patch: patch as Record<string, unknown> }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("OAuthClient entry id"),
      patchJson: cliScalarFlagParams.requiredString("Patch as JSON"),
    },
  },
  docs: { brief: "x:OAuthClient/set — update one OAuthClient entry" },
})

const oauthClientDestroyCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: string }) {
    await cliRunApi(this, flags, (config) => oauthClientDestroy({ config, id: flags.id }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("OAuthClient entry id"),
    },
  },
  docs: { brief: "x:OAuthClient/set — destroy one OAuthClient entry" },
})

const apiKeyGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { ids?: string[]; properties?: string[] }) {
    await cliRunApi(this, flags, (config) => apiKeyGet({ config, ids: flags.ids, properties: flags.properties }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      ids: cliScalarFlagParams.optionalStringList("Comma-separated ids (default: all)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:ApiKey/get — fetch ApiKey entries" },
})

const apiKeyQueryCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { filterJson?: string; sortJson?: string; limit?: number; position?: number },
  ) {
    const op = "apiKeyQuery"
    const filter = jsonFlagRead(op, "filterJson", flags.filterJson)
    const sort = jsonFlagRead(op, "sortJson", flags.sortJson)
    await cliRunApi(this, flags, (config) =>
      apiKeyQuery({
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
  docs: { brief: "x:ApiKey/query — list ApiKey ids" },
})

const apiKeySetCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { createJson?: string; updateJson?: string; destroy?: string[] },
  ) {
    const op = "apiKeySet"
    const create = jsonFlagRead(op, "createJson", flags.createJson)
    const update = jsonFlagRead(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      apiKeySet({
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
  docs: { brief: "x:ApiKey/set — create, update and/or destroy ApiKey entries" },
})

const apiKeyCreateCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & {
      description?: string
      expiresAt?: string
      permissionsJson?: string
      ownerAccountId?: string
    },
  ) {
    const op = "apiKeyCreate"
    const permissions = jsonFlagRead(op, "permissionsJson", flags.permissionsJson)
    await cliRunApi(this, flags, (config) =>
      apiKeyCreate({
        config,
        ...(flags.ownerAccountId !== undefined ? { accountId: flags.ownerAccountId } : {}),
        ...(flags.description !== undefined ? { description: flags.description } : {}),
        ...(flags.expiresAt !== undefined ? { expiresAt: flags.expiresAt } : {}),
        ...(permissions !== undefined ? { permissions: permissions as Record<string, unknown> } : {}),
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      description: cliScalarFlagParams.optionalString("Credential description"),
      expiresAt: cliScalarFlagParams.optionalString("Expiration date-time"),
      permissionsJson: cliScalarFlagParams.optionalString("Permissions as JSON (default: inherit account permissions)"),
      ownerAccountId: cliScalarFlagParams.optionalString("Owning account id (default: your own account)"),
    },
  },
  docs: { brief: "x:ApiKey/set — create one API key (returns the secret once)" },
})

const apiKeyUpdateCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: string; patchJson: string; ownerAccountId?: string }) {
    const op = "apiKeyUpdate"
    const patch = jsonFlagRead(op, "patchJson", flags.patchJson)
    if (patch === undefined) cliFail({ op: "apiKeyUpdate", errorMessage: "--patchJson is required" })
    await cliRunApi(this, flags, (config) =>
      apiKeyUpdate({
        config,
        id: flags.id,
        patch: patch as Record<string, unknown>,
        ...(flags.ownerAccountId !== undefined ? { accountId: flags.ownerAccountId } : {}),
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("ApiKey entry id"),
      ownerAccountId: cliScalarFlagParams.optionalString("Owning account id (default: your own account)"),
      patchJson: cliScalarFlagParams.requiredString("Patch as JSON"),
    },
  },
  docs: { brief: "x:ApiKey/set — update one ApiKey entry" },
})

const apiKeyDestroyCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: string; ownerAccountId?: string }) {
    await cliRunApi(this, flags, (config) =>
      apiKeyDestroy({
        config,
        id: flags.id,
        ...(flags.ownerAccountId !== undefined ? { accountId: flags.ownerAccountId } : {}),
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("ApiKey entry id"),
      ownerAccountId: cliScalarFlagParams.optionalString("Owning account id (default: your own account)"),
    },
  },
  docs: { brief: "x:ApiKey/set — destroy one ApiKey entry" },
})

const appPasswordGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { ids?: string[]; properties?: string[] }) {
    await cliRunApi(this, flags, (config) => appPasswordGet({ config, ids: flags.ids, properties: flags.properties }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      ids: cliScalarFlagParams.optionalStringList("Comma-separated ids (default: all)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:AppPassword/get — fetch AppPassword entries" },
})

const appPasswordQueryCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { filterJson?: string; sortJson?: string; limit?: number; position?: number },
  ) {
    const op = "appPasswordQuery"
    const filter = jsonFlagRead(op, "filterJson", flags.filterJson)
    const sort = jsonFlagRead(op, "sortJson", flags.sortJson)
    await cliRunApi(this, flags, (config) =>
      appPasswordQuery({
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
  docs: { brief: "x:AppPassword/query — list AppPassword ids" },
})

const appPasswordSetCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { createJson?: string; updateJson?: string; destroy?: string[] },
  ) {
    const op = "appPasswordSet"
    const create = jsonFlagRead(op, "createJson", flags.createJson)
    const update = jsonFlagRead(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      appPasswordSet({
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
  docs: { brief: "x:AppPassword/set — create, update and/or destroy AppPassword entries" },
})

const appPasswordCreateCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & {
      description?: string
      expiresAt?: string
      permissionsJson?: string
      ownerAccountId?: string
    },
  ) {
    const op = "appPasswordCreate"
    const permissions = jsonFlagRead(op, "permissionsJson", flags.permissionsJson)
    await cliRunApi(this, flags, (config) =>
      appPasswordCreate({
        config,
        ...(flags.ownerAccountId !== undefined ? { accountId: flags.ownerAccountId } : {}),
        ...(flags.description !== undefined ? { description: flags.description } : {}),
        ...(flags.expiresAt !== undefined ? { expiresAt: flags.expiresAt } : {}),
        ...(permissions !== undefined ? { permissions: permissions as Record<string, unknown> } : {}),
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      description: cliScalarFlagParams.optionalString("Credential description"),
      expiresAt: cliScalarFlagParams.optionalString("Expiration date-time"),
      permissionsJson: cliScalarFlagParams.optionalString("Permissions as JSON (default: inherit account permissions)"),
      ownerAccountId: cliScalarFlagParams.optionalString("Owning account id (default: your own account)"),
    },
  },
  docs: { brief: "x:AppPassword/set — create one app password (returns the secret once)" },
})

const appPasswordUpdateCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: string; patchJson: string; ownerAccountId?: string }) {
    const op = "appPasswordUpdate"
    const patch = jsonFlagRead(op, "patchJson", flags.patchJson)
    if (patch === undefined) cliFail({ op: "appPasswordUpdate", errorMessage: "--patchJson is required" })
    await cliRunApi(this, flags, (config) =>
      appPasswordUpdate({
        config,
        id: flags.id,
        patch: patch as Record<string, unknown>,
        ...(flags.ownerAccountId !== undefined ? { accountId: flags.ownerAccountId } : {}),
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("AppPassword entry id"),
      ownerAccountId: cliScalarFlagParams.optionalString("Owning account id (default: your own account)"),
      patchJson: cliScalarFlagParams.requiredString("Patch as JSON"),
    },
  },
  docs: { brief: "x:AppPassword/set — update one AppPassword entry" },
})

const appPasswordDestroyCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: string; ownerAccountId?: string }) {
    await cliRunApi(this, flags, (config) =>
      appPasswordDestroy({
        config,
        id: flags.id,
        ...(flags.ownerAccountId !== undefined ? { accountId: flags.ownerAccountId } : {}),
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("AppPassword entry id"),
      ownerAccountId: cliScalarFlagParams.optionalString("Owning account id (default: your own account)"),
    },
  },
  docs: { brief: "x:AppPassword/set — destroy one AppPassword entry" },
})

const maskedEmailGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { ids?: string[]; properties?: string[] }) {
    await cliRunApi(this, flags, (config) => maskedEmailGet({ config, ids: flags.ids, properties: flags.properties }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      ids: cliScalarFlagParams.optionalStringList("Comma-separated ids (default: all)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:MaskedEmail/get — fetch MaskedEmail entries" },
})

const maskedEmailQueryCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { filterJson?: string; sortJson?: string; limit?: number; position?: number },
  ) {
    const op = "maskedEmailQuery"
    const filter = jsonFlagRead(op, "filterJson", flags.filterJson)
    const sort = jsonFlagRead(op, "sortJson", flags.sortJson)
    await cliRunApi(this, flags, (config) =>
      maskedEmailQuery({
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
  docs: { brief: "x:MaskedEmail/query — list MaskedEmail ids" },
})

const maskedEmailSetCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { createJson?: string; updateJson?: string; destroy?: string[] },
  ) {
    const op = "maskedEmailSet"
    const create = jsonFlagRead(op, "createJson", flags.createJson)
    const update = jsonFlagRead(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      maskedEmailSet({
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
  docs: { brief: "x:MaskedEmail/set — create, update and/or destroy MaskedEmail entries" },
})

const maskedEmailCreateCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { createJson: string }) {
    const op = "maskedEmailCreate"
    const payload = jsonFlagRead(op, "createJson", flags.createJson)
    if (payload === undefined) cliFail({ op: "maskedEmailCreate", errorMessage: "--createJson is required" })
    await cliRunApi(this, flags, (config) =>
      maskedEmailCreate({ config, maskedEmail: payload as Record<string, unknown> }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      createJson: cliScalarFlagParams.requiredString("New MaskedEmail object as JSON"),
    },
  },
  docs: { brief: "x:MaskedEmail/set — create one MaskedEmail entry" },
})

const maskedEmailUpdateCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: string; patchJson: string }) {
    const op = "maskedEmailUpdate"
    const patch = jsonFlagRead(op, "patchJson", flags.patchJson)
    if (patch === undefined) cliFail({ op: "maskedEmailUpdate", errorMessage: "--patchJson is required" })
    await cliRunApi(this, flags, (config) =>
      maskedEmailUpdate({ config, id: flags.id, patch: patch as Record<string, unknown> }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("MaskedEmail entry id"),
      patchJson: cliScalarFlagParams.requiredString("Patch as JSON"),
    },
  },
  docs: { brief: "x:MaskedEmail/set — update one MaskedEmail entry" },
})

const maskedEmailDestroyCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: string }) {
    await cliRunApi(this, flags, (config) => maskedEmailDestroy({ config, id: flags.id }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("MaskedEmail entry id"),
    },
  },
  docs: { brief: "x:MaskedEmail/set — destroy one MaskedEmail entry" },
})

const publicKeyGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { ids?: string[]; properties?: string[] }) {
    await cliRunApi(this, flags, (config) => publicKeyGet({ config, ids: flags.ids, properties: flags.properties }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      ids: cliScalarFlagParams.optionalStringList("Comma-separated ids (default: all)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:PublicKey/get — fetch PublicKey entries" },
})

const publicKeyQueryCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { filterJson?: string; sortJson?: string; limit?: number; position?: number },
  ) {
    const op = "publicKeyQuery"
    const filter = jsonFlagRead(op, "filterJson", flags.filterJson)
    const sort = jsonFlagRead(op, "sortJson", flags.sortJson)
    await cliRunApi(this, flags, (config) =>
      publicKeyQuery({
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
  docs: { brief: "x:PublicKey/query — list PublicKey ids" },
})

const publicKeySetCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { createJson?: string; updateJson?: string; destroy?: string[] },
  ) {
    const op = "publicKeySet"
    const create = jsonFlagRead(op, "createJson", flags.createJson)
    const update = jsonFlagRead(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      publicKeySet({
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
  docs: { brief: "x:PublicKey/set — create, update and/or destroy PublicKey entries" },
})

const publicKeyCreateCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { createJson: string }) {
    const op = "publicKeyCreate"
    const payload = jsonFlagRead(op, "createJson", flags.createJson)
    if (payload === undefined) cliFail({ op: "publicKeyCreate", errorMessage: "--createJson is required" })
    await cliRunApi(this, flags, (config) => publicKeyCreate({ config, publicKey: payload as Record<string, unknown> }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      createJson: cliScalarFlagParams.requiredString("New PublicKey object as JSON"),
    },
  },
  docs: { brief: "x:PublicKey/set — create one PublicKey entry" },
})

const publicKeyUpdateCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: string; patchJson: string }) {
    const op = "publicKeyUpdate"
    const patch = jsonFlagRead(op, "patchJson", flags.patchJson)
    if (patch === undefined) cliFail({ op: "publicKeyUpdate", errorMessage: "--patchJson is required" })
    await cliRunApi(this, flags, (config) =>
      publicKeyUpdate({ config, id: flags.id, patch: patch as Record<string, unknown> }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("PublicKey entry id"),
      patchJson: cliScalarFlagParams.requiredString("Patch as JSON"),
    },
  },
  docs: { brief: "x:PublicKey/set — update one PublicKey entry" },
})

const publicKeyDestroyCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: string }) {
    await cliRunApi(this, flags, (config) => publicKeyDestroy({ config, id: flags.id }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("PublicKey entry id"),
    },
  },
  docs: { brief: "x:PublicKey/set — destroy one PublicKey entry" },
})

const directoryGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { ids?: string[]; properties?: string[] }) {
    await cliRunApi(this, flags, (config) => directoryGet({ config, ids: flags.ids, properties: flags.properties }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      ids: cliScalarFlagParams.optionalStringList("Comma-separated ids (default: all)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:Directory/get — fetch Directory entries" },
})

const directoryQueryCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { filterJson?: string; sortJson?: string; limit?: number; position?: number },
  ) {
    const op = "directoryQuery"
    const filter = jsonFlagRead(op, "filterJson", flags.filterJson)
    const sort = jsonFlagRead(op, "sortJson", flags.sortJson)
    await cliRunApi(this, flags, (config) =>
      directoryQuery({
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
  docs: { brief: "x:Directory/query — list Directory ids" },
})

const directorySetCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { createJson?: string; updateJson?: string; destroy?: string[] },
  ) {
    const op = "directorySet"
    const create = jsonFlagRead(op, "createJson", flags.createJson)
    const update = jsonFlagRead(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      directorySet({
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
  docs: { brief: "x:Directory/set — create, update and/or destroy Directory entries" },
})

const directoryCreateCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { createJson: string }) {
    const op = "directoryCreate"
    const payload = jsonFlagRead(op, "createJson", flags.createJson)
    if (payload === undefined) cliFail({ op: "directoryCreate", errorMessage: "--createJson is required" })
    await cliRunApi(this, flags, (config) => directoryCreate({ config, directory: payload as Record<string, unknown> }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      createJson: cliScalarFlagParams.requiredString("New Directory object as JSON"),
    },
  },
  docs: { brief: "x:Directory/set — create one Directory entry" },
})

const directoryUpdateCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: string; patchJson: string }) {
    const op = "directoryUpdate"
    const patch = jsonFlagRead(op, "patchJson", flags.patchJson)
    if (patch === undefined) cliFail({ op: "directoryUpdate", errorMessage: "--patchJson is required" })
    await cliRunApi(this, flags, (config) =>
      directoryUpdate({ config, id: flags.id, patch: patch as Record<string, unknown> }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("Directory entry id"),
      patchJson: cliScalarFlagParams.requiredString("Patch as JSON"),
    },
  },
  docs: { brief: "x:Directory/set — update one Directory entry" },
})

const directoryDestroyCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: string }) {
    await cliRunApi(this, flags, (config) => directoryDestroy({ config, id: flags.id }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("Directory entry id"),
    },
  },
  docs: { brief: "x:Directory/set — destroy one Directory entry" },
})

const accountPasswordGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { ids?: string[]; properties?: string[] }) {
    await cliRunApi(this, flags, (config) =>
      accountPasswordGet({ config, ids: flags.ids, properties: flags.properties }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      ids: cliScalarFlagParams.optionalStringList("Comma-separated ids (default: all)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:AccountPassword/get — fetch AccountPassword entries" },
})

const accountPasswordUpdateCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { patchJson: string }) {
    const op = "accountPasswordUpdate"
    const patch = jsonFlagRead(op, "patchJson", flags.patchJson)
    if (patch === undefined) cliFail({ op: "accountPasswordUpdate", errorMessage: "--patchJson is required" })
    await cliRunApi(this, flags, (config) => accountPasswordUpdate({ config, patch: patch as Record<string, unknown> }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      patchJson: cliScalarFlagParams.requiredString("Singleton AccountPassword patch as JSON"),
    },
  },
  docs: { brief: "x:AccountPassword/set — update the singleton AccountPassword object" },
})

const accountSettingsGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { ids?: string[]; properties?: string[] }) {
    await cliRunApi(this, flags, (config) =>
      accountSettingsGet({ config, ids: flags.ids, properties: flags.properties }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      ids: cliScalarFlagParams.optionalStringList("Comma-separated ids (default: all)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:AccountSettings/get — fetch AccountSettings entries" },
})

const accountSettingsUpdateCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { patchJson: string }) {
    const op = "accountSettingsUpdate"
    const patch = jsonFlagRead(op, "patchJson", flags.patchJson)
    if (patch === undefined) cliFail({ op: "accountSettingsUpdate", errorMessage: "--patchJson is required" })
    await cliRunApi(this, flags, (config) => accountSettingsUpdate({ config, patch: patch as Record<string, unknown> }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      patchJson: cliScalarFlagParams.requiredString("Singleton AccountSettings patch as JSON"),
    },
  },
  docs: { brief: "x:AccountSettings/set — update the singleton AccountSettings object" },
})

const authenticationGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { ids?: string[]; properties?: string[] }) {
    await cliRunApi(this, flags, (config) =>
      authenticationGet({ config, ids: flags.ids, properties: flags.properties }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      ids: cliScalarFlagParams.optionalStringList("Comma-separated ids (default: all)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:Authentication/get — fetch Authentication entries" },
})

const authenticationUpdateCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { patchJson: string }) {
    const op = "authenticationUpdate"
    const patch = jsonFlagRead(op, "patchJson", flags.patchJson)
    if (patch === undefined) cliFail({ op: "authenticationUpdate", errorMessage: "--patchJson is required" })
    await cliRunApi(this, flags, (config) => authenticationUpdate({ config, patch: patch as Record<string, unknown> }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      patchJson: cliScalarFlagParams.requiredString("Singleton Authentication patch as JSON"),
    },
  },
  docs: { brief: "x:Authentication/set — update the singleton Authentication object" },
})

const oidcProviderGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { ids?: string[]; properties?: string[] }) {
    await cliRunApi(this, flags, (config) => oidcProviderGet({ config, ids: flags.ids, properties: flags.properties }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      ids: cliScalarFlagParams.optionalStringList("Comma-separated ids (default: all)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:OidcProvider/get — fetch OidcProvider entries" },
})

const oidcProviderUpdateCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { patchJson: string }) {
    const op = "oidcProviderUpdate"
    const patch = jsonFlagRead(op, "patchJson", flags.patchJson)
    if (patch === undefined) cliFail({ op: "oidcProviderUpdate", errorMessage: "--patchJson is required" })
    await cliRunApi(this, flags, (config) => oidcProviderUpdate({ config, patch: patch as Record<string, unknown> }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      patchJson: cliScalarFlagParams.requiredString("Singleton OidcProvider patch as JSON"),
    },
  },
  docs: { brief: "x:OidcProvider/set — update the singleton OidcProvider object" },
})

const userQueryCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { filterJson?: string; sortJson?: string; limit?: number; position?: number },
  ) {
    const op = "userQuery"
    const filter = jsonFlagRead(op, "filterJson", flags.filterJson)
    const sort = jsonFlagRead(op, "sortJson", flags.sortJson)
    await cliRunApi(this, flags, (config) =>
      userQuery({
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
  docs: { brief: "x:Account (User view)/query — list Account (User view) ids" },
})

const groupQueryCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { filterJson?: string; sortJson?: string; limit?: number; position?: number },
  ) {
    const op = "groupQuery"
    const filter = jsonFlagRead(op, "filterJson", flags.filterJson)
    const sort = jsonFlagRead(op, "sortJson", flags.sortJson)
    await cliRunApi(this, flags, (config) =>
      groupQuery({
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
  docs: { brief: "x:Account (Group view)/query — list Account (Group view) ids" },
})

const userCreateCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & {
      name: string
      domainId: string
      password: string
      rolesJson?: string
      description?: string
    },
  ) {
    const op = "userCreate"
    const roles = jsonFlagRead(op, "rolesJson", flags.rolesJson)
    await cliRunApi(this, flags, (config) =>
      userCreate({
        config,
        name: flags.name,
        domainId: flags.domainId,
        password: flags.password,
        ...(roles !== undefined ? { roles: roles as Record<string, unknown> } : {}),
        ...(flags.description !== undefined ? { description: flags.description } : {}),
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      name: cliScalarFlagParams.requiredString("Account name (email local part)"),
      domainId: cliScalarFlagParams.requiredString("Owning domain id"),
      password: cliScalarFlagParams.requiredString("Initial password"),
      rolesJson: cliScalarFlagParams.optionalString('Roles as JSON, e.g. {"@type":"User"}'),
      description: cliScalarFlagParams.optionalString("Account description"),
    },
  },
  docs: { brief: "x:Account/set — create a User with an inline password" },
})

const groupCreateCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { name: string; domainId: string; description?: string }) {
    await cliRunApi(this, flags, (config) =>
      groupCreate({
        config,
        name: flags.name,
        domainId: flags.domainId,
        ...(flags.description !== undefined ? { description: flags.description } : {}),
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      name: cliScalarFlagParams.requiredString("Group name (email local part)"),
      domainId: cliScalarFlagParams.requiredString("Owning domain id"),
      description: cliScalarFlagParams.optionalString("Group description"),
    },
  },
  docs: { brief: "x:Account/set — create a Group" },
})

const accountGetByEmailCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { email: string }) {
    await cliRunApi(this, flags, (config) => accountByEmail({ config, email: flags.email }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      email: cliScalarFlagParams.requiredString("Full email address, e.g. alice@example.com"),
    },
  },
  docs: { brief: "Find one directory account by email address" },
})

const accountPasswordChangeCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { currentSecret: string; newSecret: string }) {
    await cliRunApi(this, flags, (config) =>
      accountPasswordChange({ config, currentSecret: flags.currentSecret, newSecret: flags.newSecret }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      currentSecret: cliScalarFlagParams.requiredString("Current password"),
      newSecret: cliScalarFlagParams.requiredString("New password"),
    },
  },
  docs: { brief: "x:AccountPassword/set — change your own password" },
})

export const directoryCommands = buildRouteMap({
  routes: {
    account: buildRouteMap({
      routes: {
        get: accountGetCommand,
        query: accountQueryCommand,
        set: accountSetCommand,
        create: accountCreateCommand,
        update: accountUpdateCommand,
        destroy: accountDestroyCommand,
        "get-by-email": accountGetByEmailCommand,
      },
      docs: { brief: "Directory Account entries" },
    }),
    role: buildRouteMap({
      routes: {
        get: roleGetCommand,
        query: roleQueryCommand,
        set: roleSetCommand,
        create: roleCreateCommand,
        update: roleUpdateCommand,
        destroy: roleDestroyCommand,
      },
      docs: { brief: "Directory Role entries" },
    }),
    tenant: buildRouteMap({
      routes: {
        get: tenantGetCommand,
        query: tenantQueryCommand,
        set: tenantSetCommand,
        create: tenantCreateCommand,
        update: tenantUpdateCommand,
        destroy: tenantDestroyCommand,
      },
      docs: { brief: "Directory Tenant entries" },
    }),
    "mailing-list": buildRouteMap({
      routes: {
        get: mailingListGetCommand,
        query: mailingListQueryCommand,
        set: mailingListSetCommand,
        create: mailingListCreateCommand,
        update: mailingListUpdateCommand,
        destroy: mailingListDestroyCommand,
      },
      docs: { brief: "Directory MailingList entries" },
    }),
    "oauth-client": buildRouteMap({
      routes: {
        get: oauthClientGetCommand,
        query: oauthClientQueryCommand,
        set: oauthClientSetCommand,
        create: oauthClientCreateCommand,
        update: oauthClientUpdateCommand,
        destroy: oauthClientDestroyCommand,
      },
      docs: { brief: "Directory OAuthClient entries" },
    }),
    "api-key": buildRouteMap({
      routes: {
        get: apiKeyGetCommand,
        query: apiKeyQueryCommand,
        set: apiKeySetCommand,
        create: apiKeyCreateCommand,
        update: apiKeyUpdateCommand,
        destroy: apiKeyDestroyCommand,
      },
      docs: { brief: "Directory ApiKey entries" },
    }),
    "app-password": buildRouteMap({
      routes: {
        get: appPasswordGetCommand,
        query: appPasswordQueryCommand,
        set: appPasswordSetCommand,
        create: appPasswordCreateCommand,
        update: appPasswordUpdateCommand,
        destroy: appPasswordDestroyCommand,
      },
      docs: { brief: "Directory AppPassword entries" },
    }),
    "masked-email": buildRouteMap({
      routes: {
        get: maskedEmailGetCommand,
        query: maskedEmailQueryCommand,
        set: maskedEmailSetCommand,
        create: maskedEmailCreateCommand,
        update: maskedEmailUpdateCommand,
        destroy: maskedEmailDestroyCommand,
      },
      docs: { brief: "Directory MaskedEmail entries" },
    }),
    "public-key": buildRouteMap({
      routes: {
        get: publicKeyGetCommand,
        query: publicKeyQueryCommand,
        set: publicKeySetCommand,
        create: publicKeyCreateCommand,
        update: publicKeyUpdateCommand,
        destroy: publicKeyDestroyCommand,
      },
      docs: { brief: "Directory PublicKey entries" },
    }),
    directory: buildRouteMap({
      routes: {
        get: directoryGetCommand,
        query: directoryQueryCommand,
        set: directorySetCommand,
        create: directoryCreateCommand,
        update: directoryUpdateCommand,
        destroy: directoryDestroyCommand,
      },
      docs: { brief: "Directory Directory entries" },
    }),
    "account-password": buildRouteMap({
      routes: {
        get: accountPasswordGetCommand,
        update: accountPasswordUpdateCommand,
        change: accountPasswordChangeCommand,
      },
      docs: { brief: "Singleton AccountPassword object" },
    }),
    "account-settings": buildRouteMap({
      routes: { get: accountSettingsGetCommand, update: accountSettingsUpdateCommand },
      docs: { brief: "Singleton AccountSettings object" },
    }),
    authentication: buildRouteMap({
      routes: { get: authenticationGetCommand, update: authenticationUpdateCommand },
      docs: { brief: "Singleton Authentication object" },
    }),
    "oidc-provider": buildRouteMap({
      routes: { get: oidcProviderGetCommand, update: oidcProviderUpdateCommand },
      docs: { brief: "Singleton OidcProvider object" },
    }),
    user: buildRouteMap({
      routes: { query: userQueryCommand, create: userCreateCommand },
      docs: { brief: "User accounts (WebUI User view)" },
    }),
    group: buildRouteMap({
      routes: { query: groupQueryCommand, create: groupCreateCommand },
      docs: { brief: "Group accounts (WebUI Group view)" },
    }),
  },
  docs: { brief: "Directory (accounts, roles, tenants, credentials) management" },
})
