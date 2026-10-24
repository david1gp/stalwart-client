import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { JmapGetResponse } from "../../jmap/jmapGetResponse.js"
import { registryGet } from "../registryGet.js"
import type { RegistryTracer } from "../generated/RegistryTracer.js"
import { type TracerGetOptions, tracerGetOptionsSchema } from "./tracerGetOptionsSchema.js"

/**
 * `x:Tracer/get` — fetch logging/tracing output definitions by id.
 * Variants (`@type`): `Log` (file), `Stdout` (console), `Journal` (systemd),
 * `OtelHttp` / `OtelGrpc` (OpenTelemetry).
 */
export async function tracerGet(options: TracerGetOptions): PromiseResult<JmapGetResponse<RegistryTracer>> {
  const op = "tracerGet"
  const parsed = a.safeParse(tracerGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, ...args } = parsed.output
  return registryGet({ config, objectType: "Tracer", ...args })
}
