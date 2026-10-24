/** Server-assigned fields returned for each created registry object (always `id`, sometimes more, e.g. API key `secret`). */
export type RegistryCreated = { id: string } & Record<string, unknown>
