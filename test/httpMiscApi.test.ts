import { afterEach, describe, expect, test } from "bun:test"
import { autodiscoverJson } from "../src/autodiscover/autodiscoverJson.js"
import { autodiscoverXml } from "../src/autodiscover/autodiscoverXml.js"
import { calendarRsvpPage } from "../src/calendarRsvp/calendarRsvpPage.js"
import { calendarRsvpSubmit } from "../src/calendarRsvp/calendarRsvpSubmit.js"
import { stalwartClientConfig } from "../src/client/stalwartClientConfig.js"
import { contactFormSubmit } from "../src/forms/contactFormSubmit.js"
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
import { fetchMockCreate, fetchMockJson } from "./fetchMock.js"

const config = stalwartClientConfig({ baseUrl: "https://mail.example.com", token: "API_x" })
if (!config.success) throw new Error("fixture config invalid")

const autoconfigXml = `<?xml version="1.0" encoding="UTF-8"?>
<clientConfig version="1.1">
\t<emailProvider id="example.com">
\t\t<domain>example.com</domain>
\t\t<displayName>alice@example.com</displayName>
\t\t<displayShortName>example.com</displayShortName>
\t\t<incomingServer type="imap">
\t\t\t<hostname>mail.example.com</hostname>
\t\t\t<port>993</port>
\t\t\t<socketType>SSL</socketType>
\t\t\t<username>alice@example.com</username>
\t\t\t<authentication>password-cleartext</authentication>
\t\t</incomingServer>
\t\t<outgoingServer type="smtp">
\t\t\t<hostname>mail.example.com</hostname>
\t\t\t<port>465</port>
\t\t\t<socketType>SSL</socketType>
\t\t\t<username>alice@example.com</username>
\t\t\t<authentication>password-cleartext</authentication>
\t\t</outgoingServer>
\t\t<clientConfigUpdate url="https://autoconfig.example.com/mail/config-v1.1.xml"></clientConfigUpdate>
</clientConfig>
`

const autodiscoverResponseXml = `<?xml version="1.0" encoding="UTF-8"?>
<Autodiscover xmlns="http://schemas.microsoft.com/exchange/autodiscover/responseschema/2006">
\t<Response xmlns="http://schemas.microsoft.com/exchange/autodiscover/outlook/responseschema/2006a">
\t\t<User>
\t\t\t<DisplayName>alice@example.com</DisplayName>
\t\t\t<AutoDiscoverSMTPAddress>alice@example.com</AutoDiscoverSMTPAddress>
\t\t\t<DeploymentId>644560b8-a1ce-429c-8ace-23395843f701</DeploymentId>
\t\t</User>
\t\t<Account>
\t\t\t<AccountType>email</AccountType>
\t\t\t<Action>settings</Action>
\t\t\t<Protocol>
\t\t\t\t<Type>IMAP</Type>
\t\t\t\t<Server>mail.example.com</Server>
\t\t\t\t<Port>993</Port>
\t\t\t\t<LoginName>alice@example.com</LoginName>
\t\t\t\t<SSL>on</SSL>
\t\t\t</Protocol>
\t\t</Account>
\t</Response>
</Autodiscover>
`

describe("well-known discovery redirects are observed, never followed", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("wellKnownJmap reports the 307 to /jmap/session", async () => {
    mock = fetchMockCreate(() => new Response(null, { status: 307, headers: { location: "/jmap/session" } }))
    const r = await wellKnownJmap({ config: config.data })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual({ status: 307, location: "/jmap/session" })
    expect(mock.requests[0]?.url).toBe("https://mail.example.com/.well-known/jmap")
  })

  test("wellKnownCaldav reports the 307 to the DAV base", async () => {
    mock = fetchMockCreate(
      () => new Response(null, { status: 307, headers: { location: "https://mail.example.com/dav/cal" } }),
    )
    const r = await wellKnownCaldav({ config: config.data })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.status).toBe(307)
      expect(r.data.location).toContain("/dav/cal")
    }
  })

  test("wellKnownCarddav reports the 307 to the DAV base", async () => {
    mock = fetchMockCreate(
      () => new Response(null, { status: 307, headers: { location: "https://mail.example.com/dav/card" } }),
    )
    const r = await wellKnownCarddav({ config: config.data })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.status).toBe(307)
      expect(r.data.location).toContain("/dav/card")
    }
  })

  test("a redirect without a location header is a ResultErr", async () => {
    mock = fetchMockCreate(() => new Response(null, { status: 307 }))
    const r = await wellKnownJmap({ config: config.data })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.errorMessage).toContain("no Location header")
  })

  test("invalid redirect options are a ResultErr", async () => {
    mock = fetchMockCreate(() => fetchMockJson({}))
    const r = await wellKnownJmap({ config: { baseUrl: "" } })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("wellKnownJmap")
  })
})

