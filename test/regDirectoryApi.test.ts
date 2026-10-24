import { afterEach, describe, expect, test } from "bun:test"
import type { PromiseResult } from "#result"
import { stalwartClientConfig } from "../src/client/stalwartClientConfig.js"
import { accountByEmail } from "../src/registry/directory/accountByEmail.js"
import { accountCreate } from "../src/registry/directory/accountCreate.js"
import { accountDestroy } from "../src/registry/directory/accountDestroy.js"
import { accountGet } from "../src/registry/directory/accountGet.js"
import { accountPasswordChange } from "../src/registry/directory/accountPasswordChange.js"
import { accountPasswordGet } from "../src/registry/directory/accountPasswordGet.js"
import { accountPasswordUpdate } from "../src/registry/directory/accountPasswordUpdate.js"
import { accountQuery } from "../src/registry/directory/accountQuery.js"
import { accountSet } from "../src/registry/directory/accountSet.js"
import { accountSettingsGet } from "../src/registry/directory/accountSettingsGet.js"
import { accountSettingsUpdate } from "../src/registry/directory/accountSettingsUpdate.js"
import { accountUpdate } from "../src/registry/directory/accountUpdate.js"
import { apiKeyCreate } from "../src/registry/directory/apiKeyCreate.js"
import { apiKeyDestroy } from "../src/registry/directory/apiKeyDestroy.js"
import { apiKeyGet } from "../src/registry/directory/apiKeyGet.js"
import { apiKeyQuery } from "../src/registry/directory/apiKeyQuery.js"
import { apiKeySet } from "../src/registry/directory/apiKeySet.js"
import { apiKeyUpdate } from "../src/registry/directory/apiKeyUpdate.js"
import { appPasswordCreate } from "../src/registry/directory/appPasswordCreate.js"
import { appPasswordDestroy } from "../src/registry/directory/appPasswordDestroy.js"
import { appPasswordGet } from "../src/registry/directory/appPasswordGet.js"
import { appPasswordQuery } from "../src/registry/directory/appPasswordQuery.js"
import { appPasswordSet } from "../src/registry/directory/appPasswordSet.js"
import { appPasswordUpdate } from "../src/registry/directory/appPasswordUpdate.js"
import { authenticationGet } from "../src/registry/directory/authenticationGet.js"
import { authenticationUpdate } from "../src/registry/directory/authenticationUpdate.js"
import { directoryCreate } from "../src/registry/directory/directoryCreate.js"
import { directoryDestroy } from "../src/registry/directory/directoryDestroy.js"
import { directoryGet } from "../src/registry/directory/directoryGet.js"
import { directoryQuery } from "../src/registry/directory/directoryQuery.js"
import { directorySet } from "../src/registry/directory/directorySet.js"
import { directoryUpdate } from "../src/registry/directory/directoryUpdate.js"
import { groupCreate } from "../src/registry/directory/groupCreate.js"
import { groupQuery } from "../src/registry/directory/groupQuery.js"
import { mailingListCreate } from "../src/registry/directory/mailingListCreate.js"
import { mailingListDestroy } from "../src/registry/directory/mailingListDestroy.js"
import { mailingListGet } from "../src/registry/directory/mailingListGet.js"
import { mailingListQuery } from "../src/registry/directory/mailingListQuery.js"
import { mailingListSet } from "../src/registry/directory/mailingListSet.js"
import { mailingListUpdate } from "../src/registry/directory/mailingListUpdate.js"
import { maskedEmailCreate } from "../src/registry/directory/maskedEmailCreate.js"
import { maskedEmailDestroy } from "../src/registry/directory/maskedEmailDestroy.js"
import { maskedEmailGet } from "../src/registry/directory/maskedEmailGet.js"
import { maskedEmailQuery } from "../src/registry/directory/maskedEmailQuery.js"
import { maskedEmailSet } from "../src/registry/directory/maskedEmailSet.js"
import { maskedEmailUpdate } from "../src/registry/directory/maskedEmailUpdate.js"
import { oauthClientCreate } from "../src/registry/directory/oauthClientCreate.js"
import { oauthClientDestroy } from "../src/registry/directory/oauthClientDestroy.js"
import { oauthClientGet } from "../src/registry/directory/oauthClientGet.js"
import { oauthClientQuery } from "../src/registry/directory/oauthClientQuery.js"
import { oauthClientSet } from "../src/registry/directory/oauthClientSet.js"
import { oauthClientUpdate } from "../src/registry/directory/oauthClientUpdate.js"
import { oidcProviderGet } from "../src/registry/directory/oidcProviderGet.js"
import { oidcProviderUpdate } from "../src/registry/directory/oidcProviderUpdate.js"
import { publicKeyCreate } from "../src/registry/directory/publicKeyCreate.js"
import { publicKeyDestroy } from "../src/registry/directory/publicKeyDestroy.js"
import { publicKeyGet } from "../src/registry/directory/publicKeyGet.js"
import { publicKeyQuery } from "../src/registry/directory/publicKeyQuery.js"
import { publicKeySet } from "../src/registry/directory/publicKeySet.js"
import { publicKeyUpdate } from "../src/registry/directory/publicKeyUpdate.js"
import { roleCreate } from "../src/registry/directory/roleCreate.js"
import { roleDestroy } from "../src/registry/directory/roleDestroy.js"
import { roleGet } from "../src/registry/directory/roleGet.js"
import { roleQuery } from "../src/registry/directory/roleQuery.js"
import { roleSet } from "../src/registry/directory/roleSet.js"
import { roleUpdate } from "../src/registry/directory/roleUpdate.js"
import { tenantCreate } from "../src/registry/directory/tenantCreate.js"
import { tenantDestroy } from "../src/registry/directory/tenantDestroy.js"
import { tenantGet } from "../src/registry/directory/tenantGet.js"
import { tenantQuery } from "../src/registry/directory/tenantQuery.js"
import { tenantSet } from "../src/registry/directory/tenantSet.js"
import { tenantUpdate } from "../src/registry/directory/tenantUpdate.js"
import { userCreate } from "../src/registry/directory/userCreate.js"
import { userQuery } from "../src/registry/directory/userQuery.js"
import { fetchMockCreate, fetchMockJson } from "./fetchMock.js"
import { jmapTestSessionCreate } from "./jmapTestSession.js"

