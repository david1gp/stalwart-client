import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"
import type { RegistryActionCreate } from "../generated/RegistryActionCreate.js"

export const actionRunOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  /** The action to run, typed over the `RegistryAction` create union. Actions are create-only. */
  action: a.record(a.string(), a.unknown()),
  accountId: a.optional(a.string()),
})

export type ActionRunOptions = Omit<a.InferInput<typeof actionRunOptionsSchema>, "action"> & {
  action: RegistryActionCreate
}
