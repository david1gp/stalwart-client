import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { acmeProviderGet } from "../acmeProviderGet.js"
import { acmeProviderQuery } from "../acmeProviderQuery.js"
import { acmeProviderSet } from "../acmeProviderSet.js"
import { certificateGet } from "../certificateGet.js"
import { certificateQuery } from "../certificateQuery.js"
import { certificateSet } from "../certificateSet.js"
import { dkimSignatureAlgorithms } from "../dkimSignatureAlgorithms.js"
import { dkimSignatureCreate } from "../dkimSignatureCreate.js"
import { dkimSignatureGet } from "../dkimSignatureGet.js"
import { dkimSignatureQuery } from "../dkimSignatureQuery.js"
import { dkimSignatureSet } from "../dkimSignatureSet.js"
import { dnsResolverGet } from "../dnsResolverGet.js"
import { dnsResolverSet } from "../dnsResolverSet.js"
import { dnsServerGet } from "../dnsServerGet.js"
import { dnsServerQuery } from "../dnsServerQuery.js"
import { dnsServerSet } from "../dnsServerSet.js"
import { domainCreate } from "../domainCreate.js"
import { domainDestroy } from "../domainDestroy.js"
import { domainGet } from "../domainGet.js"
import { domainQuery } from "../domainQuery.js"
import { domainSet } from "../domainSet.js"
import { domainZoneFile } from "../domainZoneFile.js"
import { cliConfigFlagParams } from "../../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../../cli/cliConfigFlags.js"
import { cliFail } from "../../../cli/cliFail.js"
import { cliJsonParse } from "../../../cli/cliJsonParse.js"
import { cliRunApi } from "../../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../../cli/cliScalarFlagParams.js"

function jsonFlagRead(op: string, flag: string, value: string | undefined): Record<string, unknown> | undefined {
  if (value === undefined) return undefined
  const parsed = cliJsonParse(value, op, flag)
  if (!parsed.success) cliFail(parsed)
  return parsed.data as Record<string, unknown>
}

const domainGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { ids?: string[]; properties?: string[] }) {
    await cliRunApi(this, flags, (config) => domainGet({ config, ids: flags.ids, properties: flags.properties }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      ids: cliScalarFlagParams.optionalStringList("Comma-separated ids (default: all)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:Domain/get — fetch email domains" },
})

const domainQueryCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { filterJson?: string; sortJson?: string; limit?: number; position?: number },
  ) {
    const op = "domainQuery"
    const filter = jsonFlagRead(op, "filterJson", flags.filterJson)
    const sort = jsonFlagRead(op, "sortJson", flags.sortJson)
    await cliRunApi(this, flags, (config) =>
      domainQuery({
        config,
        filter: filter as Record<string, string | number | boolean | null> | undefined,
        sort: sort as unknown as { property: string; isAscending?: boolean }[] | undefined,
        limit: flags.limit,
        position: flags.position,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      filterJson: cliScalarFlagParams.optionalString('Filter as JSON, e.g. {"name":"example.com"}'),
      sortJson: cliScalarFlagParams.optionalString('Sort as JSON array, e.g. [{"property":"name"}]'),
      limit: cliScalarFlagParams.optionalNumber("Max ids to return"),
      position: cliScalarFlagParams.optionalNumber("Zero-based start position"),
    },
  },
  docs: { brief: "x:Domain/query — list email domains ids" },
})

const domainSetCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { createJson?: string; updateJson?: string; destroy?: string[] },
  ) {
    const op = "domainSet"
    const create = jsonFlagRead(op, "createJson", flags.createJson)
    const update = jsonFlagRead(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      domainSet({
        config,
        create: create as Record<string, Record<string, unknown>> | undefined,
        update: update as Record<string, Record<string, unknown>> | undefined,
        destroy: flags.destroy,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      createJson: cliScalarFlagParams.optionalString('Creations as JSON: {"<creationId>": {…object…}}'),
      updateJson: cliScalarFlagParams.optionalString('Updates as JSON: {"<id>": {…patch…}}'),
      destroy: cliScalarFlagParams.optionalStringList("Comma-separated ids to destroy"),
    },
  },
  docs: { brief: "x:Domain/set — create, update and/or destroy email domains" },
})

const domainCreateCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { name: string; domainJson?: string }) {
    const op = "domainCreate"
    const domain = jsonFlagRead(op, "domainJson", flags.domainJson)
    await cliRunApi(this, flags, (config) =>
      domainCreate({ config, name: flags.name, domain: domain as Record<string, unknown> | undefined }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      name: cliScalarFlagParams.requiredString("Domain name, e.g. example.com"),
      domainJson: cliScalarFlagParams.optionalString("Extra RegistryDomainCreate fields as JSON"),
    },
  },
  docs: { brief: "Create an email domain (server fills defaults, auto-provisions DKIM)" },
})

const domainDestroyCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: string }) {
    await cliRunApi(this, flags, (config) => domainDestroy({ config, id: flags.id }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("Domain id to destroy (DKIM signatures first)"),
    },
  },
  docs: { brief: "Destroy a domain after its auto-provisioned DKIM signatures" },
})

const domainZoneFileCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: string }) {
    await cliRunApi(this, flags, (config) => domainZoneFile({ config, id: flags.id }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("Domain id to read the zone file for"),
    },
  },
  docs: { brief: "Read the dnsZoneFile property (DomainZone view)" },
})

const dkimSignatureGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { ids?: string[]; properties?: string[] }) {
    await cliRunApi(this, flags, (config) => dkimSignatureGet({ config, ids: flags.ids, properties: flags.properties }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      ids: cliScalarFlagParams.optionalStringList("Comma-separated ids (default: all)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:DkimSignature/get — fetch DKIM signatures" },
})

const dkimSignatureQueryCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { filterJson?: string; sortJson?: string; limit?: number; position?: number },
  ) {
    const op = "dkimSignatureQuery"
    const filter = jsonFlagRead(op, "filterJson", flags.filterJson)
    const sort = jsonFlagRead(op, "sortJson", flags.sortJson)
    await cliRunApi(this, flags, (config) =>
      dkimSignatureQuery({
        config,
        filter: filter as Record<string, string | number | boolean | null> | undefined,
        sort: sort as unknown as { property: string; isAscending?: boolean }[] | undefined,
        limit: flags.limit,
        position: flags.position,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      filterJson: cliScalarFlagParams.optionalString('Filter as JSON, e.g. {"name":"example.com"}'),
      sortJson: cliScalarFlagParams.optionalString('Sort as JSON array, e.g. [{"property":"name"}]'),
      limit: cliScalarFlagParams.optionalNumber("Max ids to return"),
      position: cliScalarFlagParams.optionalNumber("Zero-based start position"),
    },
  },
  docs: { brief: "x:DkimSignature/query — list DKIM signatures ids" },
})

const dkimSignatureSetCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { createJson?: string; updateJson?: string; destroy?: string[] },
  ) {
    const op = "dkimSignatureSet"
    const create = jsonFlagRead(op, "createJson", flags.createJson)
    const update = jsonFlagRead(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      dkimSignatureSet({
        config,
        create: create as Record<string, Record<string, unknown>> | undefined,
        update: update as Record<string, Record<string, unknown>> | undefined,
        destroy: flags.destroy,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      createJson: cliScalarFlagParams.optionalString('Creations as JSON: {"<creationId>": {…object…}}'),
      updateJson: cliScalarFlagParams.optionalString('Updates as JSON: {"<id>": {…patch…}}'),
      destroy: cliScalarFlagParams.optionalStringList("Comma-separated ids to destroy"),
    },
  },
  docs: { brief: "x:DkimSignature/set — create, update and/or destroy DKIM signatures" },
})

const dkimSignatureCreateCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & {
      domainId: string
      selector: string
      privateKey: string
      algorithm?: string
      flagsJson?: string
      report?: boolean
    },
  ) {
    const op = "dkimSignatureCreate"
    const algorithm = (flags.algorithm ?? "Dkim1Ed25519Sha256") as (typeof dkimSignatureAlgorithms)[number]
    if (!(dkimSignatureAlgorithms as readonly string[]).includes(algorithm)) {
      cliFail({ success: false, op, errorMessage: `Unknown algorithm ${flags.algorithm}` } as never)
    }
    const flagsValue = jsonFlagRead(op, "flagsJson", flags.flagsJson)
    await cliRunApi(this, flags, (config) =>
      dkimSignatureCreate({
        config,
        domainId: flags.domainId,
        selector: flags.selector,
        privateKey: flags.privateKey,
        algorithm,
        flags: flagsValue as Record<string, boolean> | undefined,
        report: flags.report,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      domainId: cliScalarFlagParams.requiredString("Domain id the signature belongs to"),
      selector: cliScalarFlagParams.requiredString("DKIM selector, e.g. s1"),
      privateKey: cliScalarFlagParams.requiredString("PEM-encoded private key"),
      algorithm: cliScalarFlagParams.optionalString(
        "Dkim1Ed25519Sha256 (default), Dkim1RsaSha256, Dkim2Ed25519Sha256, Dkim2RsaSha256",
      ),
      flagsJson: cliScalarFlagParams.optionalString("Dkim2 policy flags as JSON (default {})"),
      report: cliScalarFlagParams.optionalBoolean("Request failure reports from recipients"),
    },
  },
  docs: { brief: "Create a DKIM signature for any of the four algorithms" },
})

const certificateGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { ids?: string[]; properties?: string[] }) {
    await cliRunApi(this, flags, (config) => certificateGet({ config, ids: flags.ids, properties: flags.properties }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      ids: cliScalarFlagParams.optionalStringList("Comma-separated ids (default: all)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:Certificate/get — fetch TLS certificates" },
})

const certificateQueryCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { filterJson?: string; sortJson?: string; limit?: number; position?: number },
  ) {
    const op = "certificateQuery"
    const filter = jsonFlagRead(op, "filterJson", flags.filterJson)
    const sort = jsonFlagRead(op, "sortJson", flags.sortJson)
    await cliRunApi(this, flags, (config) =>
      certificateQuery({
        config,
        filter: filter as Record<string, string | number | boolean | null> | undefined,
        sort: sort as unknown as { property: string; isAscending?: boolean }[] | undefined,
        limit: flags.limit,
        position: flags.position,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      filterJson: cliScalarFlagParams.optionalString('Filter as JSON, e.g. {"name":"example.com"}'),
      sortJson: cliScalarFlagParams.optionalString('Sort as JSON array, e.g. [{"property":"name"}]'),
      limit: cliScalarFlagParams.optionalNumber("Max ids to return"),
      position: cliScalarFlagParams.optionalNumber("Zero-based start position"),
    },
  },
  docs: { brief: "x:Certificate/query — list TLS certificates ids" },
})

const certificateSetCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { createJson?: string; updateJson?: string; destroy?: string[] },
  ) {
    const op = "certificateSet"
    const create = jsonFlagRead(op, "createJson", flags.createJson)
    const update = jsonFlagRead(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      certificateSet({
        config,
        create: create as Record<string, Record<string, unknown>> | undefined,
        update: update as Record<string, Record<string, unknown>> | undefined,
        destroy: flags.destroy,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      createJson: cliScalarFlagParams.optionalString('Creations as JSON: {"<creationId>": {…object…}}'),
      updateJson: cliScalarFlagParams.optionalString('Updates as JSON: {"<id>": {…patch…}}'),
      destroy: cliScalarFlagParams.optionalStringList("Comma-separated ids to destroy"),
    },
  },
  docs: { brief: "x:Certificate/set — create, update and/or destroy TLS certificates" },
})

const acmeProviderGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { ids?: string[]; properties?: string[] }) {
    await cliRunApi(this, flags, (config) => acmeProviderGet({ config, ids: flags.ids, properties: flags.properties }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      ids: cliScalarFlagParams.optionalStringList("Comma-separated ids (default: all)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:AcmeProvider/get — fetch ACME providers" },
})

const acmeProviderQueryCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { filterJson?: string; sortJson?: string; limit?: number; position?: number },
  ) {
    const op = "acmeProviderQuery"
    const filter = jsonFlagRead(op, "filterJson", flags.filterJson)
    const sort = jsonFlagRead(op, "sortJson", flags.sortJson)
    await cliRunApi(this, flags, (config) =>
      acmeProviderQuery({
        config,
        filter: filter as Record<string, string | number | boolean | null> | undefined,
        sort: sort as unknown as { property: string; isAscending?: boolean }[] | undefined,
        limit: flags.limit,
        position: flags.position,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      filterJson: cliScalarFlagParams.optionalString('Filter as JSON, e.g. {"name":"example.com"}'),
      sortJson: cliScalarFlagParams.optionalString('Sort as JSON array, e.g. [{"property":"name"}]'),
      limit: cliScalarFlagParams.optionalNumber("Max ids to return"),
      position: cliScalarFlagParams.optionalNumber("Zero-based start position"),
    },
  },
  docs: { brief: "x:AcmeProvider/query — list ACME providers ids" },
})

const acmeProviderSetCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { createJson?: string; updateJson?: string; destroy?: string[] },
  ) {
    const op = "acmeProviderSet"
    const create = jsonFlagRead(op, "createJson", flags.createJson)
    const update = jsonFlagRead(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      acmeProviderSet({
        config,
        create: create as Record<string, Record<string, unknown>> | undefined,
        update: update as Record<string, Record<string, unknown>> | undefined,
        destroy: flags.destroy,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      createJson: cliScalarFlagParams.optionalString('Creations as JSON: {"<creationId>": {…object…}}'),
      updateJson: cliScalarFlagParams.optionalString('Updates as JSON: {"<id>": {…patch…}}'),
      destroy: cliScalarFlagParams.optionalStringList("Comma-separated ids to destroy"),
    },
  },
  docs: { brief: "x:AcmeProvider/set — create, update and/or destroy ACME providers" },
})

const dnsServerGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { ids?: string[]; properties?: string[] }) {
    await cliRunApi(this, flags, (config) => dnsServerGet({ config, ids: flags.ids, properties: flags.properties }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      ids: cliScalarFlagParams.optionalStringList("Comma-separated ids (default: all)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:DnsServer/get — fetch DNS servers" },
})

const dnsServerQueryCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { filterJson?: string; sortJson?: string; limit?: number; position?: number },
  ) {
    const op = "dnsServerQuery"
    const filter = jsonFlagRead(op, "filterJson", flags.filterJson)
    const sort = jsonFlagRead(op, "sortJson", flags.sortJson)
    await cliRunApi(this, flags, (config) =>
      dnsServerQuery({
        config,
        filter: filter as Record<string, string | number | boolean | null> | undefined,
        sort: sort as unknown as { property: string; isAscending?: boolean }[] | undefined,
        limit: flags.limit,
        position: flags.position,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      filterJson: cliScalarFlagParams.optionalString('Filter as JSON, e.g. {"name":"example.com"}'),
      sortJson: cliScalarFlagParams.optionalString('Sort as JSON array, e.g. [{"property":"name"}]'),
      limit: cliScalarFlagParams.optionalNumber("Max ids to return"),
      position: cliScalarFlagParams.optionalNumber("Zero-based start position"),
    },
  },
  docs: { brief: "x:DnsServer/query — list DNS servers ids" },
})

const dnsServerSetCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { createJson?: string; updateJson?: string; destroy?: string[] },
  ) {
    const op = "dnsServerSet"
    const create = jsonFlagRead(op, "createJson", flags.createJson)
    const update = jsonFlagRead(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      dnsServerSet({
        config,
        create: create as Record<string, Record<string, unknown>> | undefined,
        update: update as Record<string, Record<string, unknown>> | undefined,
        destroy: flags.destroy,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      createJson: cliScalarFlagParams.optionalString('Creations as JSON: {"<creationId>": {…object…}}'),
      updateJson: cliScalarFlagParams.optionalString('Updates as JSON: {"<id>": {…patch…}}'),
      destroy: cliScalarFlagParams.optionalStringList("Comma-separated ids to destroy"),
    },
  },
  docs: { brief: "x:DnsServer/set — create, update and/or destroy DNS servers" },
})

const dnsResolverGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { ids?: string[]; properties?: string[] }) {
    await cliRunApi(this, flags, (config) => dnsResolverGet({ config, ids: flags.ids, properties: flags.properties }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      ids: cliScalarFlagParams.optionalStringList("Comma-separated ids (default: all)"),
      properties: cliScalarFlagParams.optionalStringList("Comma-separated properties to return"),
    },
  },
  docs: { brief: "x:DnsResolver/get — fetch the DNS resolver" },
})

const dnsResolverSetCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { createJson?: string; updateJson?: string; destroy?: string[] },
  ) {
    const op = "dnsResolverSet"
    const create = jsonFlagRead(op, "createJson", flags.createJson)
    const update = jsonFlagRead(op, "updateJson", flags.updateJson)
    await cliRunApi(this, flags, (config) =>
      dnsResolverSet({
        config,
        create: create as Record<string, Record<string, unknown>> | undefined,
        update: update as Record<string, Record<string, unknown>> | undefined,
        destroy: flags.destroy,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      createJson: cliScalarFlagParams.optionalString('Creations as JSON: {"<creationId>": {…object…}}'),
      updateJson: cliScalarFlagParams.optionalString('Updates as JSON: {"<id>": {…patch…}}'),
      destroy: cliScalarFlagParams.optionalStringList("Comma-separated ids to destroy"),
    },
  },
  docs: { brief: "x:DnsResolver/set — create, update and/or destroy the DNS resolver" },
})

const domainCommands = buildRouteMap({
  routes: {
    get: domainGetCommand,
    query: domainQueryCommand,
    set: domainSetCommand,
    create: domainCreateCommand,
    destroy: domainDestroyCommand,
    "zone-file": domainZoneFileCommand,
  },
  docs: { brief: "Manage email domains" },
})

const dkimSignatureCommands = buildRouteMap({
  routes: {
    get: dkimSignatureGetCommand,
    query: dkimSignatureQueryCommand,
    set: dkimSignatureSetCommand,
    create: dkimSignatureCreateCommand,
  },
  docs: { brief: "Manage DKIM signatures" },
})

const certificateCommands = buildRouteMap({
  routes: {
    get: certificateGetCommand,
    query: certificateQueryCommand,
    set: certificateSetCommand,
  },
  docs: { brief: "Manage TLS certificates" },
})

const acmeProviderCommands = buildRouteMap({
  routes: {
    get: acmeProviderGetCommand,
    query: acmeProviderQueryCommand,
    set: acmeProviderSetCommand,
  },
  docs: { brief: "Manage ACME providers" },
})

const dnsServerCommands = buildRouteMap({
  routes: {
    get: dnsServerGetCommand,
    query: dnsServerQueryCommand,
    set: dnsServerSetCommand,
  },
  docs: { brief: "Manage DNS servers" },
})

const dnsResolverCommands = buildRouteMap({
  routes: {
    get: dnsResolverGetCommand,
    set: dnsResolverSetCommand,
  },
  docs: { brief: "Manage the DNS resolver" },
})

export const domainsCommands = buildRouteMap({
  routes: {
    domain: domainCommands,
    "dkim-signature": dkimSignatureCommands,
    certificate: certificateCommands,
    "acme-provider": acmeProviderCommands,
    "dns-server": dnsServerCommands,
    "dns-resolver": dnsResolverCommands,
  },
  docs: { brief: "Email domains, DNS, DKIM, certificates and providers" },
})
