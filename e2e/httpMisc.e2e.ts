import { afterAll, beforeAll, describe, expect, test } from "bun:test"
import { autodiscoverJson } from "../src/autodiscover/autodiscoverJson.js"
import { autodiscoverXml } from "../src/autodiscover/autodiscoverXml.js"
import { calendarRsvpPage } from "../src/calendarRsvp/calendarRsvpPage.js"
import { calendarRsvpSubmit } from "../src/calendarRsvp/calendarRsvpSubmit.js"
import { stalwartClientConfig } from "../src/client/stalwartClientConfig.js"
import type { StalwartClientConfig } from "../src/client/stalwartClientConfigSchema.js"
import { contactFormSubmit } from "../src/forms/contactFormSubmit.js"
import { registryGet } from "../src/registry/registryGet.js"
import { registrySet } from "../src/registry/registrySet.js"
import { autoconfigMailConfig } from "../src/wellKnown/autoconfigMailConfig.js"
import { autoconfigMailV1 } from "../src/wellKnown/autoconfigMailV1.js"
import { autoconfigThunderbird } from "../src/wellKnown/autoconfigThunderbird.js"
import { robotsTxt } from "../src/wellKnown/robotsTxt.js"
import { wellKnownAcmeChallenge } from "../src/wellKnown/wellKnownAcmeChallenge.js"
import { wellKnownCaldav } from "../src/wellKnown/wellKnownCaldav.js"
import { wellKnownCarddav } from "../src/wellKnown/wellKnownCarddav.js"
import { wellKnownJmap } from "../src/wellKnown/wellKnownJmap.js"
import { wellKnownMtaSts } from "../src/wellKnown/wellKnownMtaSts.js"
import { wellKnownUserAgentConfig } from "../src/wellKnown/wellKnownUserAgentConfig.js"

let config: StalwartClientConfig
let userEmail = "alice@example.test"

beforeAll(async () => {
  const target = process.env.STALWART_E2E_TARGET ?? "live"
  let env: Record<string, string | undefined> = process.env
  if (target === "local") {
    const localFile = Bun.file(new URL("../ops/local-stalwart/.env.local", import.meta.url))
    if (!(await localFile.exists())) {
      throw new Error("STALWART_E2E_TARGET=local requires ops/local-stalwart/.env.local")
    }
    const overlay: Record<string, string> = {}
    for (const line of (await localFile.text()).split("\n")) {
      const trimmed = line.trim()
      if (trimmed === "" || trimmed.startsWith("#")) continue
      const eq = trimmed.indexOf("=")
      if (eq < 0) continue
      overlay[trimmed.slice(0, eq)] = trimmed.slice(eq + 1)
    }
    env = { ...process.env, ...overlay }
  }
  const configured = stalwartClientConfig({
    baseUrl: env.STALWART_BASE_URL ?? "",
    username: env.STALWART_USERNAME,
    password: env.STALWART_PASSWORD,
    token: env.STALWART_TOKEN,
    accountId: env.STALWART_ACCOUNT_ID,
  })
  if (!configured.success) throw new Error(`Unable to initialize the e2e Stalwart config: ${configured.errorMessage}`)
  config = configured.data
  if (env.STALWART_USER_A !== undefined && env.STALWART_USER_A !== "") userEmail = env.STALWART_USER_A
})

type HttpFormRestore = {
  enable: boolean
  deliverTo: Record<string, true>
  validateDomain: boolean
  fieldEmail: string | null
  fieldName: string | null
  fieldSubject: string | null
}

let httpFormRestore: HttpFormRestore | undefined

async function httpFormRead(): Promise<HttpFormRestore | undefined> {
  const got = await registryGet({ config, objectType: "HttpForm" })
  if (!got.success) return undefined
  const current = (got.data.list as unknown[])[0] as Record<string, unknown> | undefined
  if (current === undefined) return undefined
  return {
    enable: current["enable"] === true,
    deliverTo: (current["deliverTo"] ?? {}) as Record<string, true>,
    validateDomain: current["validateDomain"] !== false,
    fieldEmail: (current["fieldEmail"] ?? null) as string | null,
    fieldName: (current["fieldName"] ?? null) as string | null,
    fieldSubject: (current["fieldSubject"] ?? null) as string | null,
  }
}

