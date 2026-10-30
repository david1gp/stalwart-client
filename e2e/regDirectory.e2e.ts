import { afterAll, beforeAll, describe, expect, test } from "bun:test"
import { stalwartClientConfig } from "../src/client/stalwartClientConfig.js"
import type { StalwartClientConfig } from "../src/client/stalwartClientConfigSchema.js"
import { coreEcho } from "../src/jmap/coreEcho.js"
import { jmapClientConfig } from "../src/jmap/jmapClientConfig.js"
import { registryQuery } from "../src/registry/registryQuery.js"
import { registrySet } from "../src/registry/registrySet.js"
import { accountByEmail } from "../src/registry/directory/accountByEmail.js"
import { accountDestroy } from "../src/registry/directory/accountDestroy.js"
import { accountGet } from "../src/registry/directory/accountGet.js"
import { accountPasswordChange } from "../src/registry/directory/accountPasswordChange.js"
import { accountPasswordGet } from "../src/registry/directory/accountPasswordGet.js"
import { accountQuery } from "../src/registry/directory/accountQuery.js"
import { accountSettingsGet } from "../src/registry/directory/accountSettingsGet.js"
import { accountSettingsUpdate } from "../src/registry/directory/accountSettingsUpdate.js"
import { accountUpdate } from "../src/registry/directory/accountUpdate.js"
import { apiKeyCreate } from "../src/registry/directory/apiKeyCreate.js"
import { apiKeyDestroy } from "../src/registry/directory/apiKeyDestroy.js"
import { apiKeyQuery } from "../src/registry/directory/apiKeyQuery.js"
import { appPasswordCreate } from "../src/registry/directory/appPasswordCreate.js"
import { appPasswordDestroy } from "../src/registry/directory/appPasswordDestroy.js"
import { authenticationGet } from "../src/registry/directory/authenticationGet.js"
import { authenticationUpdate } from "../src/registry/directory/authenticationUpdate.js"
import { directoryCreate } from "../src/registry/directory/directoryCreate.js"
import { directoryDestroy } from "../src/registry/directory/directoryDestroy.js"
import { directoryGet } from "../src/registry/directory/directoryGet.js"
import { groupCreate } from "../src/registry/directory/groupCreate.js"
import { groupQuery } from "../src/registry/directory/groupQuery.js"
import { mailingListCreate } from "../src/registry/directory/mailingListCreate.js"
import { mailingListDestroy } from "../src/registry/directory/mailingListDestroy.js"
import { mailingListGet } from "../src/registry/directory/mailingListGet.js"
import { maskedEmailQuery } from "../src/registry/directory/maskedEmailQuery.js"
import { oauthClientCreate } from "../src/registry/directory/oauthClientCreate.js"
import { oauthClientDestroy } from "../src/registry/directory/oauthClientDestroy.js"
import { oauthClientGet } from "../src/registry/directory/oauthClientGet.js"
import { oidcProviderGet } from "../src/registry/directory/oidcProviderGet.js"
import { oidcProviderUpdate } from "../src/registry/directory/oidcProviderUpdate.js"
import { publicKeyCreate } from "../src/registry/directory/publicKeyCreate.js"
import { publicKeyDestroy } from "../src/registry/directory/publicKeyDestroy.js"
import { roleCreate } from "../src/registry/directory/roleCreate.js"
import { roleDestroy } from "../src/registry/directory/roleDestroy.js"
import { roleGet } from "../src/registry/directory/roleGet.js"
import { tenantCreate } from "../src/registry/directory/tenantCreate.js"
import { tenantDestroy } from "../src/registry/directory/tenantDestroy.js"
import { tenantGet } from "../src/registry/directory/tenantGet.js"
import { tenantQuery } from "../src/registry/directory/tenantQuery.js"
import { userCreate } from "../src/registry/directory/userCreate.js"
import { userQuery } from "../src/registry/directory/userQuery.js"
import { e2eRunId } from "./e2eRunId.js"
import { stalwartE2eSetup } from "./e2eSetup.js"

let config: StalwartClientConfig
let userConfig: StalwartClientConfig
const runId = e2eRunId()
const domainName = `e2e-dir-${runId}.test`
const userName = `u-${runId}`
const groupName = `g-${runId}`
const initPassword = `Init-${runId}-9kQ!xZ`
const newPassword = `New-${runId}-7wT#vY`
let userEmail = ""

