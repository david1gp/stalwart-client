import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import type { RegistryDmarcTroubleshoot } from "../generated/RegistryDmarcTroubleshoot.js"
import { registrySet } from "../registrySet.js"
import {
  actionTroubleshootDmarcOptionsSchema,
  type ActionTroubleshootDmarcOptions,
} from "./actionTroubleshootDmarcOptionsSchema.js"

/**
 * Run the `TroubleshootDmarc` management action (DMARC verification
 * diagnostics for a message envelope). Safe to run against a local domain.
 *
 * Unlike state-changing actions, the server answers with the diagnostic
 * result object in `created` instead of an id
 * (`crates/jmap/src/registry/mapping/action.rs:152-171`), so this returns
 * that result (typed `RegistryDmarcTroubleshoot` plus the JMAP `id`-less
 * envelope) rather than an action id.
 */
export async function actionTroubleshootDmarc(
  options: ActionTroubleshootDmarcOptions,
): PromiseResult<RegistryDmarcTroubleshoot & { id?: string }> {
  const op = "actionTroubleshootDmarc"
  const parsed = a.safeParse(actionTroubleshootDmarcOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const response = await registrySet({
    config: parsed.output.config,
    objectType: "Action",
    create: {
      a1: {
        "@type": "TroubleshootDmarc",
        ehloDomain: parsed.output.ehloDomain,
        mailFrom: parsed.output.mailFrom,
        ...(parsed.output.message !== undefined ? { message: parsed.output.message } : {}),
        remoteIp: parsed.output.remoteIp,
        spfEhloDomain: parsed.output.spfEhloDomain,
        spfMailFromDomain: parsed.output.spfMailFromDomain,
        to: parsed.output.to,
      },
    },
    ...(parsed.output.accountId !== undefined ? { accountId: parsed.output.accountId } : {}),
  })
  if (!response.success) return response
  const created = response.data.created?.a1 as Record<string, unknown> | undefined
  if (created === undefined || typeof created !== "object") {
    return createResultError(op, "TroubleshootDmarc completed without a result", JSON.stringify(response.data))
  }
  return createResult(created as unknown as RegistryDmarcTroubleshoot & { id?: string })
}