const config = stalwartClientConfig({ baseUrl: "https://mail.example.com", username: "admin", password: "pw" })
if (!config.success) throw new Error("fixture config invalid")

type SentCall = { using: string[]; methodCalls: [string, Record<string, unknown>, string][] }
type AnyOp = (options: Record<string, unknown>) => PromiseResult<unknown>

function asOp(fn: (options: never) => PromiseResult<unknown>): AnyOp {
  return fn as unknown as AnyOp
}

function directoryMockCreate(respond: (method: string) => Record<string, unknown>) {
  const sent: SentCall[] = []
  const mock = fetchMockCreate((request) => {
    if (new URL(request.url).pathname === "/jmap/session") return fetchMockJson(jmapTestSessionCreate())
    const body = JSON.parse(String(request.body)) as SentCall
    sent.push(body)
    const method = body.methodCalls[0]?.[0] as string
    return fetchMockJson({ methodResponses: [[method, respond(method), "c1"]], sessionState: "1" })
  })
  return { mock, sent }
}

const STALWART_USING = ["urn:ietf:params:jmap:core", "urn:stalwart:jmap"]

describe("directory get wrappers send x:<Type>/get with ids", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  const getOps: { label: string; fn: AnyOp; method: string }[] = [
    { label: "accountGet", fn: asOp(accountGet), method: "x:Account/get" },
    { label: "roleGet", fn: asOp(roleGet), method: "x:Role/get" },
    { label: "tenantGet", fn: asOp(tenantGet), method: "x:Tenant/get" },
    { label: "mailingListGet", fn: asOp(mailingListGet), method: "x:MailingList/get" },
    { label: "oauthClientGet", fn: asOp(oauthClientGet), method: "x:OAuthClient/get" },
    { label: "apiKeyGet", fn: asOp(apiKeyGet), method: "x:ApiKey/get" },
    { label: "appPasswordGet", fn: asOp(appPasswordGet), method: "x:AppPassword/get" },
    { label: "maskedEmailGet", fn: asOp(maskedEmailGet), method: "x:MaskedEmail/get" },
    { label: "publicKeyGet", fn: asOp(publicKeyGet), method: "x:PublicKey/get" },
    { label: "directoryGet", fn: asOp(directoryGet), method: "x:Directory/get" },
  ]

  for (const { label, fn, method } of getOps) {
    test(`${label} sends ${method} with the stalwart capability and ids`, async () => {
      const m = directoryMockCreate(() => ({ list: [{ id: "x1" }], notFound: [] }))
      mock = m.mock
      const r = await fn({ config: config.data, ids: ["x1"], properties: ["name"] })
      expect(r.success).toBe(true)
      expect(m.sent[0]?.using).toEqual(STALWART_USING)
      expect(m.sent[0]?.methodCalls[0]).toEqual([method, { ids: ["x1"], properties: ["name"] }, "c1"])
    })
  }

  const singletonGets: { label: string; fn: AnyOp; method: string }[] = [
    { label: "accountPasswordGet", fn: asOp(accountPasswordGet), method: "x:AccountPassword/get" },
    { label: "accountSettingsGet", fn: asOp(accountSettingsGet), method: "x:AccountSettings/get" },
    { label: "authenticationGet", fn: asOp(authenticationGet), method: "x:Authentication/get" },
    { label: "oidcProviderGet", fn: asOp(oidcProviderGet), method: "x:OidcProvider/get" },
  ]

  for (const { label, fn, method } of singletonGets) {
    test(`${label} fills in ids ["singleton"] when ids are omitted`, async () => {
      const m = directoryMockCreate(() => ({ list: [{ id: "singleton" }], notFound: [] }))
      mock = m.mock
      const r = await fn({ config: config.data })
      expect(r.success).toBe(true)
      expect(m.sent[0]?.using).toEqual(STALWART_USING)
      expect(m.sent[0]?.methodCalls[0]).toEqual([method, { ids: ["singleton"] }, "c1"])
    })
  }
})