const created: {
  domainId?: string
  userId?: string
  groupId?: string
  roleId?: string
  mailingListId?: string
  oauthClientId?: string
  apiKeyId?: string
  apiKeySecret?: string
  appPasswordId?: string
  appPasswordSecret?: string
  publicKeyId?: string
  directoryId?: string
} = {}

// Throwaway PGP public key (generated for e2e; never used to encrypt).
const TEST_PGP_PUBLIC_KEY = `-----BEGIN PGP PUBLIC KEY BLOCK-----

mQENBGrc9VUBCADY3dZidtoA7kfbZnoJ9VaT/DQZd6BNwt5N/OpjVb1pC1HONozI
n9qMZA1weUxQA+7sRQmtTyaKHUlyvvtgjNdgQmjkW/Z5vBytLrf2Bln7x4Gxfb0I
xg7RXSExftaabF5ifpvMC76g8L/DlbCTd+X6Iy6D4W3H3fD58hvE8AMiMKPk0fqe
KYi2/1IKoCda0Luf8y+VBMHXkgim4RXxawV4aFaqNVKbafnIVS7G/dQcAnzRWZQa
9sJa7CHsWLo6HJfWAEUSuh1bznHnicz4tO7gvacniXzx6Re79M5cWWOekbwAeJ2X
m9wUlTA83Fb77LMR6J8Rg+Q7tvm6ViUGSCAhABEBAAG0CGUyZUB0ZXN0iQFUBBMB
CgA+FiEEguWTQw5LmYDDCPNO0hcH1XHlRq0FAmrc9VUCGw8FCQWjmoAFCwkIBwIG
FQoJCAsCBBYCAwECHgECF4AACgkQ0hcH1XHlRq2O2QgAm6aEt8+8kpzNURgaY6BG
V2B6Iv0FeHN3Ntb+kd6G7wWTVl7Ylo7FopDpen3kBc2XkLiEnTZhvXrspReJHwFr
qqNTMZvsRA+SxTIYeevpJBpxd1a+s1TaGZYUSOacuJYE9S85DHUE3tzcXyyjFBQO
Ky/em1ci3mgLbuQWgpgdgClhBugJgIzW1Oe/ieYQkXetkFOkCCFZUreT+N5H3yl1
NwK66umZpGf3LvYdyJECGkvsSXmeuBi/uBlFdTFjabr8ppeKZ1ZZbFGpMB8nMHGb
APpRCzDbcpw+tnYENVGGZquTSfQWx5LYdj9AT0n/nDMaIUKkpgTvug5Oq9SqOKHu
bA==
=PjWw
-----END PGP PUBLIC KEY BLOCK-----
`

function requireSuccess<T>(
  r: { success: boolean; errorMessage?: string; errorData?: string | null },
  what: string,
): void {
  if (!r.success) throw new Error(`${what} failed: ${r.errorMessage} ${r.errorData ?? ""}`)
}

beforeAll(async () => {
  config = await stalwartE2eSetup()
  userEmail = `${userName}@${domainName}`
})

