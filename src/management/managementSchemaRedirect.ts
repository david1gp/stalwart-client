import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { jmapAuthHeader } from "../jmap/jmapAuthHeader.js"
import type { ManagementSchemaReference as ManagementSchemaReferenceResult } from "./ManagementSchemaReference.js"
import {
  managementSchemaRedirectOptionsSchema,
  type ManagementSchemaRedirectOptions,
} from "./managementSchemaRedirectOptionsSchema.js"

/**
 * Resolve the current configuration schema hash (`GET /api/schema`, authenticated).
 *
 * The server answers 302 to `/api/schema/{sha256}` (`crates/http/src/api/mod.rs`);
 * this reads the `Location` header with redirects disabled instead of
 * following it, so the hash is captured exactly.
 */
export async function managementSchemaRedirect(
  options: ManagementSchemaRedirectOptions,
): PromiseResult<ManagementSchemaReferenceResult> {
  const op = "managementSchemaRedirect"
  const parsed = a.safeParse(managementSchemaRedirectOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config } = parsed.output
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs ?? 30_000)
  try {
    const response = await fetch(`${config.baseUrl}/api/schema`, {
      method: "GET",
      headers: { Accept: "application/json", ...jmapAuthHeader(config) },
      redirect: "manual",
      signal: controller.signal,
    })
    if (response.status !== 301 && response.status !== 302) {
      return createResultError(
        op,
        `Expected a schema redirect (301/302), got ${response.status}`,
        String(response.status),
      )
    }
    const location = response.headers.get("location")
    if (!location) return createResultError(op, "Schema redirect had no Location header")
    const hash = location.split("/").pop() ?? ""
    if (hash === "") return createResultError(op, `Schema redirect Location has no hash segment: ${location}`)
    return createResult({ hash, location })
  } catch (error) {
    return createResultError(
      op,
      "Fetching the schema redirect failed",
      error instanceof Error ? error.message : String(error),
    )
  } finally {
    clearTimeout(timeoutId)
  }
}
