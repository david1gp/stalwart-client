import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import type { JmapClientConfig } from "./jmapClientConfigSchema.js"
import { jmapHttpRequest } from "./jmapHttpRequest.js"
import type { JmapRequestOptions } from "./jmapRequestOptions.js"
import type { JmapMethodResponse } from "./jmapMethodResponse.js"
import { jmapCapabilities } from "./jmapCapabilities.js"
import { jmapMethodCapabilities } from "./jmapMethodCapabilities.js"
import { jmapApiUrlResolve } from "./jmapApiUrlResolve.js"
import { jmapPaths } from "./jmapPaths.js"
import { jmapSessionGet } from "./jmapSessionGet.js"
import type { JmapSession } from "./jmapSession.js"

const jmapInvocationSchema = a.tuple([a.string(), a.record(a.string(), a.unknown()), a.string()])

const jmapResponseSchema = a.object({
  methodResponses: a.array(jmapInvocationSchema),
  sessionState: a.union([a.string(), a.number()]),
  createdIds: a.optional(a.record(a.string(), a.union([a.string(), a.number()]))),
})

/** Raw batched JMAP request (`POST /jmap/`), for result-reference chains. Returns all method responses. */
export async function jmapRequest(options: JmapRequestOptions): PromiseResult<readonly JmapMethodResponse[]> {
  const op = "jmapRequest"
  const { config, calls } = options
  if (calls.length === 0) return createResultError(op, "At least one call is required")

  let session: JmapSession | undefined = options.session
  if (session === undefined && options.using === undefined) {
    const sessionResult = await jmapSessionGet({ config })
    if (!sessionResult.success) return sessionResult
    session = sessionResult.data
  }

  const resolvers = options.capabilityResolvers ?? []
  let using: string[]
  if (options.using !== undefined) {
    using = [...options.using]
  } else {
    using = [jmapCapabilities.core]
    for (const call of calls) {
      const capabilities = jmapMethodCapabilities(call.methodName, ...resolvers)
      if (!capabilities.success) return capabilities
      for (const capability of capabilities.data) {
        if (!using.includes(capability)) using.push(capability)
      }
    }
  }

  const body = {
    using,
    methodCalls: calls.map((call, index) => [call.methodName, call.arguments, call.callId ?? `c${index + 1}`]),
    ...(options.createdIds !== undefined ? { createdIds: options.createdIds } : {}),
  }

  const path = session !== undefined ? jmapApiUrlResolve(session, config.baseUrl) : jmapPaths.api
  const raw = await jmapHttpRequest<unknown>({
    config,
    method: "POST",
    path,
    body: { kind: "json", value: body },
  })
  if (!raw.success) return raw
  const parsed = a.safeParse(jmapResponseSchema, raw.data)
  if (!parsed.success) {
    return createResultError(op, `Invalid JMAP response: ${a.summarize(parsed.issues)}`, JSON.stringify(raw.data))
  }
  return createResult(
    parsed.output.methodResponses.map(([methodName, args, callId]) => ({
      methodName,
      arguments: args as Record<string, unknown>,
      callId,
    })),
  )
}
