import { afterEach, describe, expect, test } from "bun:test"
import { stalwartClientConfig } from "../src/client/stalwartClientConfig.js"
import { scimCommands } from "../src/scim/cli/scimCommands.js"
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
import { fetchMockCreate, fetchMockJson } from "./fetchMock.js"

const config = stalwartClientConfig({ baseUrl: "https://mail.example.com", token: "API_x" })
if (!config.success) throw new Error("fixture config invalid")

const scimErrorBody = {
  schemas: ["urn:ietf:params:scim:api:messages:2.0:Error"],
  detail:
    "SCIM provisioning is only available in the Enterprise edition. Obtain your trial license at https://license.stalw.art/trial.",
  status: "403",
}

type SentRequest = { method: string; url: URL; headers: Record<string, string>; body: unknown }

function scimMockCreate(handler: (request: SentRequest) => Response) {
  const sent: { method: string; url: string; headers: Record<string, string>; body: unknown }[] = []
  const mock = fetchMockCreate((request) => {
    const url = new URL(request.url)
    const body = typeof request.body === "string" && request.body.length > 0 ? JSON.parse(request.body) : undefined
    sent.push({ method: request.method, url: request.url, headers: request.headers, body })
    return handler({ method: request.method, url, headers: request.headers, body })
  })
  return { mock, sent }
}

describe("scim user collection routes", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("user query sends a GET with filter, paging and comma-joined attributes", async () => {
    const m = scimMockCreate(() =>
      fetchMockJson({
        schemas: ["urn:ietf:params:scim:api:messages:2.0:ListResponse"],
        totalResults: 1,
        startIndex: 1,
        Resources: [{ userName: "alice@example.test" }],
      }),
    )
    mock = m.mock
    const r = await scimUserQuery({
      config: config.data,
      filter: 'userName eq "alice@example.test"',
      count: 10,
      startIndex: 1,
      sortOrder: "ascending",
      attributes: ["userName", "displayName"],
    })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.totalResults).toBe(1)
      expect(r.data.Resources[0]?.userName).toBe("alice@example.test")
    }
    expect(m.sent).toHaveLength(1)
    expect(m.sent[0]?.method).toBe("GET")
    const url = new URL(m.sent[0]?.url ?? "")
    expect(url.pathname).toBe("/scim/v2/Users")
    expect(url.searchParams.get("filter")).toBe('userName eq "alice@example.test"')
    expect(url.searchParams.get("count")).toBe("10")
    expect(url.searchParams.get("sortOrder")).toBe("ascending")
    expect(url.searchParams.get("attributes")).toBe("userName,displayName")
    expect(m.sent[0]?.headers["Accept"]).toBe("application/scim+json")
    expect(m.sent[0]?.headers["Authorization"]).toBe("Bearer API_x")
  })

  test("user create posts the user as SCIM JSON and keeps extension attributes", async () => {
    const m = scimMockCreate(() => fetchMockJson({ userName: "alice@example.test", id: "c" }, 201, "Created"))
    mock = m.mock
    const r = await scimUserCreate({
      config: config.data,
      user: {
        userName: "alice@example.test",
        displayName: "Alice",
        active: true,
        "urn:ietf:params:scim:schemas:extension:enterprise:2.0:User": { employeeNumber: "42" },
      },
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.id).toBe("c")
    expect(m.sent[0]?.method).toBe("POST")
    expect(new URL(m.sent[0]?.url ?? "").pathname).toBe("/scim/v2/Users")
    expect(m.sent[0]?.headers["Content-Type"]).toBe("application/scim+json")
    const body = m.sent[0]?.body as Record<string, unknown>
    expect(body["userName"]).toBe("alice@example.test")
    expect(body["urn:ietf:params:scim:schemas:extension:enterprise:2.0:User"]).toEqual({ employeeNumber: "42" })
  })

  test("user create without a userName is a client-side ResultErr", async () => {
    const m = scimMockCreate(() => fetchMockJson({}))
    mock = m.mock
    const r = await scimUserCreate({
      config: config.data,
      // Deliberately missing the required userName: exercises runtime validation.
      user: { displayName: "No Name" } as unknown as { userName: string },
    })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("scimUserCreate")
    expect(m.sent).toHaveLength(0)
  })

  test("user search posts a SearchRequest body to Users/.search", async () => {
    const m = scimMockCreate(() =>
      fetchMockJson({
        schemas: ["urn:ietf:params:scim:api:messages:2.0:ListResponse"],
        totalResults: 0,
        Resources: [],
      }),
    )
    mock = m.mock
    const r = await scimUserSearch({ config: config.data, filter: "active eq true", attributes: ["userName"] })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.method).toBe("POST")
    expect(new URL(m.sent[0]?.url ?? "").pathname).toBe("/scim/v2/Users/.search")
    const body = m.sent[0]?.body as Record<string, unknown>
    expect(body["schemas"]).toEqual(["urn:ietf:params:scim:api:messages:2.0:SearchRequest"])
    expect(body["filter"]).toBe("active eq true")
    expect(body["attributes"]).toEqual(["userName"])
  })
})