afterAll(async () => {
  // Strict reverse-order, best-effort teardown of run-scoped objects only.
  const destroy = async (what: string, fn: () => Promise<{ success: boolean; errorMessage?: string }>) => {
    try {
      const r = await fn()
      if (!r.success) console.warn(`teardown: ${what} not removed: ${r.errorMessage}`)
    } catch (error) {
      console.warn(`teardown: ${what} threw: ${String(error)}`)
    }
  }
  if (created.directoryId !== undefined) {
    const id = created.directoryId
    await destroy(`directory ${id}`, () => directoryDestroy({ config, id }))
  }
  if (created.publicKeyId !== undefined) {
    const id = created.publicKeyId
    await destroy(`public key ${id}`, () => publicKeyDestroy({ config, id }))
  }
  if (created.oauthClientId !== undefined) {
    const id = created.oauthClientId
    await destroy(`oauth client ${id}`, () => oauthClientDestroy({ config, id }))
  }
  if (created.mailingListId !== undefined) {
    const id = created.mailingListId
    await destroy(`mailing list ${id}`, () => mailingListDestroy({ config, id }))
  }
  if (created.roleId !== undefined) {
    const id = created.roleId
    await destroy(`role ${id}`, () => roleDestroy({ config, id }))
  }
  if (created.appPasswordId !== undefined && created.userId !== undefined) {
    const id = created.appPasswordId
    const accountId = created.userId
    await destroy(`app password ${id}`, () => appPasswordDestroy({ config, id, accountId }))
  }
  if (created.apiKeyId !== undefined && created.userId !== undefined) {
    const id = created.apiKeyId
    const accountId = created.userId
    await destroy(`api key ${id}`, () => apiKeyDestroy({ config, id, accountId }))
  }
  // The user references the group via memberGroupIds, so the user must go
  // first: destroying the group while a member exists fails objectIsLinked.
  if (created.userId !== undefined) {
    const id = created.userId
    await destroy(`user ${id}`, () => accountDestroy({ config, id }))
  }
  if (created.groupId !== undefined) {
    const id = created.groupId
    await destroy(`group ${id}`, () => accountDestroy({ config, id }))
  }
  if (created.domainId !== undefined) {
    const signatures = await registryQuery({
      config,
      objectType: "DkimSignature",
      filter: { domainId: created.domainId },
    })
    if (signatures.success && signatures.data.ids.length > 0) {
      const removed = await registrySet({
        config,
        objectType: "DkimSignature",
        destroy: signatures.data.ids.map(String),
      })
      if (!removed.success) console.warn(`teardown: DKIM signatures not removed: ${removed.errorMessage}`)
    }
    const removed = await registrySet({ config, objectType: "Domain", destroy: [created.domainId] })
    if (!removed.success) console.warn(`teardown: domain ${domainName} not removed: ${removed.errorMessage}`)
  }
})

describe("e2e directory: users, groups and lookups on a run-scoped domain", () => {
  test(
    "registrySet creates the run-scoped domain",
    async () => {
      const r = await registrySet({ config, objectType: "Domain", create: { d1: { name: domainName } } })
      requireSuccess(r, "domain create")
      if (!r.success) throw new Error("unreachable")
      created.domainId = r.data.created?.d1?.id
      expect(created.domainId).toBeString()
    },
    { timeout: 30_000 },
  )

  test(
    "userCreate and groupCreate provision accounts under the domain",
    async () => {
      const user = await userCreate({
        config,
        name: userName,
        domainId: created.domainId as string,
        password: initPassword,
      })
      requireSuccess(user, "user create")
      if (!user.success) throw new Error("unreachable")
      created.userId = user.data.id
      expect(created.userId).toBeString()
      const group = await groupCreate({ config, name: groupName, domainId: created.domainId as string })
      requireSuccess(group, "group create")
      if (!group.success) throw new Error("unreachable")
      created.groupId = group.data.id
      expect(created.groupId).toBeString()
      const configured = stalwartClientConfig({ baseUrl: config.baseUrl, username: userEmail, password: initPassword })
      requireSuccess(configured, "user config")
      if (!configured.success) throw new Error("unreachable")
      userConfig = configured.data
    },
    { timeout: 30_000 },
  )

  test(
    "accountUpdate adds the user to the group and both are queryable",
    async () => {
      const updated = await accountUpdate({
        config,
        id: created.userId as string,
        patch: { memberGroupIds: { [created.groupId as string]: true }, description: `e2e run ${runId}` },
      })
      requireSuccess(updated, "add user to group")
      const fetched = await accountGet({ config, ids: [created.userId as string] })
      requireSuccess(fetched, "account get")
      if (!fetched.success) throw new Error("unreachable")
      expect(fetched.data.list[0]?.description).toBe(`e2e run ${runId}`)
      const users = await userQuery({ config, filter: { name: userName } })
      requireSuccess(users, "user query")
      if (!users.success) throw new Error("unreachable")
      expect(users.data.ids.map(String)).toContain(created.userId as string)
      const groups = await groupQuery({ config, filter: { name: groupName } })
      requireSuccess(groups, "group query")
      if (!groups.success) throw new Error("unreachable")
      expect(groups.data.ids.map(String)).toContain(created.groupId as string)
      const byName = await accountQuery({ config, filter: { name: userName } })
      requireSuccess(byName, "account query")
      if (!byName.success) throw new Error("unreachable")
      expect(byName.data.ids.map(String)).toContain(created.userId as string)
      const byEmail = await accountByEmail({ config, email: userEmail })
      requireSuccess(byEmail, "account by email")
      if (!byEmail.success) throw new Error("unreachable")
      expect(byEmail.data.id).toBe(created.userId as string)
      const ownPassword = await accountPasswordGet({ config, accountId: created.userId as string })
      requireSuccess(ownPassword, "account password get")
      if (!ownPassword.success) throw new Error("unreachable")
      expect(ownPassword.data.list[0]?.id).toBe("singleton")
    },
    { timeout: 30_000 },
  )
})

