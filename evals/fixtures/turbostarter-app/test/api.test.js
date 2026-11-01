import assert from 'node:assert/strict'
import { test } from 'node:test'
import { postChat } from '../packages/api/src/modules/ai/chat.js'
import { getMembers } from '../packages/api/src/modules/organization/router.js'

const seed = () => ({
  users: [{ id: 'u1' }, { id: 'u2' }, { id: 'u3' }],
  aiCredit: [{ userId: 'u1', credits: 2 }, { userId: 'u2', credits: 0 }],
  members: [
    { organizationId: 'o1', userId: 'u1', role: 'owner' },
    { organizationId: 'o1', userId: 'u2', role: 'member' },
  ],
  subscriptions: [],
})

const post = (userId) =>
  new Request('http://localhost/api/ai/chat', {
    method: 'POST',
    headers: userId ? { 'x-user-id': userId } : {},
    body: JSON.stringify({ prompt: 'hi' }),
  })

test('chat charges one credit before the model runs', async () => {
  const db = seed()
  const response = await postChat(post('u1'), db, async (prompt) => `echo ${prompt}`)
  assert.deepEqual(await response.json(), { reply: 'echo hi' })
  assert.equal(db.aiCredit[0].credits, 1)
})

test('chat refuses a user without credits and never calls the model', async () => {
  let called = false
  await assert.rejects(postChat(post('u2'), seed(), async () => (called = true)), { status: 422 })
  assert.equal(called, false)
})

test('chat refunds the credit when the model fails', async () => {
  const db = seed()
  await assert.rejects(postChat(post('u1'), db, async () => { throw new Error('down') }))
  assert.equal(db.aiCredit[0].credits, 2)
})

test('members are visible to members and hidden from everyone else', async () => {
  const db = seed()
  assert.equal((await getMembers(post('u2'), db, 'o1').json()).length, 2)
  assert.throws(() => getMembers(post('u3'), db, 'o1'), { status: 403 })
  assert.throws(() => getMembers(post(), db, 'o1'), { status: 401 })
})