describe("scim user item routes", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("user get encodes the id and asks for selected attributes", async () => {
    const m = scimMockCreate(() => fetchMockJson({ id: "c", userName: "alice@example.test" }))
    mock = m.mock
    const r = await scimUserGet({ config: config.data, id: "c", attributes: ["userName"] })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.userName).toBe("alice@example.test")
    expect(m.sent[0]?.method).toBe("GET")
    const url = new URL(m.sent[0]?.url ?? "")
    expect(url.pathname).toBe("/scim/v2/Users/c")
    expect(url.searchParams.get("attributes")).toBe("userName")
  })

  test("user replace puts the full resource", async () => {
    const m = scimMockCreate(() =>
      fetchMockJson({ id: "c", userName: "alice@example.test", displayName: "A. Liddell" }),
    )
    mock = m.mock
    const r = await scimUserReplace({
      config: config.data,
      id: "c",
      user: { userName: "alice@example.test", displayName: "A. Liddell" },
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.displayName).toBe("A. Liddell")
    expect(m.sent[0]?.method).toBe("PUT")
    expect(new URL(m.sent[0]?.url ?? "").pathname).toBe("/scim/v2/Users/c")
    expect((m.sent[0]?.body as Record<string, unknown>)["displayName"]).toBe("A. Liddell")
  })

  test("user patch sends PatchOp operations with a capital O", async () => {
    const m = scimMockCreate(() => fetchMockJson({ id: "c", userName: "alice@example.test", displayName: "Alice L." }))
    mock = m.mock
    const r = await scimUserPatch({
      config: config.data,
      id: "c",
      operations: [{ op: "replace", path: "displayName", value: "Alice L." }],
    })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.method).toBe("PATCH")
    const body = m.sent[0]?.body as Record<string, unknown>
    expect(body["schemas"]).toEqual(["urn:ietf:params:scim:api:messages:2.0:PatchOp"])
    expect(body["Operations"]).toEqual([{ op: "replace", path: "displayName", value: "Alice L." }])
  })

  test("user patch refuses an empty operations list without sending", async () => {
    const m = scimMockCreate(() => fetchMockJson({}))
    mock = m.mock
    const r = await scimUserPatch({ config: config.data, id: "c", operations: [] })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("scimUserPatch")
    expect(m.sent).toHaveLength(0)
  })

  test("user delete sends a DELETE and resolves undefined on 204", async () => {
    const m = scimMockCreate(() => new Response(null, { status: 204, statusText: "No Content" }))
    mock = m.mock
    const r = await scimUserDelete({ config: config.data, id: "c" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toBeUndefined()
    expect(m.sent[0]?.method).toBe("DELETE")
    expect(new URL(m.sent[0]?.url ?? "").pathname).toBe("/scim/v2/Users/c")
  })
})

