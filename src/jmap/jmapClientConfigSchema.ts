import * as a from "valibot"

export const jmapClientConfigSchema = a.object({
  baseUrl: a.pipe(
    a.string(),
    a.minLength(1),
    a.url(),
    a.transform((s) => s.replace(/\/+$/, "")),
  ),
  username: a.optional(a.string()),
  password: a.optional(a.string()),
  token: a.optional(a.string()),
  accountId: a.optional(a.string()),
  timeoutMs: a.optional(a.pipe(a.number(), a.integer(), a.minValue(1))),
  retries: a.optional(a.pipe(a.number(), a.integer(), a.minValue(0))),
})

export type JmapClientConfigInput = a.InferInput<typeof jmapClientConfigSchema>
export type JmapClientConfig = a.InferOutput<typeof jmapClientConfigSchema>