describe("well-known text and JSON documents", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("wellKnownAcmeChallenge fetches the token proof", async () => {
    mock = fetchMockCreate((request) => {
      expect(new URL(request.url).pathname).toBe("/.well-known/acme-challenge/tok%2F123")
      return new Response("key-authorization-proof", { status: 200 })
    })
    const r = await wellKnownAcmeChallenge({ config: config.data, token: "tok/123" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual({ token: "tok/123", proof: "key-authorization-proof" })
  })

  test("wellKnownAcmeChallenge pins a missing token as a 404 ResultErr", async () => {
    mock = fetchMockCreate(() =>
      Response.json(
        { type: "about:blank", status: 404, title: "Not Found", detail: "missing" },
        { status: 404, statusText: "Not Found" },
      ),
    )
    const r = await wellKnownAcmeChallenge({ config: config.data, token: "nope" })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.errorData).toContain("404")
  })

  test("wellKnownMtaSts parses key/value lines and keeps the raw text", async () => {
    const body = "version: STSv1\r\nmode: testing\r\nmax_age: 604800\r\nmx: mail.example.com\r\n"
    mock = fetchMockCreate(() => new Response(body, { status: 200 }))
    const r = await wellKnownMtaSts({ config: config.data })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.policy).toEqual({
        version: "STSv1",
        mode: "testing",
        max_age: "604800",
        mx: "mail.example.com",
      })
      expect(r.data.raw).toBe(body)
    }
  })

  test("wellKnownUserAgentConfig parses the PACC document and keeps the raw JSON", async () => {
    const doc = {
      protocols: { jmap: { url: "https://mail.example.com/jmap/session" } },
      authentication: { password: true },
      info: { provider: { name: "Stalwart" } },
    }
    mock = fetchMockCreate(() => new Response(JSON.stringify(doc), { status: 200 }))
    const r = await wellKnownUserAgentConfig({ config: config.data })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.config.protocols?.jmap?.url).toBe("https://mail.example.com/jmap/session")
      expect(r.data.raw).toContain("Stalwart")
    }
    expect(mock.requests[0]?.url).toBe("https://mail.example.com/.well-known/user-agent-configuration.json")
  })

  test("wellKnownUserAgentConfig rejects non-JSON with a ResultErr", async () => {
    mock = fetchMockCreate(() => new Response("not json", { status: 200 }))
    const r = await wellKnownUserAgentConfig({ config: config.data })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("wellKnownUserAgentConfig")
  })

  test("robotsTxt returns the static crawler policy", async () => {
    mock = fetchMockCreate((request) => {
      expect(new URL(request.url).pathname).toBe("/robots.txt")
      return new Response("User-agent: *\nDisallow: /\n", { status: 200 })
    })
    const r = await robotsTxt({ config: config.data })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toContain("Disallow: /")
  })

  test("invalid user-agent-config options are a ResultErr", async () => {
    mock = fetchMockCreate(() => fetchMockJson({}))
    const r = await wellKnownUserAgentConfig({ config: { baseUrl: "" } })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("wellKnownUserAgentConfig")
  })
})