describe("scim group routes", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("group query sends a GET to Groups with the filter", async () => {
    const m = scimMockCreate(() =>
      fetchMockJson({
        schemas: ["urn:ietf:params:scim:api:messages:2.0:ListResponse"],
        totalResults: 1,
        Resources: [{ displayName: "admins" }],
      }),
    )
    mock = m.mock
    const r = await scimGroupQuery({ config: config.data, filter: 'displayName eq "admins"' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.Resources[0]?.displayName).toBe("admins")
    expect(m.sent[0]?.method).toBe("GET")
    const url = new URL(m.sent[0]?.url ?? "")
    expect(url.pathname).toBe("/scim/v2/Groups")
    expect(url.searchParams.get("filter")).toBe('displayName eq "admins"')
  })

  test("group create posts the group resource", async () => {
    const m = scimMockCreate(() => fetchMockJson({ id: "e", displayName: "admins" }, 201, "Created"))
    mock = m.mock
    const r = await scimGroupCreate({ config: config.data, group: { displayName: "admins" } })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.id).toBe("e")
    expect(m.sent[0]?.method).toBe("POST")
    expect(new URL(m.sent[0]?.url ?? "").pathname).toBe("/scim/v2/Groups")
    expect((m.sent[0]?.body as Record<string, unknown>)["displayName"]).toBe("admins")
  })

  test("group create without a displayName is a client-side ResultErr", async () => {
    const m = scimMockCreate(() => fetchMockJson({}))
    mock = m.mock
    const r = await scimGroupCreate({
      config: config.data,
      // Deliberately missing the required displayName: exercises runtime validation.
      group: { externalId: "g-1" } as unknown as { displayName: string },
    })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("scimGroupCreate")
    expect(m.sent).toHaveLength(0)
  })

  test("group search posts a SearchRequest body to Groups/.search", async () => {
    const m = scimMockCreate(() =>
      fetchMockJson({
        schemas: ["urn:ietf:params:scim:api:messages:2.0:ListResponse"],
        totalResults: 0,
        Resources: [],
      }),
    )
    mock = m.mock
    const r = await scimGroupSearch({ config: config.data, count: 5 })
    expect(r.success).toBe(true)
    expect(new URL(m.sent[0]?.url ?? "").pathname).toBe("/scim/v2/Groups/.search")
    expect((m.sent[0]?.body as Record<string, unknown>)["count"]).toBe(5)
  })

  test("group get fetches one group by id", async () => {
    const m = scimMockCreate(() => fetchMockJson({ id: "e", displayName: "admins", members: [] }))
    mock = m.mock
    const r = await scimGroupGet({ config: config.data, id: "e" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.displayName).toBe("admins")
    expect(m.sent[0]?.method).toBe("GET")
    expect(new URL(m.sent[0]?.url ?? "").pathname).toBe("/scim/v2/Groups/e")
  })

  test("group replace puts the full resource", async () => {
    const m = scimMockCreate(() => fetchMockJson({ id: "e", displayName: "super-admins" }))
    mock = m.mock
    const r = await scimGroupReplace({ config: config.data, id: "e", group: { displayName: "super-admins" } })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.method).toBe("PUT")
    expect((m.sent[0]?.body as Record<string, unknown>)["displayName"]).toBe("super-admins")
  })

  test("group patch sends member operations", async () => {
    const m = scimMockCreate(() => fetchMockJson({ id: "e", displayName: "admins" }))
    mock = m.mock
    const r = await scimGroupPatch({
      config: config.data,
      id: "e",
      operations: [{ op: "add", path: "members", value: [{ value: "c" }] }],
    })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.method).toBe("PATCH")
    const body = m.sent[0]?.body as Record<string, unknown>
    expect(body["Operations"]).toEqual([{ op: "add", path: "members", value: [{ value: "c" }] }])
  })

  test("group delete sends a DELETE and resolves undefined on 204", async () => {
    const m = scimMockCreate(() => new Response(null, { status: 204, statusText: "No Content" }))
    mock = m.mock
    const r = await scimGroupDelete({ config: config.data, id: "e" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toBeUndefined()
    expect(m.sent[0]?.method).toBe("DELETE")
    expect(new URL(m.sent[0]?.url ?? "").pathname).toBe("/scim/v2/Groups/e")
  })
})

