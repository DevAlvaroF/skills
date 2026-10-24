import assert from 'node:assert/strict'
import { test } from 'node:test'
import { GET } from '../app/api/v1/workspaces/[slug]/route.js'
import { createWorkspaceService } from '../lib/server/workspace.service.js'

const db = {
  workspaces: [{ id: 'w1', slug: 'acme', name: 'Acme' }],
  memberships: [
    { workspaceId: 'w1', userId: 'u1', role: 'owner' },
    { workspaceId: 'w1', userId: 'u2', role: 'member' },
  ],
}

const get = (slug, userId) =>
  GET(new Request(`http://localhost/api/v1/workspaces/${slug}`, { headers: userId ? { 'x-user-id': userId } : {} }),
    { params: Promise.resolve({ slug }) }, db)

test('getWorkspace returns the workspace with the member’s role', () => {
  assert.deepEqual(createWorkspaceService(db).getWorkspace('acme', 'u2'), { id: 'w1', slug: 'acme', name: 'Acme', role: 'member' })
})

test('getWorkspace hides a workspace from a non-member and a missing one', () => {
  assert.equal(createWorkspaceService(db).getWorkspace('acme', 'u9'), null)
  assert.equal(createWorkspaceService(db).getWorkspace('nope', 'u1'), null)
})

test('GET /api/v1/workspaces/:slug returns the workspace', async () => {
  const response = await get('acme', 'u1')
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), { id: 'w1', slug: 'acme', name: 'Acme', role: 'owner' })
})

test('GET /api/v1/workspaces/:slug needs a user and a membership', async () => {
  assert.equal((await get('acme')).status, 401)
  assert.equal((await get('acme', 'u9')).status, 404)
})
