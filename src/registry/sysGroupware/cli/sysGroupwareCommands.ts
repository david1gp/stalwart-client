import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import type { PromiseResult } from "#result"
import type { StalwartClientConfig } from "../../../client/stalwartClientConfigSchema.js"
import { cliConfigFlagParams } from "../../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../../cli/cliConfigFlags.js"
import { cliFail } from "../../../cli/cliFail.js"
import { cliJsonParse } from "../../../cli/cliJsonParse.js"
import { cliRunApi } from "../../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../../cli/cliScalarFlagParams.js"
import { calendarAlarmGet } from "../calendarAlarmGet.js"
import { calendarAlarmSet } from "../calendarAlarmSet.js"
import { calendarSchedulingGet } from "../calendarSchedulingGet.js"
import { calendarSchedulingSet } from "../calendarSchedulingSet.js"
import { sysAddressBookGet } from "../sysAddressBookGet.js"
import { sysAddressBookSet } from "../sysAddressBookSet.js"
import { sysCalendarGet } from "../sysCalendarGet.js"
import { sysCalendarSet } from "../sysCalendarSet.js"
import { sysEmailGet } from "../sysEmailGet.js"
import { sysEmailSet } from "../sysEmailSet.js"

function getCommand(
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

function setCommand(
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
        patchJson: cliScalarFlagParams.requiredString("Singleton patch as JSON"),
      },
    },
    docs: { brief },
  })
}

function singletonRoutes(
  brief: string,
  getBrief: string,
  setBrief: string,
  get: (config: StalwartClientConfig, properties?: string[]) => PromiseResult<unknown>,
  set: (config: StalwartClientConfig, patch: Record<string, unknown>) => PromiseResult<unknown>,
) {
  return buildRouteMap({
    routes: { get: getCommand(getBrief, get), set: setCommand(setBrief, set) },
    docs: { brief },
  })
}

export const sysGroupwareCommands = buildRouteMap({
  routes: {
    "sys-email": singletonRoutes(
      "Email server settings (x:Email singleton)",
      "Read the email server settings singleton",
      "Patch the email server settings singleton",
      (config, properties) => sysEmailGet({ config, properties }),
      (config, patch) => sysEmailSet({ config, patch }),
    ),
    "sys-calendar": singletonRoutes(
      "Calendar server settings (x:Calendar singleton)",
      "Read the calendar server settings singleton",
      "Patch the calendar server settings singleton",
      (config, properties) => sysCalendarGet({ config, properties }),
      (config, patch) => sysCalendarSet({ config, patch }),
    ),
    "calendar-alarm": singletonRoutes(
      "Calendar alarm email settings",
      "Read the calendar alarm email settings singleton",
      "Patch the calendar alarm email settings singleton",
      (config, properties) => calendarAlarmGet({ config, properties }),
      (config, patch) => calendarAlarmSet({ config, patch }),
    ),
    "calendar-scheduling": singletonRoutes(
      "Calendar scheduling and iTIP/RSVP settings",
      "Read the calendar scheduling singleton",
      "Patch the calendar scheduling singleton",
      (config, properties) => calendarSchedulingGet({ config, properties }),
      (config, patch) => calendarSchedulingSet({ config, patch }),
    ),
    "sys-address-book": singletonRoutes(
      "Address book server settings (x:AddressBook singleton)",
      "Read the address book server settings singleton",
      "Patch the address book server settings singleton",
      (config, properties) => sysAddressBookGet({ config, properties }),
      (config, patch) => sysAddressBookSet({ config, patch }),
    ),
  },
  docs: { brief: "Groupware server settings (registry system singletons)" },
})
