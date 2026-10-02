import { test } from 'node:test'
import assert from 'node:assert/strict'
import { capitalize, wordCount } from '../src/text.js'

test('capitalize upper-cases the first character', () => {
  assert.equal(capitalize('hello'), 'Hello')
  assert.equal(capitalize(''), '')
})

test('wordCount counts the words in a text', () => {
  assert.equal(wordCount('hello'), 1)
  assert.equal(wordCount('the quick brown fox'), 4)
  assert.equal(wordCount('  two   words  '), 2)
})

test('wordCount is 0 for blank text', () => {
  assert.equal(wordCount(''), 0)
  assert.equal(wordCount('   '), 0)
})

test('wordCount does not count a punctuation-only token', () => {
  assert.equal(wordCount('wait -- what'), 2)
})