async function httpFormRestoreBestEffort(): Promise<void> {
  if (httpFormRestore === undefined) return
  try {
    const restored = await registrySet({ config, objectType: "HttpForm", update: { singleton: httpFormRestore } })
    if (!restored.success) console.info(`E2E HttpForm restore failed: ${restored.errorMessage}`)
    await registrySet({ config, objectType: "Action", create: { reload: { "@type": "ReloadSettings" } } })
  } catch (error) {
    console.info(`E2E HttpForm restore threw: ${error instanceof Error ? error.message : String(error)}`)
  }
}

afterAll(async () => {
  await httpFormRestoreBestEffort()
})

describe("e2e http-misc: discovery redirects and robots", () => {
  test(
    "well-known jmap/caldav/carddav redirect without following",
    async () => {
      const jmap = await wellKnownJmap({ config })
      if (!jmap.success) throw new Error(`wellKnownJmap failed: ${jmap.errorMessage}`)
      expect(jmap.data.status).toBe(307)
      expect(jmap.data.location).toContain("/jmap/session")

      const caldav = await wellKnownCaldav({ config })
      if (!caldav.success) throw new Error(`wellKnownCaldav failed: ${caldav.errorMessage}`)
      expect(caldav.data.status).toBe(307)
      expect(caldav.data.location).toContain("/dav/cal")

      const carddav = await wellKnownCarddav({ config })
      if (!carddav.success) throw new Error(`wellKnownCarddav failed: ${carddav.errorMessage}`)
      expect(carddav.data.status).toBe(307)
      expect(carddav.data.location).toContain("/dav/card")
    },
    { timeout: 30_000 },
  )

  test(
    "robots.txt serves the static crawler policy",
    async () => {
      const robots = await robotsTxt({ config })
      if (!robots.success) throw new Error(`robotsTxt failed: ${robots.errorMessage}`)
      expect(robots.data).toContain("User-agent: *")
      expect(robots.data).toContain("Disallow: /")
    },
    { timeout: 30_000 },
  )
})

describe("e2e http-misc: mta-sts, user-agent config, autoconfig", () => {
  test(
    "mta-sts policy parses to version STSv1",
    async () => {
      const sts = await wellKnownMtaSts({ config })
      if (!sts.success) throw new Error(`wellKnownMtaSts failed: ${sts.errorMessage} ${sts.errorData ?? ""}`)
      expect(sts.data.policy["version"]).toBe("STSv1")
      expect(sts.data.raw).toContain("max_age")
    },
    { timeout: 30_000 },
  )

  test(
    "user-agent-configuration.json parses to PACC protocols",
    async () => {
      const pacc = await wellKnownUserAgentConfig({ config })
      if (!pacc.success) throw new Error(`wellKnownUserAgentConfig failed: ${pacc.errorMessage}`)
      expect(pacc.data.config.protocols?.jmap?.url ?? "").toContain("/jmap/session")
      expect(pacc.data.raw).toContain("protocols")
    },
    { timeout: 30_000 },
  )

  test(
    "all three autoconfig endpoints serve the same document",
    async () => {
      const v1 = await autoconfigMailV1({ config, email: userEmail })
      if (!v1.success) throw new Error(`autoconfigMailV1 failed: ${v1.errorMessage}`)
      const tb = await autoconfigThunderbird({ config, email: userEmail })
      if (!tb.success) throw new Error(`autoconfigThunderbird failed: ${tb.errorMessage}`)
      const mail = await autoconfigMailConfig({ config, email: userEmail })
      if (!mail.success) throw new Error(`autoconfigMailConfig failed: ${mail.errorMessage}`)
      for (const doc of [v1.data.autoconfig, tb.data.autoconfig, mail.data.autoconfig]) {
        expect(doc.domain).toBe("example.test")
        // v1 renders the domain as displayName (0.16 rendered the email address).
        expect(doc.displayName).toBe("example.test")
        expect(doc.incomingServers.length).toBeGreaterThan(0)
        expect(doc.outgoingServers.length).toBeGreaterThan(0)
        expect(doc.clientConfigUpdateUrl ?? "").toContain("config-v1.1.xml")
      }
    },
    { timeout: 30_000 },
  )
})

