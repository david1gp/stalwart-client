import { createResult, createResultError, type PromiseResult } from "#result"
import type { JmapCapabilityResolver } from "./jmapCapabilityResolver.js"
import type { JmapClientConfig } from "./jmapClientConfigSchema.js"
import type { JmapMethodError } from "./jmapMethodError.js"
import { jmapRequest } from "./jmapRequest.js"
import type { JmapSession } from "./jmapSession.js"
import type { JmapMethodCallOptions } from "./jmapMethodCallOptions.js"

/** Single JMAP method call → `Result<T>`. A method-level `error` response becomes a ResultErr. */
export async function jmapMethodCall<T = unknown>(options: JmapMethodCallOptions): PromiseResult<T> {
  const op = "jmapMethodCall"
  const responses = await jmapRequest({
    config: options.config,
    calls: [{ methodName: options.methodName, arguments: options.arguments, callId: options.callId }],
    capabilityResolvers: options.capabilityResolvers,
    using: options.using,
    session: options.session,
  })
  if (!responses.success) return responses
  const response = responses.data[0]
  if (response === undefined) return createResultError(op, "Empty methodResponses in JMAP response")
  if (response.methodName === "error") {
    const err = response.arguments as unknown as JmapMethodError
    const type = typeof err.type === "string" ? err.type : "error"
    const description = typeof err.description === "string" ? `: ${err.description}` : ""
    return createResultError(op, `${type}${description}`, JSON.stringify(response.arguments))
  }
  return createResult(response.arguments as T)
}
