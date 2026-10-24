import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

const setPatchSchema = a.record(a.string(), a.unknown())

/**
 * `x:Tracer/set` options. `create` entries use `RegistryTracerCreate`
 * (`@type` + variant fields); `update` is a JMAP PatchObject per id.
 */
export const tracerSetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  create: a.optional(a.record(a.string(), setPatchSchema)),
  update: a.optional(a.record(a.string(), setPatchSchema)),
  destroy: a.optional(a.array(a.string())),
  ifInState: a.optional(a.string()),
  accountId: a.optional(a.string()),
})

export type TracerSetOptions = a.InferInput<typeof tracerSetOptionsSchema>
