import * as a from "valibot"
import { createResult, createResultError, type Result } from "#result"
import type { JmapClientConfig, JmapClientConfigInput } from "./jmapClientConfigSchema.js"
import { jmapClientConfigSchema } from "./jmapClientConfigSchema.js"

export function jmapClientConfig(input: JmapClientConfigInput): Result<JmapClientConfig> {
  const op = "jmapClientConfig"
  const parsed = a.safeParse(jmapClientConfigSchema, input)
  if (!parsed.success) {
    return createResultError(op, a.summarize(parsed.issues))
  }
  return createResult(parsed.output)
}
