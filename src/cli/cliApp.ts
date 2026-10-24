import { buildApplication, buildRouteMap } from "@stricli/core"
import { PACKAGE_VERSION } from "../client/PACKAGE_VERSION.js"
import { versionCommand } from "./versionCommand.js"
import { coreCommands, jmapCommands, sessionCommands } from "../jmap/cli/jmapCommands.js"
import { registryCommands } from "../registry/cli/registryCommands.js"

const routes = buildRouteMap({
  routes: {
    version: versionCommand,
    session: sessionCommands,
    jmap: jmapCommands,
    core: coreCommands,
    registry: registryCommands,
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
