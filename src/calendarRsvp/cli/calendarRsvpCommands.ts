import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { cliBinaryOutput } from "../../cli/cliBinaryOutput.js"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliConfigLoad } from "../../cli/cliConfigLoad.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import { cliWriteJson } from "../../cli/cliWriteJson.js"
import { calendarRsvpPage } from "../../calendarRsvp/calendarRsvpPage.js"
import { calendarRsvpSubmit } from "../../calendarRsvp/calendarRsvpSubmit.js"

const pageCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { output?: string }) {
    const configResult = cliConfigLoad(flags)
    if (!configResult.success) cliFail(configResult)
    const page = await calendarRsvpPage({ config: configResult.data })
    if (!page.success) cliFail(page)
    const written = await cliBinaryOutput(page.data, flags.output)
    if (!written.success) cliFail(written)
    if (written.data !== undefined) cliWriteJson(this, written.data)
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      output: cliScalarFlagParams.optionalString("Write the page bytes to a file (default: base64 JSON to stdout)"),
    },
  },
  docs: { brief: "GET /calendar/rsvp — static RSVP web page (binary)" },
})

const submitCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { token: string; partstat?: string; comment?: string }) {
    await cliRunApi(this, flags, (config) =>
      calendarRsvpSubmit({ config, token: flags.token, partstat: flags.partstat, comment: flags.comment }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      token: cliScalarFlagParams.requiredString("RSVP token from the invitation link"),
      partstat: cliScalarFlagParams.optionalString("Reply: ACCEPTED, DECLINED, TENTATIVE, COMPLETED or IN-PROCESS"),
      comment: cliScalarFlagParams.optionalString("Optional comment recorded with the reply"),
    },
  },
  docs: { brief: "POST /api/calendar/rsvp — fetch an invitation or record a reply" },
})

export const calendarRsvpCommands = buildRouteMap({
  routes: {
    page: pageCommand,
    submit: submitCommand,
  },
  docs: { brief: "Calendar RSVP web page and RSVP API" },
})