describe("scim bulk and cross-resource search", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("bulk posts BulkRequest operations with a capital O", async () => {
    const m = scimMockCreate(() =>
      fetchMockJson({
        schemas: ["urn:ietf:params:scim:api:messages:2.0:BulkResponse"],
        Operations: [{ method: "POST", bulkId: "u1", location: "/scim/v2/Users/c", status: "201" }],
      }),
    )
    mock = m.mock
    const r = await scimBulk({
      config: config.data,
      failOnErrors: 1,
      operations: [{ method: "POST", path: "/Users", bulkId: "u1", data: { userName: "carol@example.test" } }],
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.Operations[0]?.status).toBe("201")
    expect(m.sent[0]?.method).toBe("POST")
    expect(new URL(m.sent[0]?.url ?? "").pathname).toBe("/scim/v2/Bulk")
    const body = m.sent[0]?.body as Record<string, unknown>
    expect(body["schemas"]).toEqual(["urn:ietf:params:scim:api:messages:2.0:BulkRequest"])
    expect(body["failOnErrors"]).toBe(1)
    expect(body["Operations"]).toEqual([
      { method: "POST", path: "/Users", bulkId: "u1", data: { userName: "carol@example.test" } },
    ])
  })

  test("bulk refuses an empty operations list without sending", async () => {
    const m = scimMockCreate(() => fetchMockJson({}))
    mock = m.mock
    const r = await scimBulk({ config: config.data, operations: [] })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("scimBulk")
    expect(m.sent).toHaveLength(0)
  })

  test("cross-resource search posts to .search", async () => {
    const m = scimMockCreate(() =>
      fetchMockJson({
        schemas: ["urn:ietf:params:scim:api:messages:2.0:ListResponse"],
        totalResults: 2,
        startIndex: 1,
        Resources: [{ userName: "alice@example.test" }, { displayName: "admins" }],
      }),
    )
    mock = m.mock
    const r = await scimSearchAll({ config: config.data, startIndex: 1, count: 10 })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.totalResults).toBe(2)
    expect(m.sent[0]?.method).toBe("POST")
    expect(new URL(m.sent[0]?.url ?? "").pathname).toBe("/scim/v2/.search")
  })
})

describe("scim discovery routes", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("service provider config fetches the capabilities document", async () => {
    const m = scimMockCreate(() =>
      fetchMockJson({
        schemas: ["urn:ietf:params:scim:schemas:core:2.0:ServiceProviderConfig"],
        patch: { supported: true },
        bulk: { supported: true, maxOperations: 1000, maxPayloadSize: 1048576 },
        authenticationSchemes: [{ type: "oauthbearertoken", name: "OAuth Bearer Token" }],
      }),
    )
    mock = m.mock
    const r = await scimServiceProviderConfig({ config: config.data })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.patch.supported).toBe(true)
      expect(r.data.bulk.maxOperations).toBe(1000)
    }
    expect(m.sent[0]?.method).toBe("GET")
    expect(new URL(m.sent[0]?.url ?? "").pathname).toBe("/scim/v2/ServiceProviderConfig")
  })

  test("resource types lists both definitions without a name", async () => {
    const m = scimMockCreate(() =>
      fetchMockJson({
        schemas: ["urn:ietf:params:scim:api:messages:2.0:ListResponse"],
        totalResults: 2,
        startIndex: 1,
        Resources: [
          { name: "User", endpoint: "/Users" },
          { name: "Group", endpoint: "/Groups" },
        ],
      }),
    )
    mock = m.mock
    const r = await scimResourceTypes({ config: config.data })
    expect(r.success).toBe(true)
    if (r.success && "Resources" in r.data) expect(r.data.Resources).toHaveLength(2)
    expect(new URL(m.sent[0]?.url ?? "").pathname).toBe("/scim/v2/ResourceTypes")
  })

  test("resource types fetches one definition with a name", async () => {
    const m = scimMockCreate(() => fetchMockJson({ name: "User", endpoint: "/Users" }))
    mock = m.mock
    const r = await scimResourceTypes({ config: config.data, name: "User" })
    expect(r.success).toBe(true)
    if (r.success && !("Resources" in r.data)) expect(r.data.endpoint).toBe("/Users")
    expect(new URL(m.sent[0]?.url ?? "").pathname).toBe("/scim/v2/ResourceTypes/User")
  })

  test("schemas lists both schema definitions without an id", async () => {
    const m = scimMockCreate(() =>
      fetchMockJson({
        schemas: ["urn:ietf:params:scim:api:messages:2.0:ListResponse"],
        totalResults: 2,
        startIndex: 1,
        Resources: [{ id: "urn:ietf:params:scim:schemas:core:2.0:User" }],
      }),
    )
    mock = m.mock
    const r = await scimSchemas({ config: config.data })
    expect(r.success).toBe(true)
    expect(new URL(m.sent[0]?.url ?? "").pathname).toBe("/scim/v2/Schemas")
  })

  test("schemas fetches one schema by URL-encoded URN", async () => {
    const m = scimMockCreate(() => fetchMockJson({ id: "urn:ietf:params:scim:schemas:core:2.0:User", name: "User" }))
    mock = m.mock
    const r = await scimSchemas({ config: config.data, id: "urn:ietf:params:scim:schemas:core:2.0:User" })
    expect(r.success).toBe(true)
    if (r.success && !("Resources" in r.data)) expect(r.data.name).toBe("User")
    const url = new URL(m.sent[0]?.url ?? "")
    expect(url.pathname).toBe("/scim/v2/Schemas/urn%3Aietf%3Aparams%3Ascim%3Aschemas%3Acore%3A2.0%3AUser")
  })
})

