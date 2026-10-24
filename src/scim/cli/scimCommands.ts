import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { scimBulk } from "../scimBulk.js"
import { scimGroupCreate } from "../scimGroupCreate.js"
import { scimGroupDelete } from "../scimGroupDelete.js"
import { scimGroupGet } from "../scimGroupGet.js"
import { scimGroupPatch } from "../scimGroupPatch.js"
import { scimGroupQuery } from "../scimGroupQuery.js"
import { scimGroupReplace } from "../scimGroupReplace.js"
import { scimGroupSearch } from "../scimGroupSearch.js"
import { scimResourceTypes } from "../scimResourceTypes.js"
import { scimSchemas } from "../scimSchemas.js"
import { scimSearchAll } from "../scimSearchAll.js"
import { scimServiceProviderConfig } from "../scimServiceProviderConfig.js"
import { scimUserCreate } from "../scimUserCreate.js"
import { scimUserDelete } from "../scimUserDelete.js"
import { scimUserGet } from "../scimUserGet.js"
import { scimUserPatch } from "../scimUserPatch.js"
import { scimUserQuery } from "../scimUserQuery.js"
import { scimUserReplace } from "../scimUserReplace.js"
import { scimUserSearch } from "../scimUserSearch.js"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliJsonFlagParam } from "../../cli/cliJsonFlagParam.js"
import { cliJsonParse } from "../../cli/cliJsonParse.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"

function scimOptionalJsonFlag(brief: string) {
  return cliJsonFlagParam(brief) as { kind: "parsed"; parse: typeof String; optional: true; brief: string }
}

function scimRequiredJsonFlag(brief: string) {
  return cliJsonFlagParam(brief, false) as { kind: "parsed"; parse: typeof String; brief: string }
}

type ScimQueryFlags = CliConfigFlags & {
  filter?: string
  sortBy?: string
  sortOrder?: "ascending" | "descending"
  startIndex?: number
  count?: number
  cursor?: string
  attributes?: string[]
  excludedAttributes?: string[]
}

const scimQueryFlagParams = {
  filter: cliScalarFlagParams.optionalString("SCIM filter expression, e.g. 'userName eq \"alice@example.test\"'"),
  sortBy: cliScalarFlagParams.optionalString("Attribute to sort by"),
  sortOrder: {
    kind: "parsed" as const,
    parse: (value: string) => value as "ascending" | "descending",
    optional: true as const,
    brief: 'Sort direction: "ascending" or "descending"',
  },
  startIndex: cliScalarFlagParams.optionalNumber("1-based start index"),
  count: cliScalarFlagParams.optionalNumber("Max resources to return"),
  cursor: cliScalarFlagParams.optionalString("Cursor for cursor-paged results"),
  attributes: cliScalarFlagParams.optionalStringList("Comma-separated attributes to return"),
  excludedAttributes: cliScalarFlagParams.optionalStringList("Comma-separated attributes to omit"),
}

function scimQueryArgs(flags: ScimQueryFlags) {
  return {
    ...(flags.filter !== undefined ? { filter: flags.filter } : {}),
    ...(flags.sortBy !== undefined ? { sortBy: flags.sortBy } : {}),
    ...(flags.sortOrder !== undefined ? { sortOrder: flags.sortOrder } : {}),
    ...(flags.startIndex !== undefined ? { startIndex: flags.startIndex } : {}),
    ...(flags.count !== undefined ? { count: flags.count } : {}),
    ...(flags.cursor !== undefined ? { cursor: flags.cursor } : {}),
    ...(flags.attributes !== undefined ? { attributes: flags.attributes } : {}),
    ...(flags.excludedAttributes !== undefined ? { excludedAttributes: flags.excludedAttributes } : {}),
  }
}

function scimAttributesFlags(flags: { attributes?: string[]; excludedAttributes?: string[] }) {
  return {
    ...(flags.attributes !== undefined ? { attributes: flags.attributes } : {}),
    ...(flags.excludedAttributes !== undefined ? { excludedAttributes: flags.excludedAttributes } : {}),
  }
}

const userQueryCommand = buildCommand({
  async func(this: CommandContext, flags: ScimQueryFlags) {
    await cliRunApi(this, flags, (config) => scimUserQuery({ config, ...scimQueryArgs(flags) }))
  },
  parameters: { flags: { ...cliConfigFlagParams, ...scimQueryFlagParams } },
  docs: { brief: "List SCIM users (GET /scim/v2/Users)" },
})

const userCreateCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { userJson: string; attributes?: string[]; excludedAttributes?: string[] },
  ) {
    const op = "scimUserCreate"
    const parsed = cliJsonParse(flags.userJson, op, "userJson")
    if (!parsed.success) cliFail(parsed)
    const user = parsed.data as Record<string, unknown>
    await cliRunApi(this, flags, (config) =>
      scimUserCreate({ config, user: user as { userName: string }, ...scimAttributesFlags(flags) }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      userJson: scimRequiredJsonFlag("New user resource as JSON (userName required)"),
      attributes: cliScalarFlagParams.optionalStringList("Comma-separated attributes to return"),
      excludedAttributes: cliScalarFlagParams.optionalStringList("Comma-separated attributes to omit"),
    },
  },
  docs: { brief: "Create a SCIM user (POST /scim/v2/Users)" },
})

const userSearchCommand = buildCommand({
  async func(this: CommandContext, flags: ScimQueryFlags) {
    await cliRunApi(this, flags, (config) => scimUserSearch({ config, ...scimQueryArgs(flags) }))
  },
  parameters: { flags: { ...cliConfigFlagParams, ...scimQueryFlagParams } },
  docs: { brief: "Search SCIM users via POST body (POST /scim/v2/Users/.search)" },
})

const userGetCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { id: string; attributes?: string[]; excludedAttributes?: string[] },
  ) {
    await cliRunApi(this, flags, (config) => scimUserGet({ config, id: flags.id, ...scimAttributesFlags(flags) }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("User id"),
      attributes: cliScalarFlagParams.optionalStringList("Comma-separated attributes to return"),
      excludedAttributes: cliScalarFlagParams.optionalStringList("Comma-separated attributes to omit"),
    },
  },
  docs: { brief: "Fetch one SCIM user (GET /scim/v2/Users/{id})" },
})

const userReplaceCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { id: string; userJson: string; attributes?: string[]; excludedAttributes?: string[] },
  ) {
    const op = "scimUserReplace"
    const parsed = cliJsonParse(flags.userJson, op, "userJson")
    if (!parsed.success) cliFail(parsed)
    const user = parsed.data as Record<string, unknown>
    await cliRunApi(this, flags, (config) =>
      scimUserReplace({ config, id: flags.id, user: user as { userName: string }, ...scimAttributesFlags(flags) }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("User id"),
      userJson: scimRequiredJsonFlag("Full replacement user resource as JSON (userName required)"),
      attributes: cliScalarFlagParams.optionalStringList("Comma-separated attributes to return"),
      excludedAttributes: cliScalarFlagParams.optionalStringList("Comma-separated attributes to omit"),
    },
  },
  docs: { brief: "Replace a SCIM user (PUT /scim/v2/Users/{id})" },
})

const userPatchCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & {
      id: string
      operationsJson: string
      attributes?: string[]
      excludedAttributes?: string[]
    },
  ) {
    const op = "scimUserPatch"
    const parsed = cliJsonParse(flags.operationsJson, op, "operationsJson")
    if (!parsed.success) cliFail(parsed)
    const operations = parsed.data as { op: "add" | "remove" | "replace"; path?: string; value?: unknown }[]
    await cliRunApi(this, flags, (config) =>
      scimUserPatch({ config, id: flags.id, operations, ...scimAttributesFlags(flags) }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("User id"),
      operationsJson: scimRequiredJsonFlag(
        'Patch operations as JSON array, e.g. [{"op":"replace","path":"displayName","value":"…"}]',
      ),
      attributes: cliScalarFlagParams.optionalStringList("Comma-separated attributes to return"),
      excludedAttributes: cliScalarFlagParams.optionalStringList("Comma-separated attributes to omit"),
    },
  },
  docs: { brief: "Patch a SCIM user (PATCH /scim/v2/Users/{id})" },
})

const userDeleteCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: string }) {
    await cliRunApi(this, flags, (config) => scimUserDelete({ config, id: flags.id }))
  },
  parameters: {
    flags: { ...cliConfigFlagParams, id: cliScalarFlagParams.requiredString("User id") },
  },
  docs: { brief: "Delete a SCIM user (DELETE /scim/v2/Users/{id})" },
})

