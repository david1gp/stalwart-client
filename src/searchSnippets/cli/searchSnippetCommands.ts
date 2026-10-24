import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliJsonParse } from "../../cli/cliJsonParse.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import { searchSnippetGet } from "../searchSnippetGet.js"

const getCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & {
      accountId?: string
      emailIds?: string[]
      filterJson?: string
      sortJson?: string
      position?: number
      anchor?: string
      anchorOffset?: number
      limit?: number
      calculateTotal?: boolean
    },
  ) {
    const op = "searchSnippetGet"
    const filter =
      flags.filterJson === undefined
        ? undefined
        : (() => {
            const parsed = cliJsonParse(flags.filterJson, op, "filterJson")
            if (!parsed.success) cliFail(parsed)
            return parsed.data as Record<string, unknown>
          })()
    const sort =
      flags.sortJson === undefined
        ? undefined
        : (() => {
            const parsed = cliJsonParse(flags.sortJson, op, "sortJson")
            if (!parsed.success) cliFail(parsed)
            return parsed.data as { property: string; isAscending?: boolean }[]
          })()
    await cliRunApi(this, flags, (config) =>
      searchSnippetGet({
        config,
        accountId: flags.accountId,
        emailIds: flags.emailIds,
        filter,
        sort,
        position: flags.position,
        anchor: flags.anchor,
        anchorOffset: flags.anchorOffset,
        limit: flags.limit,
        calculateTotal: flags.calculateTotal,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      accountId: cliScalarFlagParams.optionalString("Account id (default: session primary account for mail)"),
      emailIds: cliScalarFlagParams.optionalStringList("Comma-separated email ids to snippet (required)"),
      filterJson: cliScalarFlagParams.optionalString("Filter as JSON (same as Email/query)"),
      sortJson: cliScalarFlagParams.optionalString("Sort as JSON array"),
      position: cliScalarFlagParams.optionalNumber("Zero-based start position"),
      anchor: cliScalarFlagParams.optionalString("Anchor id for pagination"),
      anchorOffset: cliScalarFlagParams.optionalNumber("Offset relative to the anchor"),
      limit: cliScalarFlagParams.optionalNumber("Max snippets to return"),
      calculateTotal: cliScalarFlagParams.optionalBoolean("Include the total count"),
    },
  },
  docs: { brief: "SearchSnippet/get — subject/preview snippets for email ids" },
})

export const searchSnippetCommands = buildRouteMap({
  routes: {
    get: getCommand,
  },
  docs: { brief: "Standard SearchSnippet methods" },
})
