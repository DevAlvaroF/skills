import { test } from 'node:test'
import assert from 'node:assert/strict'
import { capitalize } from '../src/text.js'

test('capitalize upper-cases the first character', () => {
  assert.equal(capitalize('hello'), 'Hello')
  assert.equal(capitalize(''), '')
})
