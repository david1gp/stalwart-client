import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { jmapHttpRequest } from "../jmap/jmapHttpRequest.js"
import type { AutoconfigClientConfig, AutoconfigServer, AutoconfigService } from "./AutoconfigClientConfig.js"
import {
  autoconfigThunderbirdOptionsSchema,
  type AutoconfigThunderbirdOptions,
} from "./autoconfigThunderbirdOptionsSchema.js"

/** Parsed autoconfig document plus the raw XML text. */
export interface AutoconfigThunderbird {
  autoconfig: AutoconfigClientConfig
  raw: string
}

function tagText(xml: string, tag: string): string {
  return xml.match(new RegExp(`<${tag}>([^<]*)</${tag}>`))?.[1] ?? ""
}

function tagAttr(block: string, tag: string, attr: string): string {
  return block.match(new RegExp(`<${tag}\\s+[^>]*${attr}="([^"]*)"`))?.[1] ?? ""
}

function serverParse(block: string): AutoconfigServer {
  return {
    type: tagAttr(block, "(?:incomingServer|outgoingServer)", "type"),
    hostname: tagText(block, "hostname"),
    port: Number(tagText(block, "port")),
    socketType: tagText(block, "socketType"),
    username: tagText(block, "username"),
    authentication: tagText(block, "authentication"),
  }
}

function serviceParse(xml: string, tag: "addressBook" | "calendar" | "fileShare"): AutoconfigService | undefined {
  const block = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`))?.[0]
  if (block === undefined) return undefined
  return {
    type: tagAttr(block, tag, "type"),
    username: tagText(block, "username"),
    authentication: tagText(block, "authentication"),
    serverUrl: tagText(block, "serverURL"),
  }
}

function autoconfigXmlParse(raw: string): AutoconfigClientConfig {
  const incoming = [...raw.matchAll(/<incomingServer[^>]*>([\s\S]*?)<\/incomingServer>/g)]
  const outgoing = [...raw.matchAll(/<outgoingServer[^>]*>([\s\S]*?)<\/outgoingServer>/g)]
  const updateUrl = raw.match(/<clientConfigUpdate\s+url="([^"]*)"/)?.[1]
  const addressBook = serviceParse(raw, "addressBook")
  const calendar = serviceParse(raw, "calendar")
  const fileShare = serviceParse(raw, "fileShare")
  return {
    domain: tagText(raw, "domain"),
    displayName: tagText(raw, "displayName"),
    displayShortName: tagText(raw, "displayShortName"),
    incomingServers: incoming.map((m) => serverParse(m[0] ?? "")),
    outgoingServers: outgoing.map((m) => serverParse(m[0] ?? "")),
    ...(addressBook === undefined ? {} : { addressBook }),
    ...(calendar === undefined ? {} : { calendar }),
    ...(fileShare === undefined ? {} : { fileShare }),
    ...(updateUrl === undefined ? {} : { clientConfigUpdateUrl: updateUrl }),
  }
}

/**
 * `GET /.well-known/autoconfig/mail/config-v1.1.xml?emailaddress=` — Thunderbird
 * autoconfig (`crates/http/src/request.rs:379`). Same document as the other two
 * autoconfig endpoints; returns the typed parsed document and the raw XML.
 */
export async function autoconfigThunderbird(
  options: AutoconfigThunderbirdOptions,
): PromiseResult<AutoconfigThunderbird> {
  const op = "autoconfigThunderbird"
  const parsed = a.safeParse(autoconfigThunderbirdOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const raw = await jmapHttpRequest({
    config: parsed.output.config,
    method: "GET",
    path: "/.well-known/autoconfig/mail/config-v1.1.xml",
    query: { emailaddress: parsed.output.email },
    responseType: "text",
    auth: false,
  })
  if (!raw.success) return raw
  return createResult({ autoconfig: autoconfigXmlParse(raw.data), raw: raw.data })
}
