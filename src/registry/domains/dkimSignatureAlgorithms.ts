/** DKIM signature algorithms supported by `x:DkimSignature/set`. */
export const dkimSignatureAlgorithms = [
  "Dkim1Ed25519Sha256",
  "Dkim1RsaSha256",
  "Dkim2Ed25519Sha256",
  "Dkim2RsaSha256",
] as const

export type DkimSignatureAlgorithm = (typeof dkimSignatureAlgorithms)[number]
