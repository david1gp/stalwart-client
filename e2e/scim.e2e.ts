import { afterAll, beforeAll, describe, expect, test } from "bun:test"
import type { StalwartClientConfig } from "../src/client/stalwartClientConfigSchema.js"
import { scimBulk } from "../src/scim/scimBulk.js"
import { scimGroupCreate } from "../src/scim/scimGroupCreate.js"
import { scimGroupDelete } from "../src/scim/scimGroupDelete.js"
import { scimGroupGet } from "../src/scim/scimGroupGet.js"
import { scimGroupPatch } from "../src/scim/scimGroupPatch.js"
import { scimGroupQuery } from "../src/scim/scimGroupQuery.js"
import { scimGroupReplace } from "../src/scim/scimGroupReplace.js"
import { scimGroupSearch } from "../src/scim/scimGroupSearch.js"
import { scimResourceTypes } from "../src/scim/scimResourceTypes.js"
import { scimSchemas } from "../src/scim/scimSchemas.js"
import { scimSearchAll } from "../src/scim/scimSearchAll.js"
import { scimServiceProviderConfig } from "../src/scim/scimServiceProviderConfig.js"
import { scimUserCreate } from "../src/scim/scimUserCreate.js"
import { scimUserDelete } from "../src/scim/scimUserDelete.js"
import { scimUserGet } from "../src/scim/scimUserGet.js"
import { scimUserPatch } from "../src/scim/scimUserPatch.js"
import { scimUserQuery } from "../src/scim/scimUserQuery.js"
import { scimUserReplace } from "../src/scim/scimUserReplace.js"
import { scimUserSearch } from "../src/scim/scimUserSearch.js"
import { e2eRunId } from "./e2eRunId.js"
import { stalwartE2eSetup } from "./e2eSetup.js"

let config: StalwartClientConfig
const runId = e2eRunId()

beforeAll(async () => {
  config = await stalwartE2eSetup()
})

afterAll(() => {
  // Nothing to tear down: the community server rejects every SCIM write with
  // 403 before dispatch, so no throwaway object is ever created.
})

function expectEnterpriseGate(
  result: { success: boolean; errorMessage?: string; errorData?: string | null },
  op: string,
) {
  expect(result.success).toBe(false)
  if (result.success) throw new Error(`${op} unexpectedly succeeded on the community server`)
  expect(result.errorMessage).toContain("403")
  expect(result.errorMessage).toContain("Enterprise edition")
  const payload = JSON.parse(result.errorData ?? "{}") as { status?: string; detail?: string; schemas?: string[] }
  expect(payload.status).toBe("403")
  expect(payload.detail).toContain("Enterprise edition")
  expect(payload.schemas).toEqual(["urn:ietf:params:scim:api:messages:2.0:Error"])
  console.info(`E2E ${op} run=${runId}: pinned community 403 enterprise gate`)
}

describe("e2e scim: community server gates every route family with a 403 SCIM error", () => {
  test(
    "user routes answer the enterprise-gate error",
    async () => {
      expectEnterpriseGate(await scimUserQuery({ config, count: 1 }), "scimUserQuery")
      expectEnterpriseGate(
        await scimUserSearch({ config, filter: 'userName eq "alice@example.test"' }),
        "scimUserSearch",
      )
      expectEnterpriseGate(await scimUserGet({ config, id: "c" }), "scimUserGet")
      expectEnterpriseGate(
        await scimUserCreate({ config, user: { userName: `e2e-${runId}@example.test`, displayName: `e2e ${runId}` } }),
        "scimUserCreate",
      )
      expectEnterpriseGate(
        await scimUserReplace({ config, id: "c", user: { userName: "alice@example.test" } }),
        "scimUserReplace",
      )
      expectEnterpriseGate(
        await scimUserPatch({ config, id: "c", operations: [{ op: "replace", path: "displayName", value: "Alice" }] }),
        "scimUserPatch",
      )
      expectEnterpriseGate(await scimUserDelete({ config, id: "c" }), "scimUserDelete")
    },
    { timeout: 30_000 },
  )

  test(
    "group routes answer the enterprise-gate error",
    async () => {
      expectEnterpriseGate(await scimGroupQuery({ config, count: 1 }), "scimGroupQuery")
      expectEnterpriseGate(await scimGroupSearch({ config, filter: 'displayName eq "admins"' }), "scimGroupSearch")
      expectEnterpriseGate(await scimGroupGet({ config, id: "e" }), "scimGroupGet")
      expectEnterpriseGate(await scimGroupCreate({ config, group: { displayName: `e2e-${runId}` } }), "scimGroupCreate")
      expectEnterpriseGate(
        await scimGroupReplace({ config, id: "e", group: { displayName: `e2e-${runId}` } }),
        "scimGroupReplace",
      )
      expectEnterpriseGate(
        await scimGroupPatch({
          config,
          id: "e",
          operations: [{ op: "replace", path: "displayName", value: `e2e-${runId}` }],
        }),
        "scimGroupPatch",
      )
      expectEnterpriseGate(await scimGroupDelete({ config, id: "e" }), "scimGroupDelete")
    },
    { timeout: 30_000 },
  )

  test(
    "bulk answers the enterprise-gate error",
    async () => {
      expectEnterpriseGate(
        await scimBulk({
          config,
          operations: [
            { method: "POST", path: "/Users", bulkId: "u1", data: { userName: `e2e-${runId}@example.test` } },
          ],
        }),
        "scimBulk",
      )
    },
    { timeout: 30_000 },
  )

  test(
    "cross-resource search answers the enterprise-gate error",
    async () => {
      expectEnterpriseGate(await scimSearchAll({ config, count: 10 }), "scimSearchAll")
    },
    { timeout: 30_000 },
  )

  test(
    "discovery routes answer the enterprise-gate error",
    async () => {
      expectEnterpriseGate(await scimServiceProviderConfig({ config }), "scimServiceProviderConfig")
      expectEnterpriseGate(await scimResourceTypes({ config }), "scimResourceTypes")
      expectEnterpriseGate(await scimResourceTypes({ config, name: "User" }), "scimResourceTypes/User")
      expectEnterpriseGate(await scimSchemas({ config }), "scimSchemas")
      expectEnterpriseGate(
        await scimSchemas({ config, id: "urn:ietf:params:scim:schemas:core:2.0:User" }),
        "scimSchemas/User",
      )
    },
    { timeout: 30_000 },
  )

  test(
    "Me answers the enterprise gate before its documented 501",
    async () => {
      // No helper exists for /Me (inventory: pin the absence). On enterprise
      // servers this is 501 `not implemented`; on community the enterprise
      // gate in `crates/scim/src/request.rs` rejects it first with 403.
      const credentials = Buffer.from(`${config.username ?? ""}:${config.password ?? ""}`).toString("base64")
      const response = await fetch(`${config.baseUrl}/scim/v2/Me`, {
        headers: { Accept: "application/scim+json", Authorization: `Basic ${credentials}` },
      })
      expect(response.status).toBe(403)
      const payload = (await response.json()) as { status?: string; detail?: string }
      expect(payload.status).toBe("403")
      expect(payload.detail).toContain("Enterprise edition")
      console.info(`E2E scimMe run=${runId}: pinned community 403 (enterprise would be 501)`)
    },
    { timeout: 30_000 },
  )
})