describe("e2e directory: roles, mailing lists, oauth clients, public keys", () => {
  test(
    "roleCreate and roleDestroy round-trip a throwaway role",
    async () => {
      const role = await roleCreate({
        config,
        role: { description: `e2e role ${runId}`, disabledPermissions: {}, enabledPermissions: {}, roleIds: {} },
      })
      requireSuccess(role, "role create")
      if (!role.success) throw new Error("unreachable")
      created.roleId = role.data.id
      const fetched = await roleGet({ config, ids: [created.roleId] })
      requireSuccess(fetched, "role get")
      if (!fetched.success) throw new Error("unreachable")
      expect(fetched.data.list[0]?.description).toBe(`e2e role ${runId}`)
      const destroyed = await roleDestroy({ config, id: created.roleId })
      requireSuccess(destroyed, "role destroy")
      created.roleId = undefined
    },
    { timeout: 30_000 },
  )

  test(
    "mailingListCreate and mailingListDestroy round-trip a list with the user as recipient",
    async () => {
      const list = await mailingListCreate({
        config,
        mailingList: {
          name: `list-${runId}`,
          domainId: created.domainId as string,
          aliases: {},
          recipients: { [userEmail]: true },
        },
      })
      requireSuccess(list, "mailing list create")
      if (!list.success) throw new Error("unreachable")
      created.mailingListId = list.data.id
      const fetched = await mailingListGet({ config, ids: [created.mailingListId] })
      requireSuccess(fetched, "mailing list get")
      if (!fetched.success) throw new Error("unreachable")
      expect(fetched.data.list[0]?.emailAddress).toBe(`list-${runId}@${domainName}`)
      const destroyed = await mailingListDestroy({ config, id: created.mailingListId })
      requireSuccess(destroyed, "mailing list destroy")
      created.mailingListId = undefined
    },
    { timeout: 30_000 },
  )

  test(
    "oauthClientCreate and oauthClientDestroy round-trip a throwaway client",
    async () => {
      const client = await oauthClientCreate({
        config,
        oauthClient: {
          clientId: `e2e-${runId}`,
          contacts: {},
          redirectUris: { "http://127.0.0.1:1/cb": true },
        },
      })
      requireSuccess(client, "oauth client create")
      if (!client.success) throw new Error("unreachable")
      created.oauthClientId = client.data.id
      const fetched = await oauthClientGet({ config, ids: [created.oauthClientId] })
      requireSuccess(fetched, "oauth client get")
      if (!fetched.success) throw new Error("unreachable")
      expect(fetched.data.list[0]?.clientId).toBe(`e2e-${runId}`)
      const destroyed = await oauthClientDestroy({ config, id: created.oauthClientId })
      requireSuccess(destroyed, "oauth client destroy")
      created.oauthClientId = undefined
    },
    { timeout: 30_000 },
  )

  test(
    "publicKeyCreate and publicKeyDestroy round-trip a throwaway PGP key",
    async () => {
      const key = await publicKeyCreate({
        config,
        publicKey: {
          accountId: created.userId as string,
          description: `e2e key ${runId}`,
          emailAddresses: { [userEmail]: true },
          key: TEST_PGP_PUBLIC_KEY,
        },
      })
      requireSuccess(key, "public key create")
      if (!key.success) throw new Error("unreachable")
      created.publicKeyId = key.data.id
      const destroyed = await publicKeyDestroy({ config, id: created.publicKeyId })
      requireSuccess(destroyed, "public key destroy")
      created.publicKeyId = undefined
    },
    { timeout: 30_000 },
  )
})

