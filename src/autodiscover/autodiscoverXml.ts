import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { jmapHttpRequest } from "../jmap/jmapHttpRequest.js"
import type { AutodiscoverAccountProtocol, AutodiscoverResponse } from "./AutodiscoverResponse.js"
import { autodiscoverXmlOptionsSchema, type AutodiscoverXmlOptions } from "./autodiscoverXmlOptionsSchema.js"

/** Parsed autodiscover account settings plus the raw XML response. */
export interface AutodiscoverXml {
  response: AutodiscoverResponse
  raw: string
}

function tagText(xml: string, tag: string): string {
  return xml.match(new RegExp(`<${tag}>([^<]*)</${tag}>`))?.[1] ?? ""
}

function autodiscoverXmlParse(raw: string): AutodiscoverResponse {
  const protocols: AutodiscoverAccountProtocol[] = [...raw.matchAll(/<Protocol>([\s\S]*?)<\/Protocol>/g)].map((m) => {
    const block = m[1] ?? ""
    return {
      type: tagText(block, "Type"),
      server: tagText(block, "Server"),
      port: Number(tagText(block, "Port")),
      loginName: tagText(block, "LoginName"),
      ssl: tagText(block, "SSL"),
    }
  })
  return {
    displayName: tagText(raw, "DisplayName"),
    emailAddress: tagText(raw, "AutoDiscoverSMTPAddress"),
    deploymentId: tagText(raw, "DeploymentId"),
    accountType: tagText(raw, "AccountType"),
    action: tagText(raw, "Action"),
    protocols,
  }
}

/**
 * `POST /autodiscover/autodiscover.xml` — Outlook autodiscover
 * (`crates/http/src/request.rs:533`; `Autodiscover`/`AutoDiscover` spellings
 * match too). Non-Outlook schemas get the provider-unavailable error document.
 * Returns the typed parsed account settings and the raw XML. Anonymous.
 */
export async function autodiscoverXml(options: AutodiscoverXmlOptions): PromiseResult<AutodiscoverXml> {
  const op = "autodiscoverXml"
  const parsed = a.safeParse(autodiscoverXmlOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const raw = await jmapHttpRequest({
    config: parsed.output.config,
    method: "POST",
    path: "/autodiscover/autodiscover.xml",
    body: { kind: "raw", value: parsed.output.requestXml, contentType: "text/xml" },
    responseType: "text",
    auth: false,
  })
  if (!raw.success) return raw
  return createResult({ response: autodiscoverXmlParse(raw.data), raw: raw.data })
}
