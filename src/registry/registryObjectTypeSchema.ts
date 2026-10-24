import * as a from "valibot"
import type { RegistryObjectType } from "./generated/RegistryObjectType.js"
import { registryObjectTypes } from "./generated/registryObjectTypes.js"

/** Validates a registry object type name (`"Domain"`, `"Imap"`, … — no `x:` prefix). */
export const registryObjectTypeSchema = a.custom<RegistryObjectType>(
  (value) => typeof value === "string" && Object.hasOwn(registryObjectTypes, value),
  'Unknown registry object type (expected e.g. "Domain", without the x: prefix)',
)
