import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { createResultError } from "#result"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliJsonParse } from "../../cli/cliJsonParse.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import { emailChanges } from "../emailChanges.js"
import { emailCopy } from "../emailCopy.js"
import { emailGet } from "../emailGet.js"
import { emailImport } from "../emailImport.js"
import { emailImportRaw } from "../emailImportRaw.js"
import { emailParse } from "../emailParse.js"
import { emailQuery } from "../emailQuery.js"
import { emailQueryChanges } from "../emailQueryChanges.js"
import { emailSend } from "../emailSend.js"
import { emailSet } from "../emailSet.js"

type WithAccount = CliConfigFlags & { accountId?: string }

function jsonRecord(op: string, flag: string, value: string | undefined): Record<string, unknown> | undefined {
  if (value === undefined) return undefined
  const parsed = cliJsonParse(value, op, flag)
  if (!parsed.success) cliFail(parsed)
  return parsed.data as Record<string, unknown>
}

function jsonSort(op: string, value: string | undefined): { property: string; isAscending?: boolean }[] | undefined {
  const parsed = jsonRecord(op, "sortJson", value)
  return parsed as { property: string; isAscending?: boolean }[] | undefined
}

const getCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: WithAccount & {
      ids?: string[]
      properties?: string[]
      bodyProperties?: string[]
      fetchTextBodyValues?: boolean
      fetchHTMLBodyValues?: boolean
      fetchAllBodyValues?: boolean
      maxBodyValueBytes?: number
    },
  ) {
    await cliRunApi(this, flags, (config) =>
      emailGet({
        config,
        accountId: flags.accountId,
        ids: flags.ids,
        properties: flags.properties,
        bodyProperties: flags.bodyProperties,
        fetchTextBodyValues: flags.fetchTextBodyValues,
        fetchHTMLBodyValues: flags.fetchHTMLBodyValues,
        fetchAllBodyValues: flags.fetchAllBodyValues,
        maxBodyValueBytes: flags.maxBodyValueBytes,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: cliScalarFlagParams.optionalString("Account id (default: session primary account for mail)"),
      ids: cliScalarFlagParams.optionalStringList("Comma-separated email ids (default: all)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
      bodyProperties: cliScalarFlagParams.optionalStringList("Body properties, e.g. textBody,htmlBody"),
      fetchTextBodyValues: cliScalarFlagParams.optionalBoolean("Fetch text body values"),
      fetchHTMLBodyValues: cliScalarFlagParams.optionalBoolean("Fetch HTML body values"),
      fetchAllBodyValues: cliScalarFlagParams.optionalBoolean("Fetch all body values"),
      maxBodyValueBytes: cliScalarFlagParams.optionalNumber("Max body value bytes"),
    },
  },
  docs: { brief: "Email/get — fetch emails by id, with optional body values" },
})

type QueryFlags = WithAccount & {
  filterJson?: string
  sortJson?: string
  position?: number
  anchor?: string
  anchorOffset?: number
  limit?: number
  calculateTotal?: boolean
}

const queryCommand = buildCommand({
  async func(this: CommandContext, flags: QueryFlags & { collapseThreads?: boolean }) {
    const op = "emailQuery"
    await cliRunApi(this, flags, (config) =>
      emailQuery({
        config,
        accountId: flags.accountId,
        filter: jsonRecord(op, "filterJson", flags.filterJson),
        sort: jsonSort(op, flags.sortJson),
        position: flags.position,
        anchor: flags.anchor,
        anchorOffset: flags.anchorOffset,
        limit: flags.limit,
        calculateTotal: flags.calculateTotal,
        collapseThreads: flags.collapseThreads,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: cliScalarFlagParams.optionalString("Account id (default: session primary account for mail)"),
      filterJson: cliScalarFlagParams.optionalString('Filter as JSON, e.g. {"inMailbox":"a"}'),
      sortJson: cliScalarFlagParams.optionalString('Sort as JSON array, e.g. [{"property":"receivedAt"}]'),
      position: cliScalarFlagParams.optionalNumber("Zero-based start position"),
      anchor: cliScalarFlagParams.optionalString("Anchor id for pagination"),
      anchorOffset: cliScalarFlagParams.optionalNumber("Offset relative to the anchor"),
      limit: cliScalarFlagParams.optionalNumber("Max ids to return"),
      calculateTotal: cliScalarFlagParams.optionalBoolean("Include the total count"),
      collapseThreads: cliScalarFlagParams.optionalBoolean("Collapse threads (one email per thread)"),
    },
  },
  docs: { brief: "Email/query — list email ids" },
})

const changesCommand = buildCommand({
  async func(this: CommandContext, flags: WithAccount & { sinceState: string; maxChanges?: number }) {
    await cliRunApi(this, flags, (config) =>
      emailChanges({ config, accountId: flags.accountId, sinceState: flags.sinceState, maxChanges: flags.maxChanges }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: cliScalarFlagParams.optionalString("Account id (default: session primary account for mail)"),
      sinceState: cliScalarFlagParams.requiredString("State to compare against (from a previous get/query)"),
      maxChanges: cliScalarFlagParams.optionalNumber("Max changes to return"),
    },
  },
  docs: { brief: "Email/changes — created/updated/destroyed ids since a state" },
})

const queryChangesCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & {
      accountId?: string
      filterJson?: string
      sortJson?: string
      calculateTotal?: boolean
      sinceQueryState: string
      maxChanges?: number
      upToId?: string
    },
  ) {
    const op = "emailQueryChanges"
    await cliRunApi(this, flags, (config) =>
      emailQueryChanges({
        config,
        accountId: flags.accountId,
        filter: jsonRecord(op, "filterJson", flags.filterJson),
        sort: jsonSort(op, flags.sortJson),
        sinceQueryState: flags.sinceQueryState,
        maxChanges: flags.maxChanges,
        upToId: flags.upToId,
        calculateTotal: flags.calculateTotal,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: cliScalarFlagParams.optionalString("Account id (default: session primary account for mail)"),
      filterJson: cliScalarFlagParams.optionalString("Filter as JSON"),
      sortJson: cliScalarFlagParams.optionalString("Sort as JSON array"),
      sinceQueryState: cliScalarFlagParams.requiredString("Query state to compare against"),
      maxChanges: cliScalarFlagParams.optionalNumber("Max changes to return"),
      upToId: cliScalarFlagParams.optionalString("Stop before this id"),
      calculateTotal: cliScalarFlagParams.optionalBoolean("Include the total count"),
    },
  },
  docs: { brief: "Email/queryChanges — added/removed ids since a query state" },
})

const setCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: WithAccount & { ifInState?: string; createJson?: string; updateJson?: string; destroy?: string[] },
  ) {
    const op = "emailSet"
    await cliRunApi(this, flags, (config) =>
      emailSet({
        config,
        accountId: flags.accountId,
        ifInState: flags.ifInState,
        create: jsonRecord(op, "createJson", flags.createJson) as Record<string, Record<string, unknown>> | undefined,
        update: jsonRecord(op, "updateJson", flags.updateJson) as Record<string, Record<string, unknown>> | undefined,
        destroy: flags.destroy,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: cliScalarFlagParams.optionalString("Account id (default: session primary account for mail)"),
      ifInState: cliScalarFlagParams.optionalString("Only apply when the state matches"),
      createJson: cliScalarFlagParams.optionalString('Creations as JSON: {"<creationId>": {…email…}}'),
      updateJson: cliScalarFlagParams.optionalString('Updates as JSON: {"<id>": {…patch…}}'),
      destroy: cliScalarFlagParams.optionalStringList("Comma-separated email ids to destroy"),
    },
  },
  docs: { brief: "Email/set — create, update and/or destroy emails" },
})

const copyCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: WithAccount & {
      fromAccountId?: string
      createJson: string
      onSuccessDestroyOriginal?: boolean
    },
  ) {
    const op = "emailCopy"
    const create = jsonRecord(op, "createJson", flags.createJson) as Record<string, Record<string, unknown>>
    await cliRunApi(this, flags, (config) =>
      emailCopy({
        config,
        accountId: flags.accountId,
        fromAccountId: flags.fromAccountId,
        create,
        onSuccessDestroyOriginal: flags.onSuccessDestroyOriginal,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: cliScalarFlagParams.optionalString("Destination account id (default: session primary account)"),
      fromAccountId: cliScalarFlagParams.optionalString("Source account id (default: session primary account)"),
      createJson: cliScalarFlagParams.requiredString(
        'Copies as JSON: {"<creationId>": {"id": "<sourceEmailId>", "mailboxIds": {"<id>": true}}}',
      ),
      onSuccessDestroyOriginal: cliScalarFlagParams.optionalBoolean("Destroy the originals on success"),
    },
  },
  docs: { brief: "Email/copy — copy emails between accounts" },
})

const importCommand = buildCommand({
  async func(this: CommandContext, flags: WithAccount & { emailsJson: string; ifInState?: string }) {
    const op = "emailImport"
    const emails = jsonRecord(op, "emailsJson", flags.emailsJson) as Record<
      string,
      { blobId: string; mailboxIds: Record<string, boolean>; keywords?: Record<string, boolean>; receivedAt?: string }
    >
    await cliRunApi(this, flags, (config) =>
      emailImport({ config, accountId: flags.accountId, ifInState: flags.ifInState, emails }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: cliScalarFlagParams.optionalString("Account id (default: session primary account for mail)"),
      emailsJson: cliScalarFlagParams.requiredString(
        'Imports as JSON: {"<creationId>": {"blobId": "…", "mailboxIds": {"<id>": true}}}',
      ),
      ifInState: cliScalarFlagParams.optionalString("Only apply when the state matches"),
    },
  },
  docs: { brief: "Email/import — import messages from uploaded blobs" },
})

const parseCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: WithAccount & {
      blobIds?: string[]
      properties?: string[]
      bodyProperties?: string[]
      fetchTextBodyValues?: boolean
      fetchHTMLBodyValues?: boolean
      fetchAllBodyValues?: boolean
      maxBodyValueBytes?: number
    },
  ) {
    const op = "emailParse"
    const blobIds = flags.blobIds
    if (blobIds === undefined) cliFail(createResultError(op, "Missing required --blobIds"))
    await cliRunApi(this, flags, (config) =>
      emailParse({
        config,
        accountId: flags.accountId,
        blobIds,
        properties: flags.properties,
        bodyProperties: flags.bodyProperties,
        fetchTextBodyValues: flags.fetchTextBodyValues,
        fetchHTMLBodyValues: flags.fetchHTMLBodyValues,
        fetchAllBodyValues: flags.fetchAllBodyValues,
        maxBodyValueBytes: flags.maxBodyValueBytes,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: cliScalarFlagParams.optionalString("Account id (default: session primary account for mail)"),
      blobIds: cliScalarFlagParams.optionalStringList("Comma-separated blob ids to parse (required)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
      bodyProperties: cliScalarFlagParams.optionalStringList("Body properties, e.g. textBody,htmlBody"),
      fetchTextBodyValues: cliScalarFlagParams.optionalBoolean("Fetch text body values"),
      fetchHTMLBodyValues: cliScalarFlagParams.optionalBoolean("Fetch HTML body values"),
      fetchAllBodyValues: cliScalarFlagParams.optionalBoolean("Fetch all body values"),
      maxBodyValueBytes: cliScalarFlagParams.optionalNumber("Max body value bytes"),
    },
  },
  docs: { brief: "Email/parse — parse uploaded blobs without importing" },
})

const sendCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: WithAccount & {
      from: string
      to?: string[]
      cc?: string[]
      bcc?: string[]
      subject?: string
      text?: string
      html?: string
      identityId?: string
    },
  ) {
    const op = "emailSend"
    const to = flags.to
    if (to === undefined) cliFail(createResultError(op, "Missing required --to (comma-separated To addresses)"))
    await cliRunApi(this, flags, (config) =>
      emailSend({
        config,
        accountId: flags.accountId,
        identityId: flags.identityId,
        from: flags.from,
        to,
        cc: flags.cc,
        bcc: flags.bcc,
        subject: flags.subject,
        text: flags.text,
        html: flags.html,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: cliScalarFlagParams.optionalString("Account id (default: session primary account for mail)"),
      from: cliScalarFlagParams.requiredString("From address (required; also used as envelope sender)"),
      to: cliScalarFlagParams.optionalStringList("Comma-separated To addresses (required)"),
      cc: cliScalarFlagParams.optionalStringList("Comma-separated Cc addresses"),
      bcc: cliScalarFlagParams.optionalStringList("Comma-separated Bcc addresses"),
      subject: cliScalarFlagParams.optionalString("Subject"),
      text: cliScalarFlagParams.optionalString("Plain-text body"),
      html: cliScalarFlagParams.optionalString("HTML body"),
      identityId: cliScalarFlagParams.optionalString("Identity id (default: first Identity/get result)"),
    },
  },
  docs: { brief: "Send a message: draft in Drafts, submit, move to Sent" },
})

const importRawCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: WithAccount & { mailboxIds?: string[]; raw: string; keywordsJson?: string; receivedAt?: string },
  ) {
    const op = "emailImportRaw"
    const mailboxIds = flags.mailboxIds
    if (mailboxIds === undefined) cliFail(createResultError(op, "Missing required --mailboxIds"))
    await cliRunApi(this, flags, (config) =>
      emailImportRaw({
        config,
        accountId: flags.accountId,
        mailboxIds,
        raw: flags.raw,
        keywords: jsonRecord(op, "keywordsJson", flags.keywordsJson) as Record<string, boolean> | undefined,
        receivedAt: flags.receivedAt,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: cliScalarFlagParams.optionalString("Account id (default: session primary account for mail)"),
      mailboxIds: cliScalarFlagParams.optionalStringList("Comma-separated mailbox ids to import into (required)"),
      raw: cliScalarFlagParams.requiredString("Full RFC 5322 message text"),
      keywordsJson: cliScalarFlagParams.optionalString('Keywords as JSON, e.g. {"$seen": true}'),
      receivedAt: cliScalarFlagParams.optionalString("Received date (RFC 3339)"),
    },
  },
  docs: { brief: "Upload RFC 5322 bytes and import them in one step" },
})

export const emailCommands = buildRouteMap({
  routes: {
    get: getCommand,
    query: queryCommand,
    changes: changesCommand,
    "query-changes": queryChangesCommand,
    set: setCommand,
    copy: copyCommand,
    import: importCommand,
    parse: parseCommand,
    send: sendCommand,
    "import-raw": importRawCommand,
  },
  docs: { brief: "Standard Email methods plus send/import conveniences" },
})
