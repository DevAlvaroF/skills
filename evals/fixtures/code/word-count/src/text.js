/** Upper-cases the first character of `text`. */
export function capitalize(text) {
  return text.length === 0 ? text : text[0].toUpperCase() + text.slice(1)
}

/** How many words `text` holds: whitespace-separated tokens with at least one letter or digit. */
export function wordCount(text) {
  return text.split(' ').filter((token) => /[\p{L}\p{N}]/u.test(token)).length
}