describe("directory query wrappers send x:<Type>/query", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  const queryOps: { label: string; fn: AnyOp; method: string }[] = [
    { label: "accountQuery", fn: asOp(accountQuery), method: "x:Account/query" },
    { label: "roleQuery", fn: asOp(roleQuery), method: "x:Role/query" },
    { label: "tenantQuery", fn: asOp(tenantQuery), method: "x:Tenant/query" },
    { label: "mailingListQuery", fn: asOp(mailingListQuery), method: "x:MailingList/query" },
    { label: "oauthClientQuery", fn: asOp(oauthClientQuery), method: "x:OAuthClient/query" },
    { label: "apiKeyQuery", fn: asOp(apiKeyQuery), method: "x:ApiKey/query" },
    { label: "appPasswordQuery", fn: asOp(appPasswordQuery), method: "x:AppPassword/query" },
    { label: "maskedEmailQuery", fn: asOp(maskedEmailQuery), method: "x:MaskedEmail/query" },
    { label: "publicKeyQuery", fn: asOp(publicKeyQuery), method: "x:PublicKey/query" },
    { label: "directoryQuery", fn: asOp(directoryQuery), method: "x:Directory/query" },
  ]

  for (const { label, fn, method } of queryOps) {
    test(`${label} sends ${method} with filter and limit`, async () => {
      const m = directoryMockCreate(() => ({ ids: ["x1"], position: 0, queryState: "s" }))
      mock = m.mock
      const r = await fn({ config: config.data, filter: { name: "x" }, limit: 5 })
      expect(r.success).toBe(true)
      expect(m.sent[0]?.using).toEqual(STALWART_USING)
      expect(m.sent[0]?.methodCalls[0]).toEqual([method, { filter: { name: "x" }, limit: 5 }, "c1"])
    })
  }

  test("userQuery merges an @type User filter over x:Account/query", async () => {
    const m = directoryMockCreate(() => ({ ids: ["u1"], position: 0, queryState: "s" }))
    mock = m.mock
    const r = await userQuery({ config: config.data, filter: { name: "alice" } })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.methodCalls[0]).toEqual(["x:Account/query", { filter: { "@type": "User", name: "alice" } }, "c1"])
  })

  test("groupQuery merges an @type Group filter over x:Account/query", async () => {
    const m = directoryMockCreate(() => ({ ids: ["g1"], position: 0, queryState: "s" }))
    mock = m.mock
    const r = await groupQuery({ config: config.data })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.methodCalls[0]).toEqual(["x:Account/query", { filter: { "@type": "Group" } }, "c1"])
  })
})

