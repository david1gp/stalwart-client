import { readFile } from "node:fs/promises"
import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { cliBinaryOutput } from "../../cli/cliBinaryOutput.js"
import { cliBinaryOutputFlagParams } from "../../cli/cliBinaryOutputFlagParams.js"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliConfigLoad } from "../../cli/cliConfigLoad.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliJsonParse } from "../../cli/cliJsonParse.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import { cliWriteJson } from "../../cli/cliWriteJson.js"
import { blobCopy } from "../blobCopy.js"
import { blobDownload } from "../blobDownload.js"
import { blobGet } from "../blobGet.js"
import { blobHttpUpload } from "../blobHttpUpload.js"
import { blobLookup } from "../blobLookup.js"
import { blobUpload } from "../blobUpload.js"

const accountIdFlag = cliScalarFlagParams.optionalString("JMAP accountId (default: session primary account)")
const idsFlag = cliScalarFlagParams.optionalStringList("Comma-separated ids")
const propertiesFlag = cliScalarFlagParams.optionalStringList("Comma-separated properties to return")

function jsonFlagRead(op: string, flag: string, value: string | undefined): Record<string, unknown> | undefined {
  if (value === undefined) return undefined
  const parsed = cliJsonParse(value, op, flag)
  if (!parsed.success) cliFail(parsed)
  return parsed.data as Record<string, unknown>
}

function stringListFlagRead(op: string, flag: string, value: string[] | undefined): string[] {
  if (value === undefined || value.length === 0) cliFail({ op, errorMessage: `Missing required --${flag}` })
  return value
}

const getCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { accountId?: string; ids?: string[]; properties?: string[] },
  ) {
    await cliRunApi(this, flags, (config) =>
      blobGet({ config, accountId: flags.accountId, ids: flags.ids, properties: flags.properties }),
    )
  },
  parameters: { flags: { ...cliConfigFlagParams, accountId: accountIdFlag, ids: idsFlag, properties: propertiesFlag } },
  docs: { brief: "Blob/get — fetch blob contents inline" },
})

const copyCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { accountId?: string; fromAccountId?: string; blobIds?: string[] },
  ) {
    const blobIds = stringListFlagRead("blobCopy", "blobIds", flags.blobIds)
    await cliRunApi(this, flags, (config) =>
      blobCopy({ config, accountId: flags.accountId, fromAccountId: flags.fromAccountId, blobIds }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: accountIdFlag,
      fromAccountId: cliScalarFlagParams.optionalString("Source account (default: target account)"),
      blobIds: cliScalarFlagParams.optionalStringList("Comma-separated blob ids to copy (required)"),
    },
  },
  docs: { brief: "Blob/copy — copy blobs between accounts" },
})

const lookupCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { accountId?: string; typeNames?: string[]; ids?: string[] },
  ) {
    const typeNames = stringListFlagRead("blobLookup", "typeNames", flags.typeNames)
    const ids = stringListFlagRead("blobLookup", "ids", flags.ids)
    await cliRunApi(this, flags, (config) => blobLookup({ config, accountId: flags.accountId, typeNames, ids }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: accountIdFlag,
      typeNames: cliScalarFlagParams.optionalStringList("Comma-separated data types, e.g. Email,Mailbox (required)"),
      ids: cliScalarFlagParams.optionalStringList("Comma-separated blob ids (required)"),
    },
  },
  docs: { brief: "Blob/lookup — find which objects reference blobs" },
})

const uploadCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { accountId?: string; createJson: string }) {
    const op = "blobUpload"
    const create = jsonFlagRead(op, "createJson", flags.createJson)
    await cliRunApi(this, flags, (config) =>
      blobUpload({
        config,
        accountId: flags.accountId,
        create: (create ?? {}) as Record<string, Record<string, unknown>>,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: accountIdFlag,
      createJson: cliScalarFlagParams.requiredString(
        'Uploads as JSON: {"<creationId>": {"data": [{"data:asText": "…"}]}} or {"data:asBase64": "…"}',
      ),
    },
  },
  docs: { brief: "Blob/upload — method-form upload with inline data" },
})

const httpUploadCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { accountId?: string; file: string; contentType?: string }) {
    const configResult = cliConfigLoad(flags)
    if (!configResult.success) cliFail(configResult)
    let data: Uint8Array
    try {
      data = await readFile(flags.file)
    } catch (error) {
      cliFail({
        op: "blobHttpUpload",
        errorMessage: `Cannot read file ${flags.file}`,
        errorData: error instanceof Error ? error.message : String(error),
      })
    }
    const result = await blobHttpUpload({
      config: configResult.data,
      accountId: flags.accountId,
      data: new Uint8Array(data),
      contentType: flags.contentType,
    })
    if (!result.success) cliFail(result)
    cliWriteJson(this, result.data)
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: accountIdFlag,
      file: cliScalarFlagParams.requiredString("Local file to upload"),
      contentType: cliScalarFlagParams.optionalString("Content-Type (default application/octet-stream)"),
    },
  },
  docs: { brief: "Upload a file via POST /jmap/upload (raw HTTP transport)" },
})

const downloadCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { accountId?: string; blobId: string; name?: string; accept?: string; output?: string },
  ) {
    const configResult = cliConfigLoad(flags)
    if (!configResult.success) cliFail(configResult)
    const result = await blobDownload({
      config: configResult.data,
      accountId: flags.accountId,
      blobId: flags.blobId,
      name: flags.name,
      accept: flags.accept,
    })
    if (!result.success) cliFail(result)
    const rendered = await cliBinaryOutput(result.data, flags.output)
    if (!rendered.success) cliFail(rendered)
    if (rendered.data !== undefined) cliWriteJson(this, rendered.data)
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: accountIdFlag,
      blobId: cliScalarFlagParams.requiredString("Blob id to download"),
      name: cliScalarFlagParams.optionalString("Name segment for the download URL (default: blob id)"),
      accept: cliScalarFlagParams.optionalString("Content-Type override (?accept=)"),
      ...cliBinaryOutputFlagParams,
    },
  },
  docs: { brief: "Download a blob via GET /jmap/download (raw bytes)" },
})

export const blobsCommands = buildRouteMap({
  routes: {
    get: getCommand,
    copy: copyCommand,
    lookup: lookupCommand,
    upload: uploadCommand,
    "http-upload": httpUploadCommand,
    download: downloadCommand,
  },
  docs: { brief: "Blob methods and HTTP upload/download transport" },
})
