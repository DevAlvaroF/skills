# Word count

## Request

Word count: add `wordCount(text)` to src/text.js that says how many words a text holds, 0 for blank text. Export
it and test it.

## Plan

1. Add `wordCount(text)` to `src/text.js` beside `capitalize`, and export it.
2. Find the words in `text` and return how many there are; blank or whitespace-only text returns 0.
3. Test it in `test/text.test.js` through the exported function with `node:test`, as the `capitalize` test does:
   one word, several words, extra spaces, blank text.

## Notes

Not decided yet: does a punctuation-only token like `--` count as a word?