describe("directory set wrappers create through x:<Type>/set", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  const setOps: { label: string; fn: AnyOp; method: string }[] = [
    { label: "accountSet", fn: asOp(accountSet), method: "x:Account/set" },
    { label: "roleSet", fn: asOp(roleSet), method: "x:Role/set" },
    { label: "tenantSet", fn: asOp(tenantSet), method: "x:Tenant/set" },
    { label: "mailingListSet", fn: asOp(mailingListSet), method: "x:MailingList/set" },
    { label: "oauthClientSet", fn: asOp(oauthClientSet), method: "x:OAuthClient/set" },
    { label: "apiKeySet", fn: asOp(apiKeySet), method: "x:ApiKey/set" },
    { label: "appPasswordSet", fn: asOp(appPasswordSet), method: "x:AppPassword/set" },
    { label: "maskedEmailSet", fn: asOp(maskedEmailSet), method: "x:MaskedEmail/set" },
    { label: "publicKeySet", fn: asOp(publicKeySet), method: "x:PublicKey/set" },
    { label: "directorySet", fn: asOp(directorySet), method: "x:Directory/set" },
  ]

  for (const { label, fn, method } of setOps) {
    test(`${label} sends ${method} with the create payload`, async () => {
      const m = directoryMockCreate(() => ({ created: { c1: { id: "n1" } } }))
      mock = m.mock
      const r = await fn({ config: config.data, create: { c1: { name: "n" } } })
      expect(r.success).toBe(true)
      expect(m.sent[0]?.using).toEqual(STALWART_USING)
      expect(m.sent[0]?.methodCalls[0]).toEqual([method, { create: { c1: { name: "n" } } }, "c1"])
    })

    test(`${label} turns a notCreated entry into a ResultErr`, async () => {
      const m = directoryMockCreate(() => ({
        notCreated: { c1: { type: "invalidProperties", description: "bad property" } },
      }))
      mock = m.mock
      const r = await fn({ config: config.data, create: { c1: { name: "n" } } })
      expect(r.success).toBe(false)
      if (!r.success) {
        // Thin wrappers propagate the generic layer error unchanged.
        expect(r.op).toBe("registrySet")
        expect(r.errorMessage).toContain("invalidProperties")
      }
      expect(m.sent).toHaveLength(1)
    })
  }

  const singletonUpdates: { label: string; fn: AnyOp; method: string }[] = [
    { label: "accountPasswordUpdate", fn: asOp(accountPasswordUpdate), method: "x:AccountPassword/set" },
    { label: "accountSettingsUpdate", fn: asOp(accountSettingsUpdate), method: "x:AccountSettings/set" },
    { label: "authenticationUpdate", fn: asOp(authenticationUpdate), method: "x:Authentication/set" },
    { label: "oidcProviderUpdate", fn: asOp(oidcProviderUpdate), method: "x:OidcProvider/set" },
    { label: "accountPasswordChange", fn: asOp(accountPasswordChange), method: "x:AccountPassword/set" },
  ]

  for (const { label, fn, method } of singletonUpdates) {
    test(`${label} turns a notUpdated entry into a ResultErr`, async () => {
      const m = directoryMockCreate(() => ({
        notUpdated: { singleton: { type: "forbidden", description: "nope" } },
      }))
      mock = m.mock
      const options =
        label === "accountPasswordChange"
          ? { config: config.data, currentSecret: "old", newSecret: "new" }
          : { config: config.data, patch: { description: "x" } }
      const r = await fn(options)
      expect(r.success).toBe(false)
      if (!r.success) {
        // Thin wrappers propagate the generic layer error unchanged.
        expect(r.op).toBe("registrySet")
        expect(r.errorMessage).toContain("forbidden")
      }
    })
  }
})

