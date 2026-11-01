import assert from 'node:assert/strict'
import { test } from 'node:test'
import { linkGuest } from '../packages/auth/src/server.js'

const link = (from, to) => ({ anonymousUser: { user: { id: from } }, newUser: { user: { id: to } } })

test('a guest keeps their chats and credits in a new account', async () => {
  const chats = [{ id: 'c1', userId: 'guest' }, { id: 'c2', userId: 'u1' }, { id: 'c3', userId: 'guest' }]
  const db = { chats, aiCredit: [{ userId: 'guest', credits: 3 }] }
  await linkGuest(db)(link('guest', 'new'))
  assert.deepEqual(db.chats.map((chat) => chat.userId), ['new', 'u1', 'new'])
  assert.deepEqual(db.aiCredit, [{ userId: 'new', credits: 3 }])
})

test("a guest's credits are added to an account that already has some", async () => {
  const db = { chats: [], aiCredit: [{ userId: 'guest', credits: 3 }, { userId: 'u1', credits: 2 }] }
  await linkGuest(db)(link('guest', 'u1'))
  assert.deepEqual(db.aiCredit, [{ userId: 'u1', credits: 5 }])
})
