import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import type { RegistrySpamClassify } from "../generated/RegistrySpamClassify.js"
import { registrySet } from "../registrySet.js"
import { actionClassifySpamOptionsSchema, type ActionClassifySpamOptions } from "./actionClassifySpamOptionsSchema.js"

/**
 * Run the `ClassifySpam` management action (spam-filter classification
 * for a raw message).
 *
 * Like `TroubleshootDmarc`, the server answers with the classification
 * result object in `created` instead of an id
 * (`crates/jmap/src/registry/mapping/action.rs:183-205`), so this returns
 * that result rather than an action id.
 */
export async function actionClassifySpam(
  options: ActionClassifySpamOptions,
): PromiseResult<RegistrySpamClassify & { id?: string }> {
  const op = "actionClassifySpam"
  const parsed = a.safeParse(actionClassifySpamOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const response = await registrySet({
    config: parsed.output.config,
    objectType: "Action",
    create: {
      a1: {
        "@type": "ClassifySpam",
        ...(parsed.output.authenticatedAs !== undefined ? { authenticatedAs: parsed.output.authenticatedAs } : {}),
        ehloDomain: parsed.output.ehloDomain,
        envFrom: parsed.output.envFrom,
        ...(parsed.output.envFromParameters !== undefined
          ? { envFromParameters: parsed.output.envFromParameters }
          : {}),
        envRcptTo: parsed.output.envRcptTo,
        ...(parsed.output.isTls !== undefined ? { isTls: parsed.output.isTls } : {}),
        message: parsed.output.message,
        remoteIp: parsed.output.remoteIp,
      },
    },
    ...(parsed.output.accountId !== undefined ? { accountId: parsed.output.accountId } : {}),
  })
  if (!response.success) return response
  const created = response.data.created?.a1 as Record<string, unknown> | undefined
  if (created === undefined || typeof created !== "object") {
    return createResultError(op, "ClassifySpam completed without a result", JSON.stringify(response.data))
  }
  return createResult(created as unknown as RegistrySpamClassify & { id?: string })
}