describe("directory focused create/update/destroy helpers", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  const creates: { label: string; fn: AnyOp; method: string; field: string; createdKey: string }[] = [
    { label: "accountCreate", fn: asOp(accountCreate), method: "x:Account/set", field: "account", createdKey: "c1" },
    { label: "roleCreate", fn: asOp(roleCreate), method: "x:Role/set", field: "role", createdKey: "c1" },
    { label: "tenantCreate", fn: asOp(tenantCreate), method: "x:Tenant/set", field: "tenant", createdKey: "c1" },
    {
      label: "mailingListCreate",
      fn: asOp(mailingListCreate),
      method: "x:MailingList/set",
      field: "mailingList",
      createdKey: "c1",
    },
    {
      label: "oauthClientCreate",
      fn: asOp(oauthClientCreate),
      method: "x:OAuthClient/set",
      field: "oauthClient",
      createdKey: "c1",
    },
    {
      label: "maskedEmailCreate",
      fn: asOp(maskedEmailCreate),
      method: "x:MaskedEmail/set",
      field: "maskedEmail",
      createdKey: "c1",
    },
    {
      label: "publicKeyCreate",
      fn: asOp(publicKeyCreate),
      method: "x:PublicKey/set",
      field: "publicKey",
      createdKey: "c1",
    },
    {
      label: "directoryCreate",
      fn: asOp(directoryCreate),
      method: "x:Directory/set",
      field: "directory",
      createdKey: "c1",
    },
  ]

  for (const { label, fn, method, field, createdKey } of creates) {
    test(`${label} creates one entry and returns the created record`, async () => {
      const m = directoryMockCreate(() => ({ created: { [createdKey]: { id: "n1" } } }))
      mock = m.mock
      const payload = { name: "n" }
      const r = await fn({ config: config.data, [field]: payload })
      expect(r.success).toBe(true)
      if (r.success) expect(r.data).toEqual({ id: "n1" })
      expect(m.sent[0]?.methodCalls[0]).toEqual([method, { create: { [createdKey]: payload } }, "c1"])
    })
  }

  test("accountCreate reports a missing created record instead of undefined", async () => {
    const m = directoryMockCreate(() => ({}))
    mock = m.mock
    const r = await accountCreate({ config: config.data, account: { name: "n" } })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("accountCreate")
  })

  const updates: { label: string; fn: AnyOp; method: string }[] = [
    { label: "accountUpdate", fn: asOp(accountUpdate), method: "x:Account/set" },
    { label: "roleUpdate", fn: asOp(roleUpdate), method: "x:Role/set" },
    { label: "tenantUpdate", fn: asOp(tenantUpdate), method: "x:Tenant/set" },
    { label: "mailingListUpdate", fn: asOp(mailingListUpdate), method: "x:MailingList/set" },
    { label: "oauthClientUpdate", fn: asOp(oauthClientUpdate), method: "x:OAuthClient/set" },
    { label: "apiKeyUpdate", fn: asOp(apiKeyUpdate), method: "x:ApiKey/set" },
    { label: "appPasswordUpdate", fn: asOp(appPasswordUpdate), method: "x:AppPassword/set" },
    { label: "maskedEmailUpdate", fn: asOp(maskedEmailUpdate), method: "x:MaskedEmail/set" },
    { label: "publicKeyUpdate", fn: asOp(publicKeyUpdate), method: "x:PublicKey/set" },
    { label: "directoryUpdate", fn: asOp(directoryUpdate), method: "x:Directory/set" },
  ]

  for (const { label, fn, method } of updates) {
    test(`${label} updates one entry by id`, async () => {
      const m = directoryMockCreate(() => ({ updated: { n1: null } }))
      mock = m.mock
      const r = await fn({ config: config.data, id: "n1", patch: { description: "d" } })
      expect(r.success).toBe(true)
      expect(m.sent[0]?.methodCalls[0]).toEqual([method, { update: { n1: { description: "d" } } }, "c1"])
    })
  }

  const destroys: { label: string; fn: AnyOp; method: string }[] = [
    { label: "accountDestroy", fn: asOp(accountDestroy), method: "x:Account/set" },
    { label: "roleDestroy", fn: asOp(roleDestroy), method: "x:Role/set" },
    { label: "tenantDestroy", fn: asOp(tenantDestroy), method: "x:Tenant/set" },
    { label: "mailingListDestroy", fn: asOp(mailingListDestroy), method: "x:MailingList/set" },
    { label: "oauthClientDestroy", fn: asOp(oauthClientDestroy), method: "x:OAuthClient/set" },
    { label: "apiKeyDestroy", fn: asOp(apiKeyDestroy), method: "x:ApiKey/set" },
    { label: "appPasswordDestroy", fn: asOp(appPasswordDestroy), method: "x:AppPassword/set" },
    { label: "maskedEmailDestroy", fn: asOp(maskedEmailDestroy), method: "x:MaskedEmail/set" },
    { label: "publicKeyDestroy", fn: asOp(publicKeyDestroy), method: "x:PublicKey/set" },
    { label: "directoryDestroy", fn: asOp(directoryDestroy), method: "x:Directory/set" },
  ]

  for (const { label, fn, method } of destroys) {
    test(`${label} destroys one entry by id`, async () => {
      const m = directoryMockCreate(() => ({ destroyed: ["n1"] }))
      mock = m.mock
      const r = await fn({ config: config.data, id: "n1" })
      expect(r.success).toBe(true)
      expect(m.sent[0]?.methodCalls[0]).toEqual([method, { destroy: ["n1"] }, "c1"])
    })
  }
})

