/** Upper-cases the first character of `text`. */
export function capitalize(text) {
  return text.length === 0 ? text : text[0].toUpperCase() + text.slice(1)
}

/** A URL-safe slug of `text`: lower-case ASCII letters and digits, every other run one hyphen. */
export function slugify(text) {
  return text.toLowerCase().replace(/\W+/g, '-')
}
