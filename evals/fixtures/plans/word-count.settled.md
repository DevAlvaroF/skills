# Word count

## Request

Word count: add `wordCount(text)` to src/text.js that says how many words a text holds, 0 for blank text. Export
it and test it.

## Plan

1. Add `wordCount(text)` to `src/text.js` beside `capitalize`, and export it.
2. Split `text` on whitespace and count the tokens holding at least one letter or digit; blank or whitespace-only
   text returns 0, and so does punctuation-only text such as `--`.
3. Test it in `test/text.test.js` through the exported function with `node:test`, as the `capitalize` test does:
   one word, several words, extra spaces, blank text, a punctuation-only token.

## Open questions

- Does a punctuation-only token like `--` count as a word? Answer (user): no; a word holds at least one letter or
  digit.