describe("Thunderbird autoconfig endpoints share one document shape", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("autoconfigMailV1 sends the email query and parses servers", async () => {
    mock = fetchMockCreate((request) => {
      const url = new URL(request.url)
      expect(url.pathname).toBe("/.well-known/mail-v1.xml")
      expect(url.searchParams.get("emailaddress")).toBe("alice@example.com")
      return new Response(autoconfigXml, { status: 200 })
    })
    const r = await autoconfigMailV1({ config: config.data, email: "alice@example.com" })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.autoconfig.domain).toBe("example.com")
      expect(r.data.autoconfig.displayName).toBe("alice@example.com")
      expect(r.data.autoconfig.incomingServers).toEqual([
        {
          type: "imap",
          hostname: "mail.example.com",
          port: 993,
          socketType: "SSL",
          username: "alice@example.com",
          authentication: "password-cleartext",
        },
      ])
      expect(r.data.autoconfig.outgoingServers[0]?.type).toBe("smtp")
      expect(r.data.autoconfig.clientConfigUpdateUrl).toBe("https://autoconfig.example.com/mail/config-v1.1.xml")
      expect(r.data.raw).toContain("<clientConfig")
    }
  })

  test("autoconfigThunderbird hits the thunderbird path", async () => {
    mock = fetchMockCreate((request) => {
      expect(new URL(request.url).pathname).toBe("/.well-known/autoconfig/mail/config-v1.1.xml")
      return new Response(autoconfigXml, { status: 200 })
    })
    const r = await autoconfigThunderbird({ config: config.data, email: "alice@example.com" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.autoconfig.domain).toBe("example.com")
  })

  test("autoconfigMailConfig hits the /mail path", async () => {
    mock = fetchMockCreate((request) => {
      expect(new URL(request.url).pathname).toBe("/mail/config-v1.1.xml")
      return new Response(autoconfigXml, { status: 200 })
    })
    const r = await autoconfigMailConfig({ config: config.data, email: "alice@example.com" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.autoconfig.incomingServers).toHaveLength(1)
  })

  test("autoconfig without an email is a ResultErr", async () => {
    mock = fetchMockCreate(() => fetchMockJson({}))
    const r = await autoconfigMailV1({ config: config.data, email: "" })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("autoconfigMailV1")
  })
})

describe("autodiscover XML and JSON", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("autodiscoverXml posts the request and parses account protocols", async () => {
    const requestXml =
      '<?xml version="1.0"?><Autodiscover><Request><EMailAddress>alice@example.com</EMailAddress></Request></Autodiscover>'
    mock = fetchMockCreate((request) => {
      expect(new URL(request.url).pathname).toBe("/autodiscover/autodiscover.xml")
      expect(String(request.body)).toContain("alice@example.com")
      return new Response(autodiscoverResponseXml, { status: 200 })
    })
    const r = await autodiscoverXml({ config: config.data, requestXml })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.response.emailAddress).toBe("alice@example.com")
      expect(r.data.response.accountType).toBe("email")
      expect(r.data.response.protocols).toEqual([
        { type: "IMAP", server: "mail.example.com", port: 993, loginName: "alice@example.com", ssl: "on" },
      ])
      expect(r.data.raw).toContain("AutoDiscoverSMTPAddress")
    }
  })

  test("autodiscoverJson returns the V1 redirect for a valid protocol", async () => {
    mock = fetchMockCreate((request) => {
      const url = new URL(request.url)
      expect(url.pathname).toBe("/autodiscover/autodiscover.json")
      expect(url.searchParams.get("Email")).toBe("alice@example.com")
      expect(url.searchParams.get("Protocol")).toBe("AutodiscoverV1")
      return new Response(
        JSON.stringify({ Protocol: "AutodiscoverV1", Url: "https://mail.example.com/autodiscover/autodiscover.xml" }),
        { status: 200 },
      )
    })
    const r = await autodiscoverJson({ config: config.data, email: "alice@example.com", protocol: "AutodiscoverV1" })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.outcome).toBe("ok")
      if (r.data.outcome === "ok") expect(r.data.url).toContain("autodiscover.xml")
    }
  })

  test("autodiscoverJson parses the InvalidProtocol error payload", async () => {
    mock = fetchMockCreate(
      () =>
        new Response(
          JSON.stringify({ ErrorCode: "InvalidProtocol", ErrorMessage: "The given protocol value 'X' is invalid." }),
          { status: 200 },
        ),
    )
    const r = await autodiscoverJson({ config: config.data, email: "alice@example.com", protocol: "X" })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.outcome).toBe("error")
      if (r.data.outcome === "error") expect(r.data.errorCode).toBe("InvalidProtocol")
    }
  })

  test("autodiscoverJson without an email is a ResultErr", async () => {
    mock = fetchMockCreate(() => fetchMockJson({}))
    const r = await autodiscoverJson({ config: config.data, email: "" })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("autodiscoverJson")
  })
})

