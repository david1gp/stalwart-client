import * as a from "valibot"
import { createResult, createResultError, type Result } from "#result"
import type { StalwartClientConfig, StalwartClientConfigInput } from "./stalwartClientConfigSchema.js"
import { stalwartClientConfigSchema } from "./stalwartClientConfigSchema.js"

export function stalwartClientConfig(input: StalwartClientConfigInput): Result<StalwartClientConfig> {
  const op = "stalwartClientConfig"
  const parsed = a.safeParse(stalwartClientConfigSchema, input)
  if (!parsed.success) {
    return createResultError(op, a.summarize(parsed.issues))
  }
  return createResult(parsed.output)
}