describe("e2e directory: user credentials and password change", () => {
  test(
    "apiKeyCreate returns a secret that authenticates as Bearer",
    async () => {
      const key = await apiKeyCreate({ config, accountId: created.userId as string, description: `e2e ${runId}` })
      requireSuccess(key, "api key create")
      if (!key.success) throw new Error("unreachable")
      created.apiKeyId = key.data.id
      created.apiKeySecret = key.data.secret
      expect(key.data.secret.startsWith("API_")).toBe(true)
      const ownKeys = await apiKeyQuery({ config: userConfig })
      requireSuccess(ownKeys, "user api key self-query")
      if (!ownKeys.success) throw new Error("unreachable")
      expect(ownKeys.data.ids.map(String)).toContain(created.apiKeyId)
      const bearer = jmapClientConfig({ baseUrl: config.baseUrl, token: created.apiKeySecret })
      requireSuccess(bearer, "bearer config")
      if (!bearer.success) throw new Error("unreachable")
      const echo = await coreEcho({ config: bearer.data, args: { ping: runId } })
      requireSuccess(echo, "bearer core echo")
      if (!echo.success) throw new Error("unreachable")
      expect(echo.data).toEqual({ ping: runId })
    },
    { timeout: 30_000 },
  )

  test(
    "appPasswordCreate returns a secret that authenticates as a Basic password",
    async () => {
      const pass = await appPasswordCreate({ config, accountId: created.userId as string, description: `e2e ${runId}` })
      requireSuccess(pass, "app password create")
      if (!pass.success) throw new Error("unreachable")
      created.appPasswordId = pass.data.id
      created.appPasswordSecret = pass.data.secret
      const basic = jmapClientConfig({
        baseUrl: config.baseUrl,
        username: userEmail,
        password: created.appPasswordSecret,
      })
      requireSuccess(basic, "app password config")
      if (!basic.success) throw new Error("unreachable")
      const echo = await coreEcho({ config: basic.data, args: { ping: runId } })
      requireSuccess(echo, "app password core echo")
      if (!echo.success) throw new Error("unreachable")
      expect(echo.data).toEqual({ ping: runId })
    },
    { timeout: 30_000 },
  )

  test(
    "accountPasswordChange rotates the user password",
    async () => {
      const changed = await accountPasswordChange({
        config: userConfig,
        currentSecret: initPassword,
        newSecret: newPassword,
      })
      requireSuccess(changed, "password change")
      // Basic credentials are cached server-side, so the new secret may take a moment to propagate.
      let lastError = ""
      for (let attempt = 0; attempt < 10; attempt += 1) {
        const login = jmapClientConfig({ baseUrl: config.baseUrl, username: userEmail, password: newPassword })
        if (!login.success) throw new Error("login config invalid")
        const echo = await coreEcho({ config: login.data, args: { ping: runId } })
        if (echo.success) {
          expect(echo.data).toEqual({ ping: runId })
          return
        }
        lastError = echo.errorMessage
        await Bun.sleep(1000)
      }
      throw new Error(`new password login never succeeded: ${lastError}`)
    },
    { timeout: 30_000 },
  )
})

