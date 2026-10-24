import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliJsonParse } from "../../cli/cliJsonParse.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import { contactFormSubmit } from "../../forms/contactFormSubmit.js"

const submitCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { form: string; fieldsJson: string }) {
    const op = "contactFormSubmit"
    const parsed = cliJsonParse(flags.fieldsJson, op, "fieldsJson")
    if (!parsed.success) cliFail(parsed)
    const fields = parsed.data as Record<string, string>
    await cliRunApi(this, flags, (config) => contactFormSubmit({ config, form: flags.form, fields }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      form: cliScalarFlagParams.requiredString("Form path segment after /form/, e.g. contact"),
      fieldsJson: {
        kind: "parsed" as const,
        parse: String,
        brief: 'Form fields as JSON, e.g. {"email":"a@b","subject":"hi"}',
      },
    },
  },
  docs: { brief: "POST /form/* — submit a contact form (requires x:HttpForm enabled)" },
})

export const formsCommands = buildRouteMap({
  routes: {
    submit: submitCommand,
  },
  docs: { brief: "Contact form submission" },
})
