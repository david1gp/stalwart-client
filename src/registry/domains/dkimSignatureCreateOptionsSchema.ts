import * as a from "valibot"
import { stalwartClientConfigSchema } from "../../client/stalwartClientConfigSchema.js"
import { dkimSignatureAlgorithms } from "./dkimSignatureAlgorithms.js"

/** Options for `dkimSignatureCreate` for any of the four DKIM algorithms. */
export const dkimSignatureCreateOptionsSchema = a.object({
  config: stalwartClientConfigSchema,
  domainId: a.string(),
  selector: a.pipe(a.string(), a.minLength(1)),
  /** PEM-encoded private key (Ed25519 for `*Ed25519Sha256`, RSA for `*RsaSha256`). */
  privateKey: a.pipe(a.string(), a.minLength(1)),
  algorithm: a.optional(a.picklist(dkimSignatureAlgorithms), "Dkim1Ed25519Sha256"),
  /** Required by the server for Dkim2 signatures; defaults to `{}`. */
  flags: a.optional(a.record(a.string(), a.boolean())),
  report: a.optional(a.boolean()),
})

export type DkimSignatureCreateOptions = a.InferInput<typeof dkimSignatureCreateOptionsSchema>
