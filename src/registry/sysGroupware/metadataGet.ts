import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import type { RegistryMetadata } from "../generated/RegistryMetadata.js"
import { registryGet } from "../registryGet.js"
import { metadataGetOptionsSchema, type MetadataGetOptions } from "./metadataGetOptionsSchema.js"

/**
 * `x:Metadata/get` — read the object metadata settings singleton
 * (JMAP metadata/privateMetadata, WebDAV dead properties, IMAP annotations:
 * limits, depth, vendor namespaces).
 */
export async function metadataGet(
  options: MetadataGetOptions,
): PromiseResult<JmapGetResponse<RegistryMetadata & { id: string }>> {
  const op = "metadataGet"
  const parsed = a.safeParse(metadataGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return registryGet({ ...parsed.output, objectType: "Metadata" })
}
