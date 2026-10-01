# Slugify

## Problem Statement

Titles in text-kit cannot be turned into URL-safe identifiers, so every caller hand-rolls its own lower-casing and
character stripping, and two callers produce different identifiers for the same title.

## Solution

text-kit exports `slugify(text)`, which turns any title into one predictable, URL-safe slug.

## User Stories

- **US-001** — As a library user, I want `slugify` to lower-case a title and keep its ASCII letters and digits, so that
  the slug reads like the title.
- **US-002** — As a library user, I want every run of other characters to become one hyphen, so that a slug never holds
  spaces, punctuation or doubled hyphens.
- **US-003** — As a library user, I want no leading or trailing hyphen, so that slugs join cleanly into paths.
- **US-004** — As a library user, I want an empty string to give an empty string, so that blank titles need no special
  case.

## Implementation Decisions

- `slugify` is a pure function in the text module beside `capitalize`, exported from it.
- Only ASCII letters and digits survive; every other character, non-ASCII letters included, is a separator. There is
  no transliteration.

## Testing Decisions

Tests call the exported `slugify` through the module's public interface with `node:test`, as the existing
`capitalize` tests do, and assert on the returned string only. The user confirmed this boundary.

## Out of Scope

- Transliterating non-ASCII letters.
- Making slugs unique across a collection.

## Further Notes

Open question: should `slugify` cap a slug's length? Not decided yet.

## Decision log

- One function, no options object: every caller asked for the same behaviour.
- Non-ASCII letters are separators rather than transliterated, because transliteration needs a locale table the
  library does not carry.
