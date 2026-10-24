import { buildApplication, buildRouteMap } from "@stricli/core"
import { PACKAGE_VERSION } from "../client/PACKAGE_VERSION.js"
import { versionCommand } from "./versionCommand.js"
import { coreCommands, jmapCommands, sessionCommands } from "../jmap/cli/jmapCommands.js"
import { liveCommands } from "../live/cli/liveCommands.js"
import { managementCommands } from "../management/cli/managementCommands.js"
import { oauthCommands } from "../oauth/cli/oauthCommands.js"
import { registryCommands } from "../registry/cli/registryCommands.js"
import { scimCommands } from "../scim/cli/scimCommands.js"
import { autodiscoverCommands } from "../autodiscover/cli/autodiscoverCommands.js"
import { calendarRsvpCommands } from "../calendarRsvp/cli/calendarRsvpCommands.js"
import { formsCommands } from "../forms/cli/formsCommands.js"
import { wellKnownCommands } from "../wellKnown/cli/wellKnownCommands.js"
import { directoryCommands } from "../registry/directory/cli/directoryCommands.js"

const routes = buildRouteMap({
  routes: {
    version: versionCommand,
    session: sessionCommands,
    jmap: jmapCommands,
    core: coreCommands,
    registry: registryCommands,
    oauth: oauthCommands,
    management: managementCommands,
    live: liveCommands,
    directory: directoryCommands,
    scim: scimCommands,
    "well-known": wellKnownCommands,
    autodiscover: autodiscoverCommands,
    forms: formsCommands,
    "calendar-rsvp": calendarRsvpCommands,
  },
  docs: {
    brief: "TypeScript client and CLI for the Stalwart mail server (JMAP + management API)",
  },
})

export const stalwartClientApp = buildApplication(routes, {
  name: "stalwart-client",
  versionInfo: {
    currentVersion: PACKAGE_VERSION,
  },
})