describe("scim CLI route map", () => {
  type RouteTarget = {
    getAllEntries?: () => readonly { name: { original: string }; target: RouteTarget }[]
  }

  function routePaths(map: RouteTarget, prefix: string[] = []): string[] {
    const paths: string[] = []
    for (const entry of map.getAllEntries?.() ?? []) {
      const at = [...prefix, entry.name.original]
      if (entry.target.getAllEntries !== undefined) paths.push(...routePaths(entry.target, at))
      else paths.push(at.join(" "))
    }
    return paths
  }

  test("every scim operation is reachable through the route map", () => {
    const paths = routePaths(scimCommands as unknown as RouteTarget)
    for (const resource of ["user", "group"]) {
      for (const action of ["query", "create", "search", "get", "replace", "patch", "delete"]) {
        expect(paths).toContain(`${resource} ${action}`)
      }
    }
    expect(paths).toContain("bulk")
    expect(paths).toContain("search-all")
    expect(paths).toContain("service-provider-config")
    expect(paths).toContain("resource-types")
    expect(paths).toContain("schemas")
  })
})

describe("scim error mapping", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("enterprise-gate 403 becomes a ResultErr with the SCIM detail and JSON errorData", async () => {
    const m = scimMockCreate(() => fetchMockJson(scimErrorBody, 403, "Forbidden"))
    mock = m.mock
    const r = await scimUserQuery({ config: config.data, count: 1 })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.op).toBe("scimUserQuery")
      expect(r.errorMessage).toContain("403")
      expect(r.errorMessage).toContain("Enterprise edition")
      const payload = JSON.parse(r.errorData ?? "{}") as { status?: string; detail?: string }
      expect(payload.status).toBe("403")
      expect(payload.detail).toContain("Enterprise edition")
    }
  })

  test("not-found 404 carries the op of the failing call", async () => {
    const m = scimMockCreate(() =>
      fetchMockJson(
        { schemas: ["urn:ietf:params:scim:api:messages:2.0:Error"], detail: "Not Found", status: "404" },
        404,
        "Not Found",
      ),
    )
    mock = m.mock
    const r = await scimGroupGet({ config: config.data, id: "zzz" })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.op).toBe("scimGroupGet")
      expect(r.errorMessage).toContain("404")
    }
  })

  test("invalid options are a ResultErr with the op and send nothing", async () => {
    const m = scimMockCreate(() => fetchMockJson({}))
    mock = m.mock
    const r = await scimUserGet({ config: { baseUrl: "" }, id: "c" })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("scimUserGet")
    expect(m.sent).toHaveLength(0)
  })
})