describe("contact form submission", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("contactFormSubmit posts urlencoded fields and returns the delivery outcome", async () => {
    mock = fetchMockCreate((request) => {
      const url = new URL(request.url)
      expect(url.pathname).toBe("/form/contact")
      const body = new URLSearchParams(String(request.body))
      expect(body.get("email")).toBe("visitor@example.org")
      expect(body.get("subject")).toBe("hello")
      return fetchMockJson({ data: { success: true, details: null } })
    })
    const r = await contactFormSubmit({
      config: config.data,
      form: "contact",
      fields: { email: "visitor@example.org", subject: "hello" },
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual({ success: true, details: null })
  })

  test("contactFormSubmit surfaces a delivery failure as a ResultErr", async () => {
    mock = fetchMockCreate(() =>
      Response.json({ data: { success: false, details: "No MX records found." } }, { status: 400 }),
    )
    const r = await contactFormSubmit({ config: config.data, form: "contact", fields: { email: "bad" } })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.errorData).toContain("No MX records")
  })

  test("contactFormSubmit without a form name is a ResultErr", async () => {
    mock = fetchMockCreate(() => fetchMockJson({}))
    const r = await contactFormSubmit({ config: config.data, form: "", fields: {} })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("contactFormSubmit")
  })
})

describe("calendar RSVP page and API", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("calendarRsvpPage returns the raw page bytes", async () => {
    const bytes = new TextEncoder().encode("<!DOCTYPE html><html></html>")
    mock = fetchMockCreate((request) => {
      expect(new URL(request.url).pathname).toBe("/calendar/rsvp")
      return new Response(bytes, { status: 200 })
    })
    const r = await calendarRsvpPage({ config: config.data })
    expect(r.success).toBe(true)
    if (r.success) expect(new TextDecoder().decode(r.data.slice(0, 15))).toContain("<")
  })

  test("calendarRsvpSubmit returns the typed invalidLink error for a bad token", async () => {
    mock = fetchMockCreate((request) => {
      expect(new URL(request.url).pathname).toBe("/api/calendar/rsvp")
      const body = JSON.parse(String(request.body)) as Record<string, unknown>
      expect(body).toEqual({ token: "bogus" })
      return fetchMockJson({
        type: "error",
        reason: "invalidLink",
        title: "Failed to record your RSVP.",
        message: "The RSVP request was invalid or malformed.",
        language: "en-US",
        dir: "ltr",
      })
    })
    const r = await calendarRsvpSubmit({ config: config.data, token: "bogus" })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.type).toBe("error")
      if (r.data.type === "error") expect(r.data.reason).toBe("invalidLink")
    }
  })

  test("calendarRsvpSubmit returns a recorded reply", async () => {
    mock = fetchMockCreate(() => fetchMockJson({ type: "recorded", partstat: "ACCEPTED" }))
    const r = await calendarRsvpSubmit({ config: config.data, token: "t", partstat: "ACCEPTED" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual({ type: "recorded", partstat: "ACCEPTED" })
  })

  test("calendarRsvpSubmit without a token is a ResultErr", async () => {
    mock = fetchMockCreate(() => fetchMockJson({}))
    const r = await calendarRsvpSubmit({ config: config.data, token: "" })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("calendarRsvpSubmit")
  })
})