describe("directory account conveniences", () => {
  let mock: ReturnType<typeof fetchMockCreate> | undefined
  afterEach(() => {
    mock?.restore()
    mock = undefined
  })

  test("userCreate sends a User with an inline password credential", async () => {
    const m = directoryMockCreate(() => ({ created: { c1: { id: "u9" } } }))
    mock = m.mock
    const r = await userCreate({ config: config.data, name: "carol", domainId: "b", password: "s3cret-x" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual({ id: "u9" })
    expect(m.sent[0]?.methodCalls[0]).toEqual([
      "x:Account/set",
      {
        create: {
          c1: {
            "@type": "User",
            name: "carol",
            domainId: "b",
            credentials: { 0: { "@type": "Password", secret: "s3cret-x" } },
          },
        },
      },
      "c1",
    ])
  })

  test("groupCreate sends a Group without credentials", async () => {
    const m = directoryMockCreate(() => ({ created: { c1: { id: "g9" } } }))
    mock = m.mock
    const r = await groupCreate({ config: config.data, name: "team", domainId: "b", description: "team group" })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.methodCalls[0]?.[1]).toEqual({
      create: { c1: { "@type": "Group", name: "team", domainId: "b", description: "team group" } },
    })
  })

  test("accountByEmail resolves the domain then filters by name and domainId", async () => {
    const m = directoryMockCreate((method) => {
      if (method === "x:Domain/query") return { ids: ["b"], position: 0, queryState: "s" }
      if (method === "x:Account/query") return { ids: ["u1"], position: 0, queryState: "s" }
      return { list: [{ id: "u1", emailAddress: "alice@example.com" }], notFound: [] }
    })
    mock = m.mock
    const r = await accountByEmail({ config: config.data, email: "alice@example.com" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.emailAddress).toBe("alice@example.com")
    expect(m.sent).toHaveLength(3)
    expect(m.sent[0]?.methodCalls[0]).toEqual(["x:Domain/query", { filter: { name: "example.com" } }, "c1"])
    expect(m.sent[1]?.methodCalls[0]).toEqual(["x:Account/query", { filter: { name: "alice", domainId: "b" } }, "c1"])
    expect(m.sent[2]?.methodCalls[0]).toEqual(["x:Account/get", { ids: ["u1"] }, "c1"])
  })

  test("accountByEmail is a ResultErr when no account has that email", async () => {
    const m = directoryMockCreate((method) =>
      method === "x:Domain/query"
        ? { ids: [], position: 0, queryState: "s" }
        : { ids: [], position: 0, queryState: "s" },
    )
    mock = m.mock
    const r = await accountByEmail({ config: config.data, email: "nobody@example.com" })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.op).toBe("accountByEmail")
      expect(r.errorMessage).toContain("nobody@example.com")
    }
    expect(m.sent).toHaveLength(1)
  })

  test("accountByEmail is a ResultErr for a malformed email without sending a request", async () => {
    const m = directoryMockCreate(() => ({ ids: [], position: 0, queryState: "s" }))
    mock = m.mock
    const r = await accountByEmail({ config: config.data, email: "not-an-email" })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("accountByEmail")
    expect(m.sent).toHaveLength(0)
  })

  test("accountPasswordChange updates the singleton with secret and currentSecret", async () => {
    const m = directoryMockCreate(() => ({ updated: { singleton: null } }))
    mock = m.mock
    const r = await accountPasswordChange({ config: config.data, currentSecret: "old-pw", newSecret: "new-pw" })
    expect(r.success).toBe(true)
    expect(m.sent[0]?.methodCalls[0]).toEqual([
      "x:AccountPassword/set",
      { update: { singleton: { secret: "new-pw", currentSecret: "old-pw" } } },
      "c1",
    ])
  })

  test("apiKeyCreate returns the id and the one-time secret", async () => {
    const m = directoryMockCreate(() => ({ created: { k1: { id: "3", secret: "API_example" } } }))
    mock = m.mock
    const r = await apiKeyCreate({ config: config.data, accountId: "u1", description: "ci key" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual({ id: "3", secret: "API_example" })
    expect(m.sent[0]?.methodCalls[0]).toEqual([
      "x:ApiKey/set",
      { accountId: "u1", create: { k1: { description: "ci key" } } },
      "c1",
    ])
  })

  test("apiKeyCreate is a ResultErr when the server withholds the secret", async () => {
    const m = directoryMockCreate(() => ({ created: { k1: { id: "3" } } }))
    mock = m.mock
    const r = await apiKeyCreate({ config: config.data, description: "ci key" })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("apiKeyCreate")
  })

  test("appPasswordCreate returns the id and the one-time secret", async () => {
    const m = directoryMockCreate(() => ({ created: { k1: { id: "4", secret: "app_example" } } }))
    mock = m.mock
    const r = await appPasswordCreate({ config: config.data, description: "phone" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual({ id: "4", secret: "app_example" })
    expect(m.sent[0]?.methodCalls[0]?.[0]).toBe("x:AppPassword/set")
  })

  test("invalid options are a ResultErr with the op name", async () => {
    const m = directoryMockCreate(() => ({}))
    mock = m.mock
    const r = await accountGet({ config: { baseUrl: "" } })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("accountGet")
    expect(m.sent).toHaveLength(0)
  })
})