describe("e2e directory: singletons, enterprise pins and external directories", () => {
  test(
    "authenticationGet applies a reversible update",
    async () => {
      const before = await authenticationGet({ config })
      requireSuccess(before, "authentication get")
      if (!before.success) throw new Error("unreachable")
      const original = before.data.list[0]?.minPasswordLength as number
      expect(original).toBeNumber()
      const bumped = await authenticationUpdate({ config, patch: { minPasswordLength: original + 1 } })
      requireSuccess(bumped, "authentication update")
      const mid = await authenticationGet({ config, properties: ["minPasswordLength"] })
      requireSuccess(mid, "authentication re-get")
      if (!mid.success) throw new Error("unreachable")
      expect(mid.data.list[0]?.minPasswordLength).toBe(original + 1)
      const restored = await authenticationUpdate({ config, patch: { minPasswordLength: original } })
      requireSuccess(restored, "authentication restore")
    },
    { timeout: 30_000 },
  )

  test(
    "oidcProviderGet applies a reversible update",
    async () => {
      const before = await oidcProviderGet({ config })
      requireSuccess(before, "oidc provider get")
      if (!before.success) throw new Error("unreachable")
      const original = before.data.list[0]?.accessTokenExpiry as number
      expect(original).toBeNumber()
      const bumped = await oidcProviderUpdate({ config, patch: { accessTokenExpiry: original + 1 } })
      requireSuccess(bumped, "oidc provider update")
      const mid = await oidcProviderGet({ config, properties: ["accessTokenExpiry"] })
      requireSuccess(mid, "oidc provider re-get")
      if (!mid.success) throw new Error("unreachable")
      expect(mid.data.list[0]?.accessTokenExpiry).toBe(original + 1)
      const restored = await oidcProviderUpdate({ config, patch: { accessTokenExpiry: original } })
      requireSuccess(restored, "oidc provider restore")
    },
    { timeout: 30_000 },
  )

  test(
    "accountSettingsGet applies a reversible description update",
    async () => {
      const before = await accountSettingsGet({ config })
      requireSuccess(before, "account settings get")
      if (!before.success) throw new Error("unreachable")
      expect(before.data.list[0]?.id).toBe("singleton")
      const marked = await accountSettingsUpdate({ config, patch: { description: `e2e ${runId}` } })
      requireSuccess(marked, "account settings update")
      const mid = await accountSettingsGet({ config, properties: ["description"] })
      requireSuccess(mid, "account settings re-get")
      if (!mid.success) throw new Error("unreachable")
      expect(mid.data.list[0]?.description).toBe(`e2e ${runId}`)
      const restored = await accountSettingsUpdate({ config, patch: { description: null } })
      requireSuccess(restored, "account settings restore")
    },
    { timeout: 30_000 },
  )

  test(
    "tenantCreate and tenantDestroy round-trip a throwaway tenant",
    async () => {
      // Tenant is marked schema:enterprise in the inventory but is NOT
      // runtime-gated on community (unlike MaskedEmail): the full lifecycle works.
      const tenant = await tenantCreate({
        config,
        tenant: {
          name: `e2e-tenant-${runId}`,
          permissions: { "@type": "Inherit" },
          quotas: {},
          roles: { "@type": "Default" },
        },
      })
      requireSuccess(tenant, "tenant create")
      if (!tenant.success) throw new Error("unreachable")
      const tenantId = tenant.data.id
      const fetched = await tenantGet({ config, ids: [tenantId] })
      requireSuccess(fetched, "tenant get")
      if (!fetched.success) throw new Error("unreachable")
      expect(fetched.data.list[0]?.name).toBe(`e2e-tenant-${runId}`)
      // Tenant exposes only a free-text index (no name filter;
      // crates/registry/src/schema/properties_impl.rs Tenant arm), so list all.
      const queried = await tenantQuery({ config })
      requireSuccess(queried, "tenant query")
      if (!queried.success) throw new Error("unreachable")
      expect(queried.data.ids.map(String)).toContain(tenantId)
      const destroyed = await tenantDestroy({ config, id: tenantId })
      requireSuccess(destroyed, "tenant destroy")
    },
    { timeout: 30_000 },
  )

  test(
    "maskedEmailQuery pins the community-edition enterprise gate",
    async () => {
      const r = await maskedEmailQuery({ config })
      expect(r.success).toBe(false)
      if (!r.success) expect(r.errorMessage).toContain("Enterprise")
    },
    { timeout: 30_000 },
  )

  test(
    "directoryCreate and directoryDestroy round-trip an unusable LDAP directory",
    async () => {
      const dir = await directoryCreate({
        config,
        directory: {
          "@type": "Ldap",
          url: "ldap://127.0.0.1:1",
          baseDn: "dc=e2e-dir",
          description: `e2e ${runId}`,
          allowInvalidCerts: true,
          useTls: false,
          bindSecret: { "@type": "None" },
        },
      })
      requireSuccess(dir, "directory create")
      if (!dir.success) throw new Error("unreachable")
      created.directoryId = dir.data.id
      const fetched = await directoryGet({ config, ids: [created.directoryId] })
      requireSuccess(fetched, "directory get")
      if (!fetched.success) throw new Error("unreachable")
      // Never contacted unless used for authentication; destroyed right away.
      const destroyed = await directoryDestroy({ config, id: created.directoryId })
      requireSuccess(destroyed, "directory destroy")
      created.directoryId = undefined
    },
    { timeout: 30_000 },
  )
})
