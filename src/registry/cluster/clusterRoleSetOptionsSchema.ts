import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"

const clusterRolePatchSchema = a.record(a.string(), a.unknown())

export const clusterRoleSetOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  create: a.optional(a.record(a.string(), clusterRolePatchSchema)),
  update: a.optional(a.record(a.string(), clusterRolePatchSchema)),
  destroy: a.optional(a.array(a.string())),
  ifInState: a.optional(a.string()),
  accountId: a.optional(a.string()),
})

export type ClusterRoleSetOptions = a.InferInput<typeof clusterRoleSetOptionsSchema>