const groupQueryCommand = buildCommand({
  async func(this: CommandContext, flags: ScimQueryFlags) {
    await cliRunApi(this, flags, (config) => scimGroupQuery({ config, ...scimQueryArgs(flags) }))
  },
  parameters: { flags: { ...cliConfigFlagParams, ...scimQueryFlagParams } },
  docs: { brief: "List SCIM groups (GET /scim/v2/Groups)" },
})

const groupCreateCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { groupJson: string; attributes?: string[]; excludedAttributes?: string[] },
  ) {
    const op = "scimGroupCreate"
    const parsed = cliJsonParse(flags.groupJson, op, "groupJson")
    if (!parsed.success) cliFail(parsed)
    const group = parsed.data as Record<string, unknown>
    await cliRunApi(this, flags, (config) =>
      scimGroupCreate({ config, group: group as { displayName: string }, ...scimAttributesFlags(flags) }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      groupJson: scimRequiredJsonFlag("New group resource as JSON (displayName required)"),
      attributes: cliScalarFlagParams.optionalStringList("Comma-separated attributes to return"),
      excludedAttributes: cliScalarFlagParams.optionalStringList("Comma-separated attributes to omit"),
    },
  },
  docs: { brief: "Create a SCIM group (POST /scim/v2/Groups)" },
})

const groupSearchCommand = buildCommand({
  async func(this: CommandContext, flags: ScimQueryFlags) {
    await cliRunApi(this, flags, (config) => scimGroupSearch({ config, ...scimQueryArgs(flags) }))
  },
  parameters: { flags: { ...cliConfigFlagParams, ...scimQueryFlagParams } },
  docs: { brief: "Search SCIM groups via POST body (POST /scim/v2/Groups/.search)" },
})

const groupGetCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { id: string; attributes?: string[]; excludedAttributes?: string[] },
  ) {
    await cliRunApi(this, flags, (config) => scimGroupGet({ config, id: flags.id, ...scimAttributesFlags(flags) }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("Group id"),
      attributes: cliScalarFlagParams.optionalStringList("Comma-separated attributes to return"),
      excludedAttributes: cliScalarFlagParams.optionalStringList("Comma-separated attributes to omit"),
    },
  },
  docs: { brief: "Fetch one SCIM group (GET /scim/v2/Groups/{id})" },
})

const groupReplaceCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { id: string; groupJson: string; attributes?: string[]; excludedAttributes?: string[] },
  ) {
    const op = "scimGroupReplace"
    const parsed = cliJsonParse(flags.groupJson, op, "groupJson")
    if (!parsed.success) cliFail(parsed)
    const group = parsed.data as Record<string, unknown>
    await cliRunApi(this, flags, (config) =>
      scimGroupReplace({
        config,
        id: flags.id,
        group: group as { displayName: string },
        ...scimAttributesFlags(flags),
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("Group id"),
      groupJson: scimRequiredJsonFlag("Full replacement group resource as JSON (displayName required)"),
      attributes: cliScalarFlagParams.optionalStringList("Comma-separated attributes to return"),
      excludedAttributes: cliScalarFlagParams.optionalStringList("Comma-separated attributes to omit"),
    },
  },
  docs: { brief: "Replace a SCIM group (PUT /scim/v2/Groups/{id})" },
})

const groupPatchCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & {
      id: string
      operationsJson: string
      attributes?: string[]
      excludedAttributes?: string[]
    },
  ) {
    const op = "scimGroupPatch"
    const parsed = cliJsonParse(flags.operationsJson, op, "operationsJson")
    if (!parsed.success) cliFail(parsed)
    const operations = parsed.data as { op: "add" | "remove" | "replace"; path?: string; value?: unknown }[]
    await cliRunApi(this, flags, (config) =>
      scimGroupPatch({ config, id: flags.id, operations, ...scimAttributesFlags(flags) }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("Group id"),
      operationsJson: scimRequiredJsonFlag(
        'Patch operations as JSON array, e.g. [{"op":"replace","path":"displayName","value":"…"}]',
      ),
      attributes: cliScalarFlagParams.optionalStringList("Comma-separated attributes to return"),
      excludedAttributes: cliScalarFlagParams.optionalStringList("Comma-separated attributes to omit"),
    },
  },
  docs: { brief: "Patch a SCIM group (PATCH /scim/v2/Groups/{id})" },
})

const groupDeleteCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: string }) {
    await cliRunApi(this, flags, (config) => scimGroupDelete({ config, id: flags.id }))
  },
  parameters: {
    flags: { ...cliConfigFlagParams, id: cliScalarFlagParams.requiredString("Group id") },
  },
  docs: { brief: "Delete a SCIM group (DELETE /scim/v2/Groups/{id})" },
})

const bulkCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { operationsJson: string; failOnErrors?: number }) {
    const op = "scimBulk"
    const parsed = cliJsonParse(flags.operationsJson, op, "operationsJson")
    if (!parsed.success) cliFail(parsed)
    const operations = parsed.data as {
      method: "POST" | "PUT" | "PATCH" | "DELETE"
      path: string
      bulkId?: string
      version?: string
      data?: unknown
    }[]
    await cliRunApi(this, flags, (config) =>
      scimBulk({
        config,
        operations,
        ...(flags.failOnErrors !== undefined ? { failOnErrors: flags.failOnErrors } : {}),
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      operationsJson: scimRequiredJsonFlag(
        'Bulk operations as JSON array, e.g. [{"method":"POST","path":"/Users","data":{…}}]',
      ),
      failOnErrors: cliScalarFlagParams.optionalNumber("Abort the batch after this many failures"),
    },
  },
  docs: { brief: "Run a SCIM bulk batch (POST /scim/v2/Bulk)" },
})

const searchAllCommand = buildCommand({
  async func(this: CommandContext, flags: ScimQueryFlags) {
    await cliRunApi(this, flags, (config) => scimSearchAll({ config, ...scimQueryArgs(flags) }))
  },
  parameters: { flags: { ...cliConfigFlagParams, ...scimQueryFlagParams } },
  docs: { brief: "Search users and groups together (POST /scim/v2/.search)" },
})

const serviceProviderConfigCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => scimServiceProviderConfig({ config }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "Fetch the SCIM provider capabilities (GET /scim/v2/ServiceProviderConfig)" },
})

const resourceTypesCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { name?: string }) {
    await cliRunApi(this, flags, (config) =>
      scimResourceTypes({
        config,
        ...(flags.name === "User" || flags.name === "Group" ? { name: flags.name } : {}),
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      name: cliScalarFlagParams.optionalString('One resource type: "User" or "Group" (default: both)'),
    },
  },
  docs: { brief: "Describe SCIM resource types (GET /scim/v2/ResourceTypes[/{name}])" },
})

const schemasCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id?: string }) {
    await cliRunApi(this, flags, (config) =>
      scimSchemas({ config, ...(flags.id !== undefined ? { id: flags.id } : {}) }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.optionalString(
        "One schema URN, e.g. urn:ietf:params:scim:schemas:core:2.0:User (default: both)",
      ),
    },
  },
  docs: { brief: "Describe SCIM schemas (GET /scim/v2/Schemas[/{uri}])" },
})

const userCommands = buildRouteMap({
  routes: {
    query: userQueryCommand,
    create: userCreateCommand,
    search: userSearchCommand,
    get: userGetCommand,
    replace: userReplaceCommand,
    patch: userPatchCommand,
    delete: userDeleteCommand,
  },
  docs: { brief: "SCIM user provisioning (RFC 7643/7644)" },
})

const groupCommands = buildRouteMap({
  routes: {
    query: groupQueryCommand,
    create: groupCreateCommand,
    search: groupSearchCommand,
    get: groupGetCommand,
    replace: groupReplaceCommand,
    patch: groupPatchCommand,
    delete: groupDeleteCommand,
  },
  docs: { brief: "SCIM group provisioning (RFC 7643/7644)" },
})

export const scimCommands = buildRouteMap({
  routes: {
    user: userCommands,
    group: groupCommands,
    bulk: bulkCommand,
    "search-all": searchAllCommand,
    "service-provider-config": serviceProviderConfigCommand,
    "resource-types": resourceTypesCommand,
    schemas: schemasCommand,
  },
  docs: { brief: "SCIM 2.0 provisioning (enterprise-gated on the server)" },
})