describe("e2e http-misc: autodiscover and acme", () => {
  test(
    "autodiscover.json returns the V1 redirect for AutodiscoverV1",
    async () => {
      const found = await autodiscoverJson({ config, email: userEmail, protocol: "AutodiscoverV1" })
      if (!found.success) throw new Error(`autodiscoverJson failed: ${found.errorMessage}`)
      expect(found.data.outcome).toBe("ok")
      if (found.data.outcome === "ok") {
        expect(found.data.protocol).toBe("AutodiscoverV1")
        expect(found.data.url).toContain("/autodiscover/autodiscover.xml")
      }
    },
    { timeout: 30_000 },
  )

  test(
    "autodiscover.json pins the InvalidProtocol 400",
    async () => {
      const bad = await autodiscoverJson({ config, email: userEmail, protocol: "Bogus" })
      expect(bad.success).toBe(false)
      if (!bad.success) expect(bad.errorData ?? "").toContain("InvalidProtocol")
    },
    { timeout: 30_000 },
  )

  test(
    "autodiscover.xml posts the Outlook request and parses protocols",
    async () => {
      const requestXml = `<?xml version="1.0" encoding="utf-8"?><Autodiscover xmlns="http://schemas.microsoft.com/exchange/autodiscover/outlook/requestschema/2006"><Request><EMailAddress>${userEmail}</EMailAddress><AcceptableResponseSchema>http://schemas.microsoft.com/exchange/autodiscover/outlook/responseschema/2006a</AcceptableResponseSchema></Request></Autodiscover>`
      const response = await autodiscoverXml({ config, requestXml })
      if (!response.success) throw new Error(`autodiscoverXml failed: ${response.errorMessage}`)
      expect(response.data.response.emailAddress).toBe(userEmail)
      expect(response.data.response.protocols.length).toBeGreaterThan(0)
      expect(response.data.raw).toContain("AutoDiscoverSMTPAddress")
    },
    { timeout: 30_000 },
  )

  test(
    "acme-challenge for an unknown token pins the 404",
    async () => {
      const missing = await wellKnownAcmeChallenge({ config, token: "e2e-unknown-token" })
      expect(missing.success).toBe(false)
      if (!missing.success) expect(missing.errorData ?? "").toContain("404")
    },
    { timeout: 30_000 },
  )
})

describe("e2e http-misc: calendar rsvp", () => {
  test(
    "rsvp page serves bytes when configured, 404 pin otherwise",
    async () => {
      const page = await calendarRsvpPage({ config })
      if (!page.success) {
        console.info(`calendarRsvpPage unavailable (feature off?): ${page.errorMessage}`)
        expect(page.errorData ?? "").toContain("404")
        return
      }
      expect(page.data.length).toBeGreaterThan(100)
      expect(new TextDecoder().decode(page.data.slice(0, 15))).toContain("<")
    },
    { timeout: 30_000 },
  )

  test(
    "rsvp submit with a bogus token returns the typed invalidLink error",
    async () => {
      const rsvp = await calendarRsvpSubmit({ config, token: "e2e-bogus-token" })
      if (!rsvp.success) {
        console.info(`calendarRsvpSubmit unavailable (feature off?): ${rsvp.errorMessage}`)
        expect(rsvp.errorData ?? "").toContain("404")
        return
      }
      expect(rsvp.data.type).toBe("error")
      if (rsvp.data.type === "error") expect(rsvp.data.reason).toBe("invalidLink")
    },
    { timeout: 30_000 },
  )
})

describe("e2e http-misc: contact form with a throwaway config", () => {
  test(
    "submit delivers to a local user, then the original config is restored",
    async () => {
      const original = await httpFormRead()
      if (original === undefined) throw new Error("Unable to read the x:HttpForm singleton")
      httpFormRestore = original

      const enabled = await registrySet({
        config,
        objectType: "HttpForm",
        update: {
          singleton: {
            enable: true,
            deliverTo: { [userEmail]: true },
            validateDomain: false,
            fieldEmail: "email",
            fieldName: "name",
            fieldSubject: "subject",
          },
        },
      })
      if (!enabled.success) throw new Error(`Enabling HttpForm failed: ${enabled.errorMessage}`)
      await registrySet({ config, objectType: "Action", create: { reload: { "@type": "ReloadSettings" } } })

      const submitted = await contactFormSubmit({
        config,
        form: "contact",
        fields: { email: userEmail, name: "E2E", subject: "e2e contact", message: "hello from e2e" },
      })
      if (!submitted.success) throw new Error(`contactFormSubmit failed: ${submitted.errorMessage}`)
      expect(submitted.data.success).toBe(true)

      await httpFormRestoreBestEffort()
      httpFormRestore = undefined
      const restored = await httpFormRead()
      expect(restored?.enable).toBe(original.enable)
    },
    { timeout: 60_000 },
  )
})
