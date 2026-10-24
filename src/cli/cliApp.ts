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
import { sieveScriptsCommands } from "../sieveScripts/cli/sieveScriptsCommands.js"
import { blobsCommands } from "../blobs/cli/blobsCommands.js"
import { quotasCommands } from "../quotas/cli/quotasCommands.js"
import { pushSubscriptionsCommands } from "../pushSubscriptions/cli/pushSubscriptionsCommands.js"
import { addressBooksCommands } from "../addressBooks/cli/addressBooksCommands.js"
import { contactCardsCommands } from "../contactCards/cli/contactCardsCommands.js"
import { fileNodesCommands } from "../fileNodes/cli/fileNodesCommands.js"
import { shareNotificationsCommands } from "../shareNotifications/cli/shareNotificationsCommands.js"
import { eventSourceCommands } from "../eventSource/cli/eventSourceCommands.js"
import { webSocketCommands } from "../webSocket/cli/webSocketCommands.js"
import { healthCommands } from "../health/cli/healthCommands.js"
import { metricsCommands } from "../metrics/cli/metricsCommands.js"
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
    sieve: sieveScriptsCommands,
    blob: blobsCommands,
    quota: quotasCommands,
    push: pushSubscriptionsCommands,
    addressbook: addressBooksCommands,
    contact: contactCardsCommands,
    file: fileNodesCommands,
    share: shareNotificationsCommands,
    eventsource: eventSourceCommands,
    websocket: webSocketCommands,
    health: healthCommands,
    metrics: metricsCommands,
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
