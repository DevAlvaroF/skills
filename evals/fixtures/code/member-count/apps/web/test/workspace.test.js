import assert from 'node:assert/strict'
import { test } from 'node:test'
import { GET } from '../app/api/v1/workspaces/[slug]/route.js'
import { createWorkspaceService } from '../lib/server/workspace.service.js'

const db = {
  workspaces: [
    { id: 'w1', slug: 'acme', name: 'Acme' },
    { id: 'w2', slug: 'solo', name: 'Solo' },
  ],
  memberships: [
    { workspaceId: 'w1', userId: 'u1', role: 'owner' },
    { workspaceId: 'w1', userId: 'u2', role: 'member' },
    { workspaceId: 'w1', userId: 'u3', role: 'member' },
    { workspaceId: 'w2', userId: 'u1', role: 'owner' },
  ],
}

const get = (slug, userId) =>
  GET(new Request(`http://localhost/api/v1/workspaces/${slug}`, { headers: userId ? { 'x-user-id': userId } : {} }),
    { params: Promise.resolve({ slug }) }, db)

test('getWorkspace returns the workspace with the member’s role and its member count', () => {
  assert.deepEqual(createWorkspaceService(db).getWorkspace('acme', 'u2'),
    { id: 'w1', slug: 'acme', name: 'Acme', role: 'member', memberCount: 3 })
  assert.equal(createWorkspaceService(db).getWorkspace('solo', 'u1').memberCount, 1)
})

test('getWorkspace hides a workspace from a non-member and a missing one', () => {
  assert.equal(createWorkspaceService(db).getWorkspace('acme', 'u9'), null)
  assert.equal(createWorkspaceService(db).getWorkspace('nope', 'u1'), null)
})

test('GET /api/v1/workspaces/:slug returns every field it returned before, plus memberCount', async () => {
  const response = await get('acme', 'u1')
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), { id: 'w1', slug: 'acme', name: 'Acme', role: 'owner', memberCount: 3 })
})

test('GET /api/v1/workspaces/:slug needs a user and a membership', async () => {
  assert.equal((await get('acme')).status, 401)
  assert.equal((await get('acme', 'u9')).status, 404)
})
