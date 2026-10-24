import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { jmapHttpRequest } from "../jmap/jmapHttpRequest.js"
import type { ManagementSchemaDocument as ManagementSchemaDocumentResult } from "./ManagementSchemaDocument.js"
import { managementSchemaOptionsSchema, type ManagementSchemaOptions } from "./managementSchemaOptionsSchema.js"

/**
 * Fetch the configuration schema at a hash (`GET /api/schema/{hash}`, authenticated).
 *
 * The server serves it gzip-encoded with an immutable cache policy; fetch
 * decompresses transparently, so this returns the parsed JSON plus the hash
 * (`crates/http/src/api/mod.rs`). A stale hash redirects to the current one,
 * which fetch follows automatically.
 */
export async function managementSchema(
  options: ManagementSchemaOptions,
): PromiseResult<ManagementSchemaDocumentResult> {
  const op = "managementSchema"
  const parsed = a.safeParse(managementSchemaOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, hash } = parsed.output
  const response = await jmapHttpRequest<Record<string, unknown>>({
    config,
    method: "GET",
    path: `/api/schema/${encodeURIComponent(hash)}`,
  })
  if (!response.success) return response
  return createResult({ hash, schema: response.data })
}
