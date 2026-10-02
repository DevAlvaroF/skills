import { test } from 'node:test'
import assert from 'node:assert/strict'
import { capitalize, slugify } from '../src/text.js'

test('capitalize upper-cases the first character', () => {
  assert.equal(capitalize('hello'), 'Hello')
  assert.equal(capitalize(''), '')
})

test('slugify lower-cases and keeps ASCII letters and digits', () => {
  assert.equal(slugify('Hello World 2'), 'hello-world-2')
})

test('slugify turns each run of other characters into one hyphen', () => {
  assert.equal(slugify('rock & roll'), 'rock-roll')
  assert.equal(slugify('café au lait'), 'caf-au-lait')
})

test('slugify gives an empty string for an empty string', () => {
  assert.equal(slugify(''), '')
})
