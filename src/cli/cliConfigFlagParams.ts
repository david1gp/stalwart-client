/** Shared optional flags that override env. */
export const cliConfigFlagParams = {
  baseUrl: {
    kind: "parsed" as const,
    parse: String,
    optional: true as const,
    brief: "Override STALWART_BASE_URL",
  },
  username: {
    kind: "parsed" as const,
    parse: String,
    optional: true as const,
    brief: "Override STALWART_USERNAME",
  },
  password: {
    kind: "parsed" as const,
    parse: String,
    optional: true as const,
    brief: "Override STALWART_PASSWORD",
  },
  token: {
    kind: "parsed" as const,
    parse: String,
    optional: true as const,
    brief: "Override STALWART_TOKEN (Bearer; ignored when username/password are set)",
  },
  accountId: {
    kind: "parsed" as const,
    parse: String,
    optional: true as const,
    brief: "Override STALWART_ACCOUNT_ID",
  },
}
