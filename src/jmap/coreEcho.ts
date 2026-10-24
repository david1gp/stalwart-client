import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { coreEchoOptionsSchema, type CoreEchoOptions } from "./coreEchoOptionsSchema.js"
import { jmapMethodCall } from "./jmapMethodCall.js"

/**
 * `Core/echo` — the JMAP ping. The server returns the arguments verbatim,
 * so this doubles as a connectivity + auth smoke test.
 */
export async function coreEcho(options: CoreEchoOptions): PromiseResult<Record<string, unknown>> {
  const op = "coreEcho"
  const parsed = a.safeParse(coreEchoOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  return jmapMethodCall<Record<string, unknown>>({
    config: parsed.output.config,
    methodName: "Core/echo",
    arguments: (parsed.output.args ?? {}) as Record<string, unknown>,
  })
}
